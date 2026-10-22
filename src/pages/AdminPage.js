import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaFilm,
  FaUsers,
  FaChartPie,
  FaEye,
  FaPlus,
  FaTrash,
  FaEdit,
  FaUserShield,
  FaSearch,
  FaTimes,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaComments,
} from "react-icons/fa";
import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../services/movieService";
import { getUsers, updateUserRole, deleteUser } from "../services/userService";
import { getStats } from "../services/statsService";
import { getComments, deleteComment } from "../services/commentService";
import "./AdminPage.css";

const genreColors = [
  "#e50914",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const avatarColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const AdminPage = ({ loggedInUser, setLoggedInUser }) => {
  const { genre: paramGenre } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi quyền Quản trị?")) {
      if (setLoggedInUser) setLoggedInUser(null);
      localStorage.removeItem("user");
      navigate("/authform");
    }
  };

  // Tab navigation: 'dashboard' | 'movies' | 'users'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data states
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Movie Filter & Pagination
  const [movieSearch, setMovieSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(paramGenre || "all");
  const [sortBy, setSortBy] = useState("views-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;

  // User Filter
  const [userSearch, setUserSearch] = useState("");

  // Comment Filter
  const [commentSearch, setCommentSearch] = useState("");
  const [commentRatingFilter, setCommentRatingFilter] = useState("all");

  // Movie Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: "",
    genre: "action",
    description: "",
    releaseDate: "",
    image: "",
    videoUrl: "",
    subtitleUrl: "",
  });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, moviesData, usersData, commentsData] =
        await Promise.allSettled([
          getStats(),
          getMovies(),
          getUsers(),
          getComments(),
        ]);

      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (moviesData.status === "fulfilled") setMovies(moviesData.value);
      if (usersData.status === "fulfilled") setUsers(usersData.value);
      if (commentsData.status === "fulfilled")
        setComments(Array.isArray(commentsData.value) ? commentsData.value : []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu trang Admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa bình luận này? Thao tác này không thể hoàn tác."
      )
    ) {
      try {
        await deleteComment(commentId);
        setComments((prev) =>
          prev.filter((c) => (c.id || c._id) !== commentId)
        );
        showAlert("success", "Đã xóa bình luận thành công khỏi hệ thống!");
      } catch (err) {
        showAlert("error", err.message || "Lỗi khi xóa bình luận");
      }
    }
  };

  const filteredComments = useMemo(() => {
    let list = [...comments];
    if (commentSearch.trim()) {
      const q = commentSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.content && c.content.toLowerCase().includes(q)) ||
          (c.userName && c.userName.toLowerCase().includes(q)) ||
          (c.movieTitle && c.movieTitle.toLowerCase().includes(q)) ||
          (c.userEmail && c.userEmail.toLowerCase().includes(q))
      );
    }
    if (commentRatingFilter !== "all") {
      if (commentRatingFilter === "5") list = list.filter((c) => c.rating === 5);
      else if (commentRatingFilter === "4") list = list.filter((c) => c.rating === 4);
      else if (commentRatingFilter === "low") list = list.filter((c) => c.rating < 4);
    }
    return list;
  }, [comments, commentSearch, commentRatingFilter]);

  // ================= XỬ LÝ PHIM =================
  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setMovieForm({
      title: "",
      genre: "action",
      description: "",
      releaseDate: new Date().getFullYear().toString(),
      image: "",
      videoUrl: "",
      subtitleUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title || "",
      genre: movie.genre || "action",
      description: movie.description || "",
      releaseDate: movie.releaseDate || "",
      image: movie.image || "",
      videoUrl: movie.videoUrl || "",
      subtitleUrl: movie.subtitleUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    if (
      !movieForm.title ||
      !movieForm.genre ||
      !movieForm.description ||
      !movieForm.releaseDate ||
      !movieForm.image ||
      !movieForm.videoUrl
    ) {
      showAlert("error", "Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    try {
      if (editingMovie) {
        await updateMovie({ id: editingMovie.id, ...movieForm });
        showAlert("success", `Cập nhật phim "${movieForm.title}" thành công!`);
      } else {
        await addMovie(movieForm);
        showAlert("success", `Thêm phim "${movieForm.title}" thành công!`);
      }
      setIsModalOpen(false);
      loadAllData();
    } catch (error) {
      showAlert("error", "Lỗi trong quá trình lưu phim. Vui lòng thử lại!");
    }
  };

  const handleDeleteMovie = async (movie) => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ phim "${movie.title}" không?`
    );
    if (!isConfirmed) return;

    try {
      await deleteMovie(movie.id);
      showAlert("success", `Đã xóa bộ phim "${movie.title}"!`);
      loadAllData();
    } catch (error) {
      showAlert("error", "Không thể xóa phim. Vui lòng thử lại sau!");
    }
  };

  // ================= XỬ LÝ NGƯỜI DÙNG =================
  const handleToggleUserRole = async (user) => {
    const newRole = !user.isAdmin;
    const roleText = newRole ? "Quản trị viên (Admin)" : "Thành viên (User)";
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn đổi vai trò của "${user.username}" thành ${roleText}?`
    );
    if (!isConfirmed) return;

    try {
      await updateUserRole(user.id || user._id, newRole);
      showAlert(
        "success",
        `Đã cập nhật vai trò người dùng "${user.username}" thành ${roleText}!`
      );
      loadAllData();
    } catch (error) {
      showAlert("error", error.message || "Lỗi khi cập nhật vai trò!");
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.email === loggedInUser?.email) {
      showAlert("error", "Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa tài khoản "${user.username}" (${user.email}) không?`
    );
    if (!isConfirmed) return;

    try {
      await deleteUser(user.id || user._id);
      showAlert("success", `Đã xóa tài khoản "${user.username}" thành công!`);
      loadAllData();
    } catch (error) {
      showAlert("error", error.message || "Lỗi khi xóa người dùng!");
    }
  };

  // ================= BỘ LỌC VÀ TÌM KIẾM =================
  const filteredMovies = useMemo(() => {
    let list = [...movies];

    if (selectedGenre !== "all") {
      list = list.filter(
        (m) =>
          (m.genre || "").toLowerCase().trim() ===
          selectedGenre.toLowerCase().trim()
      );
    }

    if (movieSearch.trim()) {
      const q = movieSearch.toLowerCase().trim();
      list = list.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "views-desc") {
      list.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    } else if (sortBy === "views-asc") {
      list.sort((a, b) => (Number(a.views) || 0) - (Number(b.views) || 0));
    } else if (sortBy === "year-desc") {
      list.sort(
        (a, b) => (Number(b.releaseDate) || 0) - (Number(a.releaseDate) || 0)
      );
    } else if (sortBy === "title-asc") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return list;
  }, [movies, selectedGenre, movieSearch, sortBy]);

  // Phân trang phim
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * moviesPerPage;
    return filteredMovies.slice(start, start + moviesPerPage);
  }, [filteredMovies, currentPage]);

  // Lọc người dùng
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (`${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  // Kiểm tra quyền Admin
  if (!loggedInUser || !loggedInUser.isAdmin) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <FaLock className="access-icon" />
          <h2>Truy cập bị giới hạn</h2>
          <p>
            Trang Quản trị này chỉ dành riêng cho tài khoản có quyền{" "}
            <strong>Administrator</strong>. Vui lòng đăng nhập với tài khoản hợp
            lệ để tiếp tục.
          </p>

          <div className="admin-demo-tip">
            💡 <strong>Tài khoản Admin mặc định:</strong>
            <br />
            Email: <code>admin123@gmail.com</code> | Mật khẩu:{" "}
            <code>admin123</code>
          </div>

          <Link to="/authform" className="btn-primary" style={{ display: "inline-flex" }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* FULLSCREEN ADMIN TOPBAR */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <Link to="/" className="admin-brand" title="Về trang chủ MyFlix">
            <span className="admin-brand-logo">MyFlix</span>
            <span className="admin-badge-tag">ADMIN PORTAL</span>
          </Link>

          <div className="admin-user-pill">
            <div className="admin-status-dot" />
            <span>
              <strong>{loggedInUser.username || "Admin"}</strong> ({loggedInUser.email})
            </span>
          </div>
        </div>

        {/* CENTER TABS */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaChartPie /> Báo Cáo & Thống Kê
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "movies" ? "active" : ""}`}
            onClick={() => setActiveTab("movies")}
          >
            <FaFilm /> Quản Lý Phim ({movies.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers /> Quản Lý Người Dùng ({users.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            <FaComments /> Kiểm Duyệt Bình Luận ({comments.length})
          </button>
        </div>

        {/* RIGHT ACTIONS: VIEW WEBSITE & LOGOUT */}
        <div className="admin-topbar-right">
          <Link to="/" className="btn-view-site" title="Xem giao diện người xem phim">
            <FaExternalLinkAlt /> Xem Website
          </Link>
          <button className="btn-logout" onClick={handleLogout} title="Đăng xuất khỏi quyền Admin">
            <FaSignOutAlt /> Đăng Xuất
          </button>
        </div>
      </header>

      {/* FULLSCREEN MAIN CONTENT AREA */}
      <main className="admin-content-area">
        {/* ALERT MESSAGE */}
        {alert && (
          <div className={`admin-alert ${alert.type}`}>
            <span>{alert.message}</span>
            <button onClick={() => setAlert(null)}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === "dashboard" && (
          <div className="tab-dashboard">
            {/* 5 Metric Cards */}
            <div className="dashboard-metrics">
              <div className="metric-card">
                <div className="metric-icon red">
                  <FaFilm />
                </div>
                <div className="metric-info">
                  <h3>Tổng số phim</h3>
                  <div className="metric-number">
                    {stats?.totalMovies ?? movies.length}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon blue">
                  <FaUsers />
                </div>
                <div className="metric-info">
                  <h3>Thành viên</h3>
                  <div className="metric-number">
                    {stats?.totalUsers ?? users.length}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon green">
                  <FaEye />
                </div>
                <div className="metric-info">
                  <h3>Tổng lượt xem</h3>
                  <div className="metric-number">
                    {(stats?.totalViews ??
                      movies.reduce((s, m) => s + (Number(m.views) || 0), 0)
                    ).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon purple">
                  <FaChartPie />
                </div>
                <div className="metric-info">
                  <h3>Thể loại phim</h3>
                  <div className="metric-number">
                    {stats?.genres?.length || 4} nhóm
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon orange">
                  <FaComments />
                </div>
                <div className="metric-info">
                  <h3>Bình luận</h3>
                  <div className="metric-number">
                    {stats?.totalComments ?? comments.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2 cột: Thể loại + Top phim */}
            <div className="dashboard-grid">
              {/* Phân bổ thể loại */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2>
                    <FaChartPie style={{ color: "#3b82f6" }} /> Phân Bổ Thể Loại
                  </h2>
                  <button
                    className="btn-action"
                    onClick={loadAllData}
                    disabled={loading}
                    title="Tải lại"
                  >
                    <FaSyncAlt className={loading ? "spin" : ""} /> Làm mới
                  </button>
                </div>

                <div className="genre-stats-container">
                  {stats?.genres && stats.genres.length > 0 ? (
                    stats.genres.map((g, idx) => {
                      const totalM = stats.totalMovies || 1;
                      const percent = Math.round((g.count / totalM) * 100);
                      const color = genreColors[idx % genreColors.length];
                      return (
                        <div key={g.name || idx} className="genre-stat-item">
                          <div className="genre-stat-info">
                            <span className="genre-stat-name">{g.name}</span>
                            <span className="genre-stat-count">
                              {g.count} phim ({percent}%)
                            </span>
                          </div>
                          <div className="genre-progress-track">
                            <div
                              className="genre-progress-bar"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: "#9ca3af" }}>Chưa có dữ liệu thể loại.</p>
                  )}
                </div>
              </div>

              {/* Top 5 Phim xem nhiều nhất */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2>
                    <FaEye style={{ color: "#10b981" }} /> Top 5 Phim Thịnh Hành
                  </h2>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Lượt xem cao nhất</span>
                </div>

                <div className="top-movies-list">
                  {(stats?.topMovies && stats.topMovies.length > 0
                    ? stats.topMovies
                    : movies.slice(0, 5)
                  ).map((movie, idx) => (
                    <div key={movie.id || idx} className="top-movie-item">
                      <div className="top-movie-rank">#{idx + 1}</div>
                      <img
                        src={movie.image || "/logo.svg"}
                        alt={movie.title}
                        className="top-movie-poster"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200";
                        }}
                      />
                      <div className="top-movie-meta">
                        <div className="top-movie-title">{movie.title}</div>
                        <div className="top-movie-sub">
                          <span className="badge badge-genre">{movie.genre}</span>
                          <span>• Năm {movie.releaseDate || "—"}</span>
                        </div>
                      </div>
                      <div style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>
                        {(Number(movie.views) || 0).toLocaleString()} <FaEye style={{ fontSize: 12 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thành viên mới đăng ký gần đây */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2>
                  <FaUsers style={{ color: "#c084fc" }} /> Thành Viên Mới Đăng Ký
                </h2>
                <button
                  className="btn-action"
                  onClick={() => setActiveTab("users")}
                >
                  Xem tất cả
                </button>
              </div>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Thành viên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentUsers && stats.recentUsers.length > 0
                      ? stats.recentUsers
                      : users.slice(0, 5)
                    ).map((u, idx) => (
                      <tr key={u.id || u._id || idx}>
                        <td>
                          <div className="user-avatar-cell">
                            <div
                              className="avatar-circle"
                              style={{
                                backgroundColor:
                                  avatarColors[idx % avatarColors.length],
                              }}
                            >
                              {(u.username || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <strong>{u.username}</strong>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                {u.firstName || ""} {u.lastName || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`badge ${u.isAdmin ? "badge-admin" : "badge-user"
                              }`}
                          >
                            {u.isAdmin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td style={{ color: "#9ca3af" }}>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                            : "Gần đây"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MOVIE MANAGEMENT */}
        {activeTab === "movies" && (
          <div className="tab-movies">
            {/* Toolbar: Search, Filter, Sort, Add Button */}
            <div className="admin-toolbar">
              <div className="admin-search-box">
                <FaSearch style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Tìm phim theo tên hoặc mô tả..."
                  value={movieSearch}
                  onChange={(e) => {
                    setMovieSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {movieSearch && (
                  <button
                    style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                    onClick={() => setMovieSearch("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="admin-filters">
                <select
                  className="admin-select"
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tất cả thể loại</option>
                  <option value="action">Hành động (Action)</option>
                  <option value="romance">Lãng mạn (Romance)</option>
                  <option value="sci-fi">Khoa học viễn tưởng (Sci-Fi)</option>
                  <option value="animation">Hoạt hình (Animation)</option>
                </select>

                <select
                  className="admin-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="views-desc">Lượt xem: Cao đến thấp</option>
                  <option value="views-asc">Lượt xem: Thấp đến cao</option>
                  <option value="year-desc">Năm phát hành mới nhất</option>
                  <option value="title-asc">Tên phim A - Z</option>
                </select>

                <button className="btn-primary" onClick={handleOpenAddModal}>
                  <FaPlus /> Thêm Phim Mới
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Poster</th>
                    <th>Tên phim</th>
                    <th>Thể loại</th>
                    <th>Năm</th>
                    <th>Lượt xem</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovies.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                        Không tìm thấy phim phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    paginatedMovies.map((movie) => (
                      <tr key={movie.id || movie._id}>
                        <td>
                          <img
                            src={movie.image || "/logo.svg"}
                            alt={movie.title}
                            className="movie-thumb"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200";
                            }}
                          />
                        </td>
                        <td>
                          <div className="movie-cell-title">{movie.title}</div>
                          <div className="movie-cell-desc" title={movie.description}>
                            {movie.description}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-genre">{movie.genre}</span>
                        </td>
                        <td>{movie.releaseDate || "—"}</td>
                        <td>
                          <span style={{ color: "#10b981", fontWeight: 600 }}>
                            {(Number(movie.views) || 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="action-buttons" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="btn-action"
                              onClick={() => handleOpenEditModal(movie)}
                              title="Sửa phim"
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteMovie(movie)}
                              title="Xóa phim"
                            >
                              <FaTrash /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div>
                  Hiển thị {(currentPage - 1) * moviesPerPage + 1} -{" "}
                  {Math.min(currentPage * moviesPerPage, filteredMovies.length)} trong tổng số{" "}
                  <strong>{filteredMovies.length}</strong> phim
                </div>
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  >
                    <FaChevronLeft />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        className={`page-btn ${currentPage === pNum ? "active" : ""}`}
                        onClick={() => setCurrentPage(pNum)}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="tab-users">
            <div className="admin-toolbar">
              <div className="admin-search-box">
                <FaSearch style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Tìm theo username hoặc email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                {userSearch && (
                  <button
                    style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                    onClick={() => setUserSearch("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <button className="btn-action" onClick={loadAllData} disabled={loading}>
                <FaSyncAlt className={loading ? "spin" : ""} /> Làm mới danh sách
              </button>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Giới tính</th>
                    <th>Vai trò</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id || user._id || idx}>
                        <td>
                          <div className="user-avatar-cell">
                            <div
                              className="avatar-circle"
                              style={{
                                backgroundColor:
                                  avatarColors[idx % avatarColors.length],
                              }}
                            >
                              {(user.username || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <strong>{user.username}</strong>
                              {user.email === loggedInUser?.email && (
                                <span style={{ fontSize: 11, color: "#e50914", marginLeft: 6 }}>
                                  (Bạn)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`
                            : "—"}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.gender || "—"}</td>
                        <td>
                          <span
                            className={`badge ${user.isAdmin ? "badge-admin" : "badge-user"
                              }`}
                          >
                            {user.isAdmin ? "Administrator" : "Thành viên"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="action-buttons" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="btn-action btn-role"
                              onClick={() => handleToggleUserRole(user)}
                              title={
                                user.isAdmin
                                  ? "Hạ quyền xuống Thành viên thường"
                                  : "Thăng quyền lên Administrator"
                              }
                            >
                              <FaUserShield />
                              {user.isAdmin ? "Hạ quyền User" : "Cấp quyền Admin"}
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.email === loggedInUser?.email}
                              title={
                                user.email === loggedInUser?.email
                                  ? "Không thể tự xóa chính mình"
                                  : "Xóa tài khoản"
                              }
                            >
                              <FaTrash /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COMMENTS & REVIEWS MODERATION */}
        {activeTab === "comments" && (
          <div className="tab-comments">
            <div className="admin-toolbar">
              <div className="admin-search-box" style={{ width: 380 }}>
                <FaSearch style={{ color: "#9ca3af", fontSize: 13 }} />
                <input
                  type="text"
                  placeholder="Tìm nội dung, người gửi hoặc tên phim..."
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                />
                {commentSearch && (
                  <button
                    style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                    onClick={() => setCommentSearch("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="admin-filters">
                <select
                  className="admin-select"
                  value={commentRatingFilter}
                  onChange={(e) => setCommentRatingFilter(e.target.value)}
                >
                  <option value="all">⭐ Tất cả đánh giá ({comments.length})</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
                  <option value="4">⭐⭐⭐⭐ 4 Sao</option>
                  <option value="low">⭐ 1 - 3 Sao (Thấp / Cảnh báo)</option>
                </select>

                <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: 8 }}>
                  Hiển thị: <strong style={{ color: "#ffffff" }}>{filteredComments.length}</strong> bình luận
                </span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Khán giả</th>
                    <th>Bộ phim</th>
                    <th>Đánh giá</th>
                    <th>Nội dung bình luận</th>
                    <th>Thời gian</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}
                      >
                        {commentSearch || commentRatingFilter !== "all"
                          ? "Không tìm thấy bình luận nào khớp với bộ lọc."
                          : "Chưa có bình luận nào trên hệ thống."}
                      </td>
                    </tr>
                  ) : (
                    filteredComments.map((comm, idx) => (
                      <tr key={comm.id || comm._id || idx}>
                        <td>
                          <div className="user-avatar-cell">
                            <div
                              className="avatar-circle"
                              style={{
                                backgroundColor:
                                  avatarColors[idx % avatarColors.length],
                              }}
                            >
                              {(comm.userName || "K")[0].toUpperCase()}
                            </div>
                            <div>
                              <strong>{comm.userName || "Khán giả"}</strong>
                              {comm.userEmail && (
                                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                                  {comm.userEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/movie/${comm.movieId}`}
                            className="comment-movie-title"
                            title="Xem trang chi tiết phim"
                          >
                            {comm.movieTitle || `Phim #${comm.movieId}`}{" "}
                            <FaExternalLinkAlt
                              style={{ fontSize: 11, opacity: 0.7 }}
                            />
                          </Link>
                        </td>
                        <td>
                          <span className="stars-rating-pill">
                            ★ {comm.rating || 5} / 5
                          </span>
                        </td>
                        <td>
                          <div className="comment-content-cell">
                            {comm.content}
                          </div>
                        </td>
                        <td
                          style={{
                            fontSize: 12.5,
                            color: "#9ca3af",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {comm.createdAt
                            ? new Date(comm.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Vừa xong"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteComment(comm.id || comm._id)}
                            title="Xóa bình luận này khỏi hệ thống"
                          >
                            <FaTrash /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL THÊM / SỬA PHIM */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaFilm style={{ color: "#e50914" }} />
                {editingMovie ? "Cập Nhật Bộ Phim" : "Thêm Phim Mới Vào Kho"}
              </h2>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="modal-form">
              <div className="form-field">
                <label>Tiêu đề phim *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Avengers: Hồi Kết"
                  required
                  value={movieForm.title}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, title: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Thể loại *</label>
                  <select
                    value={movieForm.genre}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, genre: e.target.value })
                    }
                  >
                    <option value="action">Hành động (Action)</option>
                    <option value="romance">Lãng mạn (Romance)</option>
                    <option value="sci-fi">Khoa học viễn tưởng (Sci-Fi)</option>
                    <option value="animation">Hoạt hình (Animation)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Năm phát hành *</label>
                  <input
                    type="text"
                    placeholder="2024"
                    required
                    value={movieForm.releaseDate}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, releaseDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>URL Hình ảnh Poster *</label>
                <input
                  type="text"
                  placeholder="https://... hoặc /images/actions/marvel1.jpg"
                  required
                  value={movieForm.image}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, image: e.target.value })
                  }
                />
              </div>

              {/* Live Preview ảnh poster */}
              {movieForm.image && (
                <div className="image-preview-container">
                  <img
                    src={movieForm.image}
                    alt="Preview"
                    className="image-preview-box"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    ✓ Xem trước Poster hợp lệ
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>URL Video (YouTube Embed hoặc file MP4) *</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/... hoặc link mp4"
                  required
                  value={movieForm.videoUrl}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, videoUrl: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>URL Phụ đề (.vtt - Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="/subtitles/sub1.vtt"
                  value={movieForm.subtitleUrl}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, subtitleUrl: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Mô tả nội dung phim *</label>
                <textarea
                  placeholder="Tóm tắt ngắn gọn nội dung bộ phim..."
                  rows="3"
                  required
                  value={movieForm.description}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, description: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary">
                  {editingMovie ? "Lưu Thay Đổi" : "Thêm Phim Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
