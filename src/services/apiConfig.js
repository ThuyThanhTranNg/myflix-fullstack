export const getApiBase = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.port === "3000"
  ) {
    // Khi đang chạy React Dev Server ở localhost:3000, gọi trực tiếp tới Backend cổng 8080
    return "http://localhost:8080/api";
  }
  return envUrl || "/api";
};
