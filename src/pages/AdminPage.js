import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MovieList from "../components/MovieList";
import { getMovies, addMovie, updateMovie, deleteMovie } from "../services/movieService";

const AdminPage = ({ loggedInUser }) => {
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState({
    title: "",
    genre: "",
    description: "",
    releaseDate: "",
    image: "",
    videoUrl: "",
    subtitleUrl: "",
  });
  const [editMovie, setEditMovie] = useState(null);
  const { genre } = useParams();

  // Load danh sách phim từ Backend
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phim:", error);
    }
  };

  const handleAddMovie = async () => {
    if (
      !newMovie.title ||
      !newMovie.genre ||
      !newMovie.description ||
      !newMovie.releaseDate ||
      !newMovie.image ||
      !newMovie.videoUrl
    ) {
      alert("Vui lòng điền đầy đủ thông tin phim.");
      return;
    }
    try {
      await addMovie(newMovie);
      fetchMovies(); // Load lại danh sách sau khi thêm
      setNewMovie({
        title: "", genre: "", description: "", releaseDate: "",
        image: "", videoUrl: "", subtitleUrl: "",
      });
      alert("Thêm phim thành công!");
    } catch (error) {
      alert("Lỗi khi thêm phim.");
    }
  };

  const handleDeleteMovie = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này không?")) {
      try {
        await deleteMovie(id);
        fetchMovies(); // Load lại danh sách
        alert("Xóa thành công!");
      } catch (error) {
        alert("Lỗi khi xóa phim.");
      }
    }
  };

  const handleEditMovie = (movie) => {
    setEditMovie(movie);
    setNewMovie({
      title: movie.title,
      genre: movie.genre,
      description: movie.description,
      releaseDate: movie.releaseDate,
      image: movie.image,
      videoUrl: movie.videoUrl,
      subtitleUrl: movie.subtitleUrl,
    });
  };

  const handleUpdateMovie = async () => {
    if (!newMovie.title || !newMovie.genre || !newMovie.description || !newMovie.releaseDate || !newMovie.image || !newMovie.videoUrl) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await updateMovie({ id: editMovie.id, ...newMovie });
      fetchMovies();
      setNewMovie({
        title: "", genre: "", description: "", releaseDate: "",
        image: "", videoUrl: "", subtitleUrl: "",
      });
      setEditMovie(null);
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật.");
    }
  };

  const normalizeGenre = (g) => {
    if (!g) return "";
    const s = g.trim().toLowerCase();
    if (["romance", "ngôn tình", "tình cảm", "lãng mạn"].includes(s)) return "romance";
    if (["action", "hành động"].includes(s)) return "action";
    if (["sci-fi", "scifi", "khoa học viễn tưởng", "viễn tưởng"].includes(s)) return "sci-fi";
    if (["animation", "hoạt hình", "anime"].includes(s)) return "animation";
    return s;
  };

  const filteredMovies = genre
    ? movies.filter((movie) => normalizeGenre(movie.genre) === normalizeGenre(genre))
    : movies;

  return (
    <div>
      <h1>Quản lý phim</h1>
      <div>
        <h2>{editMovie ? "Cập nhật phim" : "Thêm phim mới"}</h2>
        <input
          type="text"
          placeholder="Tiêu đề phim"
          value={newMovie.title}
          onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Thể loại (romance, action, sci-fi, animation...)"
          list="genre-options"
          value={newMovie.genre}
          onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
        />
        <datalist id="genre-options">
          <option value="romance">Lãng mạn / Ngôn tình (Romance)</option>
          <option value="action">Hành động (Action)</option>
          <option value="sci-fi">Khoa học viễn tưởng (Sci-Fi)</option>
          <option value="animation">Hoạt hình (Animation)</option>
        </datalist>
        <textarea
          placeholder="Mô tả"
          value={newMovie.description}
          onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Ngày phát hành"
          value={newMovie.releaseDate}
          onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="URL hình ảnh"
          value={newMovie.image}
          onChange={(e) => setNewMovie({ ...newMovie, image: e.target.value })}
        />
        <input
          type="text"
          placeholder="URL video"
          value={newMovie.videoUrl}
          onChange={(e) => setNewMovie({ ...newMovie, videoUrl: e.target.value })}
        />
        <input
          type="text"
          placeholder="URL phụ đề"
          value={newMovie.subtitleUrl}
          onChange={(e) => setNewMovie({ ...newMovie, subtitleUrl: e.target.value })}
        />
        {editMovie ? (
          <button onClick={handleUpdateMovie}>Cập nhật phim</button>
        ) : (
          <button onClick={handleAddMovie}>Thêm phim</button>
        )}
      </div>

      <MovieList
        movies={filteredMovies}
        onEdit={handleEditMovie}
        onDelete={handleDeleteMovie}
        isAdmin={loggedInUser?.isAdmin} 
      />
    </div>
  );
};

export default AdminPage;
