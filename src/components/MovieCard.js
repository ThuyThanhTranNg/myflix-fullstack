import React from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaEye } from "react-icons/fa";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const title = movie.title || "Phim Chưa Đặt Tên";
  const views = Number(movie.views) || 0;
  const formattedViews = views >= 1000 ? `${(views / 1000).toFixed(1)}K` : views;

  return (
    <Link to={`/movie/${movie.id || ""}`} className="netflix-movie-card">
      <div className="card-poster-wrapper">
        <img
          src={movie.image || "/logo.svg"}
          alt={title}
          className="card-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400";
          }}
        />

        {/* Top Badges (HD + Genre) */}
        <div className="card-badges-top">
          <span className="badge-quality">HD</span>
          {movie.genre && (
            <span className="badge-genre-tag">{movie.genre}</span>
          )}
        </div>

        {/* Hover Center Play Circle */}
        <div className="card-play-overlay">
          <FaPlay />
        </div>

        {/* Bottom Dark Gradient Info */}
        <div className="card-info-bottom">
          <h3 className="card-title" title={title}>
            {title}
          </h3>
          <div className="card-meta-row">
            <span className="card-meta-year">{movie.releaseDate || "2024"}</span>
            <span className="card-meta-views">
              <FaEye style={{ fontSize: 11 }} /> {formattedViews}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
