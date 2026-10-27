import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import { getApiBase } from "../services/apiConfig";
import "./AuthForm.css";

const AuthForm = ({ setLoggedInUser }) => {
  // authMode: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    gender: "male",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotForm, setForgotForm] = useState({
    email: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const navigate = useNavigate();

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    if (type === "error") {
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // ================= XỬ LÝ ĐĂNG NHẬP =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password) {
      showFeedback("error", "Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${getApiBase()}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showFeedback(
          "success",
          result.user.isAdmin
            ? "Đăng nhập thành công với quyền Quản trị viên!"
            : `Đăng nhập thành công! Chào mừng ${result.user.username || result.user.email}.`
        );

        if (setLoggedInUser) setLoggedInUser(result.user);
        if (loginForm.rememberMe) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        setTimeout(() => {
          if (result.user.isAdmin) {
            navigate("/admin");
          } else {
            navigate("/movies");
          }
        }, 800);
      } else {
        showFeedback(
          "error",
          result.message || "Sai email hoặc mật khẩu. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      showFeedback(
        "error",
        "Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại dịch vụ."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= XỬ LÝ ĐĂNG KÝ =================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, username, gender, email, password, confirmPassword } =
      registerForm;

    if (!username.trim() || !email.trim() || !password) {
      showFeedback("error", "Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (password.length < 6) {
      showFeedback("error", "Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      showFeedback("error", "Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${getApiBase()}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username: username.trim(),
          gender,
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showFeedback(
          "success",
          "Đăng ký tài khoản thành công! Đang chuyển sang trang Đăng nhập..."
        );
        setLoginForm({
          ...loginForm,
          email: email.trim(),
          password: "",
        });
        setTimeout(() => {
          setAuthMode("login");
          setFeedback(null);
        }, 1500);
      } else {
        showFeedback("error", result.message || "Đăng ký không thành công.");
      }
    } catch (error) {
      showFeedback(
        "error",
        "Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= XỬ LÝ QUÊN MẬT KHẨU =================
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const { email, newPassword, confirmNewPassword } = forgotForm;

    if (!email.trim() || !newPassword) {
      showFeedback("error", "Vui lòng nhập Email và Mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      showFeedback("error", "Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showFeedback("error", "Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${getApiBase()}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showFeedback(
          "success",
          "Đặt lại mật khẩu thành công! Đang chuyển sang Đăng nhập..."
        );
        setLoginForm({
          ...loginForm,
          email: email.trim(),
          password: newPassword,
        });
        setTimeout(() => {
          setAuthMode("login");
          setFeedback(null);
        }, 1500);
      } else {
        showFeedback(
          "error",
          result.message || "Không thể đặt lại mật khẩu với email này."
        );
      }
    } catch (error) {
      showFeedback(
        "error",
        "Lỗi kết nối khi gửi yêu cầu. Vui lòng kiểm tra lại Backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header Logo */}
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            MyFlix
          </Link>
          <p className="auth-subtitle">
            {authMode === "login" && "Đăng nhập để xem hàng ngàn bộ phim bom tấn"}
            {authMode === "register" && "Tạo tài khoản MyFlix hoàn toàn miễn phí"}
            {authMode === "forgot" && "Khôi phục quyền truy cập vào tài khoản của bạn"}
          </p>
        </div>

        {/* Tab Switcher (Chỉ hiển thị khi ở Login hoặc Register) */}
        {authMode !== "forgot" && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                setFeedback(null);
              }}
            >
              <FaSignInAlt style={{ marginRight: 6 }} /> Đăng Nhập
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("register");
                setFeedback(null);
              }}
            >
              <FaUserPlus style={{ marginRight: 6 }} /> Đăng Ký
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div className={`auth-alert ${feedback.type}`}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {feedback.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
              {feedback.message}
            </span>
          </div>
        )}

        {/* FORM 1: ĐĂNG NHẬP */}
        {authMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
            <div className="auth-form-group">
              <label htmlFor="login-email">Địa chỉ Email</label>
              <div className="auth-input-container">
                <input
                  type="email"
                  id="login-email"
                  placeholder="name@example.com"
                  required
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="auth-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="••••••••"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="auth-extra-row">
              <label className="auth-remember-me">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, rememberMe: e.target.checked })
                  }
                />
                Ghi nhớ đăng nhập
              </label>

              <span
                className="link-forgot-pw"
                onClick={() => {
                  setAuthMode("forgot");
                  setFeedback(null);
                }}
              >
                Quên mật khẩu?
              </span>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>

            {/* Prompt switch to Register */}
            <div className="auth-switch-prompt">
              Bạn chưa có tài khoản?
              <span
                className="auth-switch-link"
                onClick={() => {
                  setAuthMode("register");
                  setFeedback(null);
                }}
              >
                Đăng ký ngay
              </span>
            </div>
          </form>
        )}

        {/* FORM 2: ĐĂNG KÝ */}
        {authMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>Họ</label>
                <div className="auth-input-container">
                  <input
                    type="text"
                    placeholder="Nguyễn"
                    value={registerForm.firstName}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="auth-form-group">
                <label>Tên</label>
                <div className="auth-input-container">
                  <input
                    type="text"
                    placeholder="Văn A"
                    value={registerForm.lastName}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="auth-form-group">
              <label>Tên đăng nhập *</label>
              <div className="auth-input-container">
                <input
                  type="text"
                  placeholder="nguyenvana"
                  required
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      username: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Giới tính</label>
              <div className="auth-gender-group">
                <div className="auth-gender-option">
                  <input
                    type="radio"
                    id="gen-male"
                    name="gender"
                    value="male"
                    checked={registerForm.gender === "male"}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, gender: e.target.value })
                    }
                  />
                  <label htmlFor="gen-male">Nam</label>
                </div>
                <div className="auth-gender-option">
                  <input
                    type="radio"
                    id="gen-female"
                    name="gender"
                    value="female"
                    checked={registerForm.gender === "female"}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, gender: e.target.value })
                    }
                  />
                  <label htmlFor="gen-female">Nữ</label>
                </div>
                <div className="auth-gender-option">
                  <input
                    type="radio"
                    id="gen-other"
                    name="gender"
                    value="other"
                    checked={registerForm.gender === "other"}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, gender: e.target.value })
                    }
                  />
                  <label htmlFor="gen-other">Khác</label>
                </div>
              </div>
            </div>

            <div className="auth-form-group">
              <label>Email *</label>
              <div className="auth-input-container">
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Mật khẩu (tối thiểu 6 ký tự) *</label>
              <div className="auth-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-form-group">
              <label>Xác nhận mật khẩu *</label>
              <div className="auth-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản MyFlix"}
            </button>

            {/* Prompt switch to Login */}
            <div className="auth-switch-prompt">
              Bạn đã có tài khoản?
              <span
                className="auth-switch-link"
                onClick={() => {
                  setAuthMode("login");
                  setFeedback(null);
                }}
              >
                Đăng nhập ngay
              </span>
            </div>
          </form>
        )}

        {/* FORM 3: QUÊN / KHÔI PHỤC MẬT KHẨU */}
        {authMode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
            <div className="auth-form-group">
              <label>Email tài khoản đã đăng ký</label>
              <div className="auth-input-container">
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={forgotForm.email}
                  onChange={(e) =>
                    setForgotForm({ ...forgotForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Mật khẩu mới (tối thiểu 6 ký tự)</label>
              <div className="auth-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={forgotForm.newPassword}
                  onChange={(e) =>
                    setForgotForm({
                      ...forgotForm,
                      newPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-form-group">
              <label>Xác nhận mật khẩu mới</label>
              <div className="auth-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={forgotForm.confirmNewPassword}
                  onChange={(e) =>
                    setForgotForm({
                      ...forgotForm,
                      confirmNewPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              <FaKey /> {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </button>

            <div className="auth-switch-prompt">
              <span
                className="auth-switch-link"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  setAuthMode("login");
                  setFeedback(null);
                }}
              >
                <FaArrowLeft style={{ fontSize: 12 }} /> Quay lại Đăng nhập
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
