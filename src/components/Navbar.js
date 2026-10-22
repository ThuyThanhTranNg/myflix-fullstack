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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo on Left */}
        <Link to="/" className="brand-name">
          MyFlix
        </Link>

        {/* Genre Links Centered */}
        <div className="navbar-links">
          {loggedInUser?.isAdmin ? (
            <>
              <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
                <FaUserShield style={{ marginRight: 4 }} /> Admin Portal
              </Link>
              <Link to="/movies" className={isActive("/movies") ? "active" : ""}>
                Movies
              </Link>
              <Link to="/movies/action" className={isActive("/movies/action") ? "active" : ""}>
                Action
              </Link>
              <Link to="/movies/sci-fi" className={isActive("/movies/sci-fi") ? "active" : ""}>
                Sci-Fi
              </Link>
              <Link to="/movies/animation" className={isActive("/movies/animation") ? "active" : ""}>
                Animation
              </Link>
              <Link to="/movies/romance" className={isActive("/movies/romance") ? "active" : ""}>
                Romance
              </Link>
            </>
          ) : (
            <>
              <Link to="/movies" className={isActive("/movies") ? "active" : ""}>
                Tất cả phim
              </Link>
              <Link to="/movies/action" className={isActive("/movies/action") ? "active" : ""}>
                Hành động
              </Link>
              <Link to="/movies/sci-fi" className={isActive("/movies/sci-fi") ? "active" : ""}>
                Viễn tưởng
              </Link>
              <Link to="/movies/animation" className={isActive("/movies/animation") ? "active" : ""}>
                Hoạt hình
              </Link>
              <Link to="/movies/romance" className={isActive("/movies/romance") ? "active" : ""}>
                Lãng mạn
              </Link>
            </>
          )}
        </div>

        {/* User Info or Sign Up Button */}
        <div className="navbar-user">
          {loggedInUser ? (
            <>
              <div className="user-info-pill">
                <div className="user-avatar-circle">
                  {(loggedInUser.username || "U")[0].toUpperCase()}
                </div>
                <span>{loggedInUser.username || "Thành viên"}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
                <FaSignOutAlt /> Đăng xuất
              </button>
            </>
          ) : (
            <button className="signup-link" onClick={handleSignUpClick}>
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;