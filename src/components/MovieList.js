import React from "react";
import MovieCard from "./MovieCard";

const MovieList = ({ movies = [], onEdit, onDelete, isAdmin }) => {
  return (
    <div className="netflix-movie-grid">
      {movies.length === 0 ? (
        <div className="no-movies-box">
          <p>Không có phim nào để hiển thị.</p>
        </div>
      ) : (
        movies.map((movie) => (
          isAdmin ? (
            <div key={movie.id || movie._id} className="movie-item-admin">
              <MovieCard movie={movie} />
              <div className="admin-controls">
                <button
                  className="edit-btn"
                  onClick={() => onEdit && onEdit(movie)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDelete && onDelete(movie.id || movie._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <MovieCard key={movie.id || movie._id} movie={movie} />
          )
        ))
      )}
    </div>
  );
};

export default MovieList;
