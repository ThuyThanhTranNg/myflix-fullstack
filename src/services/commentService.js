import { getApiBase } from "./apiConfig";

const getCommentsUrl = () => `${getApiBase()}/comments`;

// Lấy danh sách bình luận (toàn bộ hoặc theo phim)
export const getComments = async (movieId = null) => {
  const url = movieId
    ? `${getCommentsUrl()}?movieId=${encodeURIComponent(movieId)}`
    : getCommentsUrl();
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không thể tải bình luận");
  return await res.json();
};

// Đăng bình luận mới
export const createComment = async (commentData) => {
  const res = await fetch(getCommentsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Lỗi khi đăng bình luận");
  }
  return await res.json();
};

// Xóa bình luận (Dành cho Admin duyệt/xóa spam)
export const deleteComment = async (commentId) => {
  const res = await fetch(`${getCommentsUrl()}/${commentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Lỗi khi xóa bình luận");
  }
  return await res.json();
};
