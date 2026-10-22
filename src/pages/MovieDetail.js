import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaPlay,
  FaArrowLeft,
  FaHeart,
  FaBookmark,
  FaShareAlt,
  FaEye,
  FaCalendarAlt,
  FaFilm,
  FaCheck,
  FaVolumeUp,
  FaComments,
  FaPaperPlane,
} from "react-icons/fa";
import { getMovie, getMovies } from "../services/movieService";
import { getComments, createComment } from "../services/commentService";
import MovieCard from "../components/MovieCard";
import "./MovieDetail.css";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const playerRef = useRef(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const foundMovie = await getMovie(id);
        if (isMounted && foundMovie) {
          const currentViews = Number(foundMovie.views) || 0;
          setMovie({
            ...foundMovie,
            views: currentViews + 1,
            likes: Number(foundMovie.likes) || 120,
            rating: Number(foundMovie.rating) || 4.8,
          });
          setUserRating(Number(foundMovie.rating) || 4.8);

          // Tải danh sách phim tương tự cùng thể loại
          const allMovies = await getMovies();
          if (isMounted && Array.isArray(allMovies)) {
            const filtered = allMovies
              .filter(
                (m) =>
                  String(m.id || m._id) !== String(id) &&
                  (!foundMovie.genre ||
                    m.genre?.toLowerCase() === foundMovie.genre?.toLowerCase())
              )
              .slice(0, 6);
            setSimilarMovies(filtered);
          }

          // Tải danh sách bình luận của phim
          try {
            const movieComments = await getComments(id);
            if (isMounted && Array.isArray(movieComments)) {
              setComments(movieComments);
            }
          } catch (commErr) {
            console.error("Lỗi khi tải bình luận:", commErr);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết phim:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMovieData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="movie-detail-container">
        <div className="detail-loading-box">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-container">
        <div className="detail-top-nav">
          <Link to="/movies" className="detail-back-btn">
            <FaArrowLeft /> Quay lại danh sách phim
          </Link>
        </div>
        <div className="detail-loading-box">
          <h2>Không tìm thấy bộ phim này!</h2>
          <Link to="/movies" className="btn-watch-primary" style={{ marginTop: 16 }}>
            Khám phá phim khác
          </Link>
        </div>
      </div>
    );
  }

  // Chuyển đổi YouTube link sang dạng embed chuẩn nếu cần
  const getEmbedVideoUrl = (url) => {
    if (!url) return "";
    let cleanUrl = url.trim();
    if (cleanUrl.includes("watch?v=")) {
      return cleanUrl.replace("watch?v=", "embed/");
    }
    if (cleanUrl.includes("youtu.be/")) {
      const vidId = cleanUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    return cleanUrl;
  };

  const handleLike = () => {
    if (hasLiked) {
      setMovie((prev) => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
      setHasLiked(false);
    } else {
      setMovie((prev) => ({ ...prev, likes: prev.likes + 1 }));
      setHasLiked(true);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleRating = (score) => {
    setUserRating(score);
    setMovie((prev) => ({ ...prev, rating: score }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const scrollToPlayer = () => {
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      alert("Vui lòng nhập nội dung bình luận.");
      return;
    }

    const authorName = storedUser?.username || guestName.trim() || "Khán giả";
    const authorEmail = storedUser?.email || "";

    setIsSubmitting(true);
    try {
      const created = await createComment({
        movieId: String(id),
        movieTitle: movie?.title || "Phim",
        userName: authorName,
        userEmail: authorEmail,
        content: newCommentText.trim(),
        rating: commentRating,
      });

      setComments((prev) => [created, ...prev]);
      setNewCommentText("");
      setGuestName("");
      alert("Đã gửi đánh giá & bình luận thành công!");
    } catch (err) {
      alert(err.message || "Lỗi khi gửi bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarBg = (name) => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#10b981",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "Vừa xong";
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString("vi-VN")} lúc ${d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return "Gần đây";
    }
  };

  const formatViews = (val) => {
    const num = Number(val) || 0;
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;
  };

  const embedUrl = getEmbedVideoUrl(movie.videoUrl);

  return (
    <div className="movie-detail-container">
      {/* 1. TOP BREADCRUMB */}
      <div className="detail-top-nav">
        <Link to="/movies" className="detail-back-btn">
          <FaArrowLeft /> Quay lại danh sách phim
        </Link>
      </div>

      {/* 2. CINEMATIC HERO SECTION */}
      <section
        className="detail-hero-section"
        style={{
          backgroundImage: `url(${movie.image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600"})`,
        }}
      >
        <div className="detail-hero-backdrop-overlay"></div>

        <div className="detail-hero-content">
          {/* Left Poster */}
          <div className="detail-poster-wrapper">
            <img
              src={movie.image || "/logo.svg"}
              alt={movie.title}
              className="detail-poster-img"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500";
              }}
            />
            <span className="detail-poster-badge">FULL HD</span>
          </div>

          {/* Right Info Column */}
          <div className="detail-info-column">
            <div className="detail-genre-row">
              {movie.genre && (
                <span className="detail-genre-tag">{movie.genre}</span>
              )}
            </div>

            <h1 className="detail-title">{movie.title}</h1>

            {/* Meta Row */}
            <div className="detail-meta-row">
              <span className="meta-pill">
                <FaCalendarAlt /> {movie.releaseDate || "2024"}
              </span>
              <span className="meta-pill views">
                <FaEye /> {formatViews(movie.views)} lượt xem
              </span>
              <span className="meta-pill quality">FULL HD 1080P</span>
              <span className="meta-pill">
                <FaVolumeUp /> Dolby 5.1
              </span>
            </div>

            {/* Rating Stars */}
            <div className="detail-rating-box">
              <div className="rating-stars-list">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || userRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star-btn ${isFilled ? "active" : ""}`}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      title={`Đánh giá ${star} sao`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <span className="rating-score-text">
                {userRating ? `${userRating.toFixed(1)} / 5.0` : "Chưa đánh giá"}
              </span>
            </div>

            {/* Description */}
            <p className="detail-description">
              {movie.description ||
                "Thưởng thức bộ phim đặc sắc với độ nét cao, âm thanh vòm sống động và trải nghiệm giải trí không giới hạn trên nền tảng MyFlix."}
            </p>

            {/* Action Buttons */}
            <div className="detail-actions-row">
              <button
                type="button"
                className="btn-watch-primary"
                onClick={scrollToPlayer}
              >
                <FaPlay /> Xem Phim Ngay
              </button>

              <button
                type="button"
                className={`btn-action-pill ${hasLiked ? "active" : ""}`}
                onClick={handleLike}
              >
                <FaHeart /> {hasLiked ? "Đã thích" : "Thích"} ({movie.likes})
              </button>

              <button
                type="button"
                className={`btn-action-pill ${isBookmarked ? "active" : ""}`}
                onClick={handleBookmark}
              >
                <FaBookmark /> {isBookmarked ? "Đã lưu" : "Lưu phim"}
              </button>

              <button
                type="button"
                className="btn-action-pill"
                onClick={handleShare}
                title="Chia sẻ liên kết"
              >
                {isCopied ? (
                  <>
                    <FaCheck style={{ color: "#10b981" }} /> Đã sao chép!
                  </>
                ) : (
                  <>
                    <FaShareAlt /> Chia sẻ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VIDEO PLAYER THEATER SECTION */}
      <section className="detail-player-section" ref={playerRef}>
        <div className="section-header-row">
          <h2 className="section-header-title">
            <FaFilm /> Trình Chiếu Phim & Trailer
          </h2>
        </div>

        <div className="player-theater-wrapper">
          {movie.videoUrl ? (
            embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be") ? (
              <iframe
                src={embedUrl}
                title={movie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video controls poster={movie.image}>
                <source src={movie.videoUrl} type="video/mp4" />
                {movie.subtitleUrl && (
                  <track
                    label="Vietnamese"
                    kind="subtitles"
                    srcLang="vi"
                    src={movie.subtitleUrl}
                    default
                  />
                )}
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            )
          ) : (
            <div className="player-placeholder">
              <div className="player-placeholder-icon">
                <FaPlay />
              </div>
              <h3>Bản phim đang được tối ưu hóa đường truyền</h3>
              <p>Vui lòng quay lại sau ít phút hoặc chọn phim khác để thưởng thức.</p>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="detail-stats-grid">
          <div className="stat-tile">
            <span className="stat-tile-label">Thể loại</span>
            <span className="stat-tile-val">{movie.genre || "Đa thể loại"}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-tile-label">Năm phát hành</span>
            <span className="stat-tile-val">{movie.releaseDate || "2024"}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-tile-label">Tổng lượt xem</span>
            <span className="stat-tile-val">{formatViews(movie.views)} lượt</span>
          </div>
          <div className="stat-tile">
            <span className="stat-tile-label">Bản quyền phát sóng</span>
            <span className="stat-tile-val">MyFlix HD Cinema</span>
          </div>
        </div>
      </section>

      {/* 4. COMMENTS & REVIEWS SECTION */}
      <section className="detail-comments-section">
        <div className="section-header-row">
          <h2 className="section-header-title">
            <FaComments /> Bình Luận & Đánh Giá ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <form className="comment-form-card" onSubmit={handleCommentSubmit}>
          <div className="comment-form-header">
            <div className="comment-user-info">
              <div
                className="comment-user-avatar"
                style={{
                  background: getAvatarBg(
                    storedUser?.username || guestName || "K"
                  ),
                }}
              >
                {(storedUser?.username || guestName || "K")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span className="comment-user-name">
                {storedUser
                  ? `Đang bình luận: ${storedUser.username}`
                  : "Viết bình luận cho phim"}
              </span>
            </div>

            {/* Rating Stars Picker */}
            <div className="comment-rating-picker">
              <span style={{ fontSize: 13, color: "#9ca3af", marginRight: 4 }}>
                Đánh giá:
              </span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`star-btn ${commentRating >= s ? "active" : ""}`}
                  onClick={() => setCommentRating(s)}
                  title={`${s} sao`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {!storedUser && (
            <div className="comment-guest-inputs">
              <input
                type="text"
                className="comment-input-field"
                placeholder="Tên của bạn (hoặc biệt danh)..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <span
                style={{
                  fontSize: 12.5,
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                💡 Hoặc{" "}
                <Link
                  to="/authform"
                  style={{ color: "#e50914", marginLeft: 4 }}
                >
                  Đăng nhập
                </Link>{" "}
                để lưu tên
              </span>
            </div>
          )}

          <textarea
            className="comment-textarea"
            placeholder="Chia sẻ cảm nhận của bạn về nội dung phim, diễn xuất, kỹ xảo..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            required
          />

          <div className="comment-form-footer">
            <button
              type="submit"
              className="btn-submit-comment"
              disabled={isSubmitting || !newCommentText.trim()}
            >
              <FaPaperPlane /> {isSubmitting ? "Đang gửi..." : "Gửi Bình Luận"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comm) => {
              const author = comm.userName || "Khán giả";
              return (
                <div key={comm.id || comm._id} className="comment-item-card">
                  <div
                    className="comment-avatar-circle"
                    style={{ background: getAvatarBg(author) }}
                  >
                    {author.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-body-wrapper">
                    <div className="comment-item-meta">
                      <div className="comment-author-row">
                        <span className="comment-author-name">{author}</span>
                        <div className="comment-stars-display">
                          {Array.from({ length: comm.rating || 5 }).map(
                            (_, i) => (
                              <span key={i}>★</span>
                            )
                          )}
                        </div>
                      </div>
                      <span className="comment-time-text">
                        {formatDate(comm.createdAt)}
                      </span>
                    </div>
                    <p className="comment-content-text">{comm.content}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-comments-box">
              <p>Chưa có bình luận nào cho bộ phim này.</p>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. RECOMMENDED / SIMILAR MOVIES SECTION */}
      {similarMovies.length > 0 && (
        <section className="detail-similar-section">
          <div className="section-header-row">
            <h2 className="section-header-title">
              <FaFilm /> Phim Cùng Thể Loại Có Thể Bạn Thích
            </h2>
          </div>
          <div className="similar-movies-grid">
            {similarMovies.map((simMovie) => (
              <MovieCard key={simMovie.id || simMovie._id} movie={simMovie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetail;
