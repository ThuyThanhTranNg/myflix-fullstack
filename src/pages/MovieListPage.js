import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MovieList from "../components/MovieList";
import { getMovies } from "../services/movieService";

const MovieListPage = () => {
  const { genre } = useParams(); // Lấy thể loại từ URL
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredMovies, setFilteredMovies] = useState([]); 
  const [allMovies, setAllMovies] = useState([]);

  // Load danh sách phim từ Backend lần đầu
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setAllMovies(data);
      } catch (error) {
        console.error("Lỗi khi tải phim:", error);
      }
    };
    fetchMovies();
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

  // Lọc phim mỗi khi genre, searchTerm hoặc dữ liệu phim thay đổi
  useEffect(() => {
    let filteredByGenre = allMovies;
    if (genre) {
      filteredByGenre = allMovies.filter(
        (movie) => normalizeGenre(movie.genre) === normalizeGenre(genre)
      );
    }

    const filteredBySearch = filteredByGenre.filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.description && movie.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredMovies(filteredBySearch);
  }, [genre, searchTerm, allMovies]);

  return (
    <div className="movie-list-page">
      <h1>
        {genre ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies` : "All Movies"}
      </h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div>
        {filteredMovies.length > 0 ? (
          <MovieList movies={filteredMovies} />
        ) : (
          <p>No movies found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default MovieListPage;
