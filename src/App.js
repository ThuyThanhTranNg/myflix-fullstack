import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ImageSlider from "./components/ImageSlider";
import MovieDetail from "./pages/MovieDetail";
import MovieListPage from "./pages/MovieListPage";
import AuthForm from "./components/AuthForm";
import Footer from "./components/Footer";
import AdminPage from "./pages/AdminPage";
import "./assets/styles.css";

const AppContent = ({ loggedInUser, setLoggedInUser }) => {
  const location = useLocation();
  // Ẩn thanh Navbar và Footer khi ở trang Admin để giao diện full màn hình
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && (
        <Navbar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/imageSlider" element={<ImageSlider />} />
        <Route
          path="/authform"
          element={<AuthForm setLoggedInUser={setLoggedInUser} />}
        />
        <Route path="/movies" element={<MovieListPage />} />
        <Route path="/movies/:genre" element={<MovieListPage />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route
          path="/admin"
          element={
            <AdminPage
              loggedInUser={loggedInUser}
              setLoggedInUser={setLoggedInUser}
            />
          }
        />
        <Route
          path="/admin/:genre"
          element={
            <AdminPage
              loggedInUser={loggedInUser}
              setLoggedInUser={setLoggedInUser}
            />
          }
        />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  // State để lưu thông tin người dùng đã đăng nhập (khôi phục từ localStorage nếu có)
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      } else {
        localStorage.removeItem("user");
      }
    } catch (e) {
      console.error(e);
    }
  }, [loggedInUser]);

  return (
    <Router>
      <AppContent
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
      />
    </Router>
  );
};

export default App;
