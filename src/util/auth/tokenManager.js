import { jwtDecode } from "jwt-decode";

/**
 * Kiểm tra xem token có hết hạn hay không
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token hết hạn, false nếu còn hạn
 */
export const isTokenExpired = (token) => {
  if (!token) {
    console.log("🔍 Token không tồn tại");
    return true;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Chuyển đổi sang giây

    console.log("🔍 Thông tin token:", {
      exp: decodedToken.exp,
      currentTime,
      expired: decodedToken.exp && decodedToken.exp < currentTime,
    });

    // Kiểm tra nếu token có exp field và so sánh với thời gian hiện tại
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.log("⚠️ Token đã hết hạn!");
      return true;
    }

    console.log("✅ Token còn hiệu lực");
    return false;
  } catch (error) {
    console.error("❌ Lỗi khi decode token:", error);
    return true; // Nếu có lỗi thì coi như token hết hạn
  }
};

/**
 * Lấy thời gian còn lại của token (tính bằng milliseconds)
 * @param {string} token - JWT token
 * @returns {number} - Thời gian còn lại tính bằng milliseconds, 0 nếu hết hạn
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp) {
      const timeRemaining = (decodedToken.exp - currentTime) * 1000;
      return timeRemaining > 0 ? timeRemaining : 0;
    }

    return 0;
  } catch (error) {
    console.error("Lỗi khi decode token:", error);
    return 0;
  }
};

/**
 * Lấy thông tin từ token
 * @param {string} token - JWT token
 * @returns {object|null} - Thông tin decode từ token hoặc null nếu có lỗi
 */
export const getTokenInfo = (token) => {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Lỗi khi decode token:", error);
    return null;
  }
};
