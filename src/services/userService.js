import { getApiBase } from "./apiConfig";

const getUsersUrl = () => `${getApiBase()}/users`;

export const getUsers = async () => {
  const res = await fetch(getUsersUrl());
  if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
  return await res.json();
};

export const updateUserRole = async (userId, isAdmin) => {
  const res = await fetch(`${getUsersUrl()}/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAdmin }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Lỗi khi cập nhật vai trò");
  }
  return await res.json();
};

export const deleteUser = async (userId) => {
  const res = await fetch(`${getUsersUrl()}/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Lỗi khi xóa người dùng");
  }
  return await res.json();
};
