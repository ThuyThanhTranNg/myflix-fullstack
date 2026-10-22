import { getApiBase } from "./apiConfig";

const getStatsUrl = () => `${getApiBase()}/stats`;

export const getStats = async () => {
  const res = await fetch(getStatsUrl());
  if (!res.ok) throw new Error("Không thể tải số liệu thống kê");
  return await res.json();
};
