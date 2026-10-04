import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom"; 

// Validation schemas
const loginSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string().required("Mật khẩu là bắt buộc"),
});

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required("Tên đăng nhập là bắt buộc")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  firstName: Yup.string().required("Họ là bắt buộc"),
  lastName: Yup.string().required("Tên là bắt buộc"),
  gender: Yup.string().required("Giới tính là bắt buộc"),
});

const AuthForm = ({ setLoggedInUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedInUser, setLoggedInUserState] = useState(null);
  const navigate = useNavigate();

  const formSchema = isLogin ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    const API_BASE = process.env.REACT_APP_API_URL || "https://myflix-backend-latest.onrender.com/api";
    try {
      if (isLogin) {
        // GỌI API ĐĂNG NHẬP
        const response = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.user.isAdmin ? "Đăng nhập thành công với tư cách Admin!" : `Đăng nhập thành công! Chào mừng ${result.user.username}`);
          setLoggedInUser(result.user);
          setLoggedInUserState(result.user);
          
          if (result.user.isAdmin) {
            navigate("/admin");
          }
        } else {
          alert(result.message || "Sai email hoặc mật khẩu. Vui lòng thử lại.");
        }
      } else {
        // GỌI API ĐĂNG KÝ
        const response = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          alert("Đăng ký thành công! Bây giờ bạn có thể đăng nhập.");
          setIsLogin(true);
        } else {
          alert(result.message || "Đăng ký thất bại.");
        }
      }
    } catch (error) {
      alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.");
      console.error(error);
    }
  };

  return (
    <div className="auth-wrapper">
      {loggedInUser ? (
        <div className="welcome-message">
          <h2>Chào mừng, {loggedInUser.username}!</h2>
          <button onClick={() => setLoggedInUserState(null)}>Đăng xuất</button>
        </div>
      ) : (
        <div className="auth-container">
          <div className="tabs">
            <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>
              Đăng Nhập
            </button>
            <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>
              Đăng Ký
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName">Họ</label>
                  <input
                    type="text"
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "is-invalid" : ""}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName.message}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Tên</label>
                  <input
                    type="text"
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "is-invalid" : ""}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName.message}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="username">Tên đăng nhập</label>
                  <input
                    type="text"
                    id="username"
                    {...register("username")}
                    className={errors.username ? "is-invalid" : ""}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username.message}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="gender-options">
                    <input type="radio" id="male" value="male" {...register("gender")} />
                    <label htmlFor="male">Nam</label>
                    <input type="radio" id="female" value="female" {...register("gender")} />
                    <label htmlFor="female">Nữ</label>
                    <input type="radio" id="other" value="other" {...register("gender")} />
                    <label htmlFor="other">Khác</label>
                  </div>
                  {errors.gender && (
                    <div className="invalid-feedback">{errors.gender.message}</div>
                  )}
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={errors.email ? "is-invalid" : ""}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                {...register("password")}
                className={errors.password ? "is-invalid" : ""}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>
            <button type="submit" className="btn-submit">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
