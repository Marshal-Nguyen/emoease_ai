import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isTokenExpired } from "../util/auth/tokenManager";
import { clearCredentials } from "../store/authSlice";

/**
 * Hook để kiểm tra token định kỳ và xử lý khi token hết hạn
 * @param {number} checkInterval - Khoảng thời gian kiểm tra (milliseconds), mặc định 2 phút
 */
export const useTokenValidator = (checkInterval = 2 * 60 * 1000) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const intervalRef = useRef(null);

  const handleTokenExpired = () => {
    // Dừng việc kiểm tra
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Hiển thị modal thông báo
    setShowExpiredModal(true);
  };

  const handleConfirmExpired = () => {
    // Đóng modal
    setShowExpiredModal(false);

    // Xóa credentials
    dispatch(clearCredentials());

    // Chuyển hướng về trang chủ bằng window.location
    window.location.href = "/";
  };

  const checkToken = () => {
    console.log("🔍 Kiểm tra token...", { token: token ? "có" : "không có" });
    if (token) {
      const expired = isTokenExpired(token);
      console.log("📊 Kết quả kiểm tra:", { expired });
      if (expired) {
        console.log("⚠️ Token đã hết hạn, hiển thị modal...");
        handleTokenExpired();
      } else {
        console.log("✅ Token còn hiệu lực");
      }
    }
  };

  useEffect(() => {
    // Kiểm tra ngay lập tức khi hook được mount
    if (token) {
      checkToken();

      // Thiết lập kiểm tra định kỳ
      intervalRef.current = setInterval(checkToken, checkInterval);
    }

    // Cleanup khi component unmount hoặc token thay đổi
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, checkInterval]);

  // Dừng kiểm tra khi không có token
  useEffect(() => {
    if (!token && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [token]);

  return {
    showExpiredModal,
    handleConfirmExpired,
    isTokenValid: token ? !isTokenExpired(token) : false,
    // Thêm function test manual
    forceCheckToken: checkToken,
    forceExpiredModal: () => setShowExpiredModal(true),
  };
};
