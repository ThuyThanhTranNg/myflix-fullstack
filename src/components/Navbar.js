import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaUserShield } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ loggedInUser, setLoggedInUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignUpClick = () => {
    navigate("/authform");
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      setLoggedInUser(null);
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  // Hiển thị nút Admin Portal nếu là Admin hoặc đang ở chế độ khách trải nghiệm
  const showAdminPortal = !loggedInUser || loggedInUser.isAdmin;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo bên trái */}
        <Link to="/movies" className="brand-name">
          MyFlix
        </Link>

        {/* Khu vực bên phải: Chỉ giữ lại Admin Portal + Thông tin tài khoản / Đăng nhập */}
        <div className="navbar-right">
          {showAdminPortal && (
            <Link
              to="/admin"
              className={`admin-portal-btn ${isActive("/admin") ? "active" : ""}`}
              title="Trang quản trị hệ thống"
            >
              <FaUserShield className="admin-btn-icon" />
              <span>Admin Portal</span>
            </Link>
          )}

          {loggedInUser ? (
            <div className="navbar-auth-group">
              <div className="user-info-pill">
                <div className="user-avatar-circle">
                  {(loggedInUser.username || "U")[0].toUpperCase()}
                </div>
                <span className="user-name-text">
                  {loggedInUser.username || "Thành viên"}
                </span>
              </div>
              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <FaSignOutAlt />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button
              className="signup-link"
              onClick={handleSignUpClick}
              title="Đăng nhập / Đăng ký"
            >
              <span>Đăng nhập / Đăng ký</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;