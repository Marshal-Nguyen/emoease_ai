// utils/api.js
import { useSelector } from "react-redux";
import { useCallback } from "react";

export const useApi = () => {
  const token = useSelector((state) => state.auth.token);

  // Memo hóa để không tạo mới mỗi lần render
  const fetchWithAuth = useCallback(
    async (url, { params = {}, ...options } = {}) => {
      const query = new URLSearchParams(params).toString();
      const fullUrl = query ? `${url}?${query}` : url;
      const res = await fetch(fullUrl, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Fetch error");
      return res.json();
    },
    [token]
  );

  return { fetchWithAuth };
};
