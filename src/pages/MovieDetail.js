import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMovie } from "../services/movieService";
import "./MovieDetail.css";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [hasLiked, setHasLiked] = useState(false); 

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const foundMovie = await getMovie(id);
        if (foundMovie) {
          // Tăng lượt xem (không bắt buộc lưu db ngay nếu không cần thiết, ở đây chỉ update UI hoặc bạn có thể gọi updateMovie)
          setMovie({ ...foundMovie, views: foundMovie.views + 1 });
        }
      } catch (error) {
        console.error("Lỗi khi tải phim", error);
      }
    };
    fetchMovieDetail();
  }, [id]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  const handleLike = () => {
    if (hasLiked) {
      // Nếu đã like, thực hiện unlike
      setMovie(prevMovie => ({
        ...prevMovie,
        likes: prevMovie.likes - 1
      }));
      setHasLiked(false); // Đánh dấu là đã un-like
    } else {
      // Nếu chưa like, thực hiện like
      setMovie(prevMovie => ({
        ...prevMovie,
        likes: prevMovie.likes + 1
      }));
      setHasLiked(true); // Đánh dấu là đã like
    }
  };

  const handleRating = (rating) => {
    setMovie(prevMovie => ({
      ...prevMovie,
      rating: rating
    }));
  };

  return (
    <div className="movie-detail">
      <h1>{movie.title}</h1>
      <img src={movie.image} alt={movie.title} />
      <p>{movie.description}</p>
      <p>Release Date: {movie.releaseDate}</p>
      <p>Views: {movie.views}</p>
      
      {/* Like Button */}
      <button className="btn-like" onClick={handleLike}>
        {hasLiked ? "Unlike" : "Like"} ({movie.likes})
      </button>

      {/* Rating Stars */}
      <div className="movie-rating">
        <p>Rating: {movie.rating || 0} / 5</p>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => handleRating(star)}
            className={star <= movie.rating ? "filled" : ""}
          >
            ★
          </span>
        ))}
      </div>

      {movie.videoUrl.includes("youtube.com") ? (
        <iframe
          src={movie.videoUrl}
          title={movie.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <video controls>
          <source src={movie.videoUrl} type="video/mp4" />
          <track label="English" kind="subtitles" srcLang="en" src={movie.subtitleUrl} default />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default MovieDetail;
