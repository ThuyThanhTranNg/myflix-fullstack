import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaPlay,
  FaInfoCircle,
  FaSearch,
  FaTimes,
  FaEye,
  FaFire,
  FaFilm,
} from "react-icons/fa";
import MovieList from "../components/MovieList";
import { getMovies, getMovieBackdrop } from "../services/movieService";
import "./MovieListPage.css";

const CATEGORIES = [
  { id: "", label: "Tất Cả", icon: FaFilm },
  { id: "action", label: "Hành Động" },
  { id: "sci-fi", label: "Viễn Tưởng" },
  { id: "animation", label: "Hoạt Hình" },
  { id: "romance", label: "Lãng Mạn" },
];

const MovieListPage = () => {
  const { genre } = useParams(); // Lấy thể loại từ URL nếu có
  const navigate = useNavigate();

  const [allMovies, setAllMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("views-desc");
  const [isLoading, setIsLoading] = useState(true);

  // Load danh sách phim từ Backend
  useEffect(() => {
    let isMounted = true;
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const data = await getMovies();
        if (isMounted) {
          setAllMovies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Lỗi khi tải phim:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMovies();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizeGenre = (g) => {
    if (!g) return "";
    const s = g.trim().toLowerCase();
    if (["romance", "ngôn tình", "tình cảm", "lãng mạn"].includes(s)) return "romance";
    if (["action", "hành động"].includes(s)) return "action";
    if (["sci-fi", "scifi", "khoa học viễn tưởng", "viễn tưởng"].includes(s)) return "sci-fi";
    if (["animation", "hoạt hình", "anime"].includes(s)) return "animation";
    return s;
  };

  const activeGenre = genre ? normalizeGenre(genre) : "";

  // Chọn Hero Movie (phim có lượt xem cao nhất trong danh mục hoặc chung)
  const heroMovie = useMemo(() => {
    if (allMovies.length === 0) return null;
    const candidates = activeGenre
      ? allMovies.filter((m) => normalizeGenre(m.genre) === activeGenre)
      : allMovies;

    const pool = candidates.length > 0 ? candidates : allMovies;
    return [...pool].sort(
      (a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)
    )[0];
  }, [allMovies, activeGenre]);

  // Lọc và sắp xếp danh sách phim
  const displayedMovies = useMemo(() => {
    let result = [...allMovies];

    // Lọc theo thể loại
    if (activeGenre) {
      result = result.filter(
        (m) => normalizeGenre(m.genre) === activeGenre
      );
    }

    // Lọc theo tìm kiếm
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.genre && m.genre.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (sortBy === "views-desc") {
        return (Number(b.views) || 0) - (Number(a.views) || 0);
      }
      if (sortBy === "date-desc") {
        return (
          new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0)
        );
      }
      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

    return result;
  }, [allMovies, activeGenre, searchTerm, sortBy]);

  const handleCategorySelect = (catId) => {
    if (catId) {
      navigate(`/movies/${catId}`);
    } else {
      navigate("/movies");
    }
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeGenre);
  const currentTitle = activeCategoryObj
    ? activeCategoryObj.id === ""
      ? "Tất Cả Phim"
      : `Phim ${activeCategoryObj.label}`
    : genre
    ? `Phim ${genre.charAt(0).toUpperCase() + genre.slice(1)}`
    : "Tất Cả Phim";

  const formatViews = (val) => {
    const num = Number(val) || 0;
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;
  };

  return (
    <div className="movie-list-page">
      {/* 1. HERO SPOTLIGHT BANNER */}
      {heroMovie && (
        <section
          className="hero-spotlight"
          style={{
            backgroundImage: `url(${getMovieBackdrop(heroMovie)})`,
          }}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-badge-row">
                <span className="hero-tag">
                  <FaFire style={{ marginRight: 4 }} /> NỔI BẬT NHẤT
                </span>
                {heroMovie.genre && (
                  <span className="hero-genre">{heroMovie.genre}</span>
                )}
              </div>

              <h1 className="hero-title">{heroMovie.title}</h1>

              <div className="hero-meta">
                <span>{heroMovie.releaseDate || "2024"}</span>
                <span>•</span>
                <span className="hero-views">
                  <FaEye /> {formatViews(heroMovie.views)} lượt xem
                </span>
                <span>•</span>
                <span>HD / 5.1</span>
              </div>

              {heroMovie.description && (
                <p className="hero-desc">{heroMovie.description}</p>
              )}

              <div className="hero-actions">
                <Link
                  to={`/movie/${heroMovie.id || heroMovie._id}`}
                  className="btn-hero-watch"
                >
                  <FaPlay /> Xem Ngay
                </Link>
                <Link
                  to={`/movie/${heroMovie.id || heroMovie._id}`}
                  className="btn-hero-detail"
                >
                  <FaInfoCircle /> Chi Tiết
                </Link>
              </div>
            </div>
          </div>
          {/* Lớp hòa tan mềm mại cạnh dưới vào nền trang (Seamless Bottom Fade) */}
          <div className="hero-bottom-fade" />
        </section>
      )}

      {/* 2. MAIN CONTAINER & CONTROLS */}
      <div className="movies-main-container">
        {/* Filter Toolbar */}
        <div className="filter-toolbar">
          {/* Category Chips */}
          <div className="category-chips">
            {CATEGORIES.map((cat) => {
              const isActive = activeGenre === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id || "all"}
                  className={`chip-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {Icon && <Icon style={{ fontSize: 13 }} />}
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="search-sort-group">
            <div className="movie-search-box">
              <FaSearch style={{ color: "#9ca3af", fontSize: 13 }} />
              <input
                type="text"
                placeholder="Tìm phim theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Xóa tìm kiếm"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sắp xếp danh sách phim"
            >
              <option value="views-desc">👁 Lượt xem: Cao → Thấp</option>
              <option value="date-desc">🕒 Mới nhất</option>
              <option value="title-asc">🔤 Tên: A → Z</option>
            </select>
          </div>
        </div>

        {/* Section Header */}
        <div className="section-title-row">
          <h2 className="section-title">{currentTitle}</h2>
          <span className="movies-count-badge">
            {displayedMovies.length} bộ phim
          </span>
        </div>

        {/* Movie Grid */}
        {isLoading ? (
          <div className="no-movies-box">
            <p>Đang tải danh sách phim...</p>
          </div>
        ) : displayedMovies.length > 0 ? (
          <MovieList movies={displayedMovies} />
        ) : (
          <div className="no-movies-box">
            <p>
              {searchTerm
                ? `Không tìm thấy phim nào khớp với từ khóa "${searchTerm}".`
                : "Chưa có phim nào trong danh mục này."}
            </p>
            {(searchTerm || activeGenre) && (
              <button
                className="chip-btn"
                style={{
                  margin: "16px auto 0",
                  display: "inline-flex",
                  justifyContent: "center",
                }}
                onClick={() => {
                  setSearchTerm("");
                  navigate("/movies");
                }}
              >
                Xem tất cả phim
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieListPage;
