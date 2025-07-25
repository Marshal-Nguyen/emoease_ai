import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  isTokenExpired,
  getTokenTimeRemaining,
  getTokenInfo,
} from "../../util/auth/tokenManager";
import { clearCredentials } from "../../store/authSlice";
import { useTokenValidator } from "../../hooks/useTokenValidator";

/**
 * Component demo để test các chức năng quản lý token
 * Chỉ dùng cho testing và development
 */
const TokenManagerDemo = () => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { forceCheckToken, forceExpiredModal } = useTokenValidator();

  const tokenInfo = token ? getTokenInfo(token) : null;
  const timeRemaining = token ? getTokenTimeRemaining(token) : 0;
  const expired = token ? isTokenExpired(token) : true;

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  if (!token) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto mt-8">
        <h3 className="text-lg font-bold text-red-600 mb-4">Không có token</h3>
        <p className="text-gray-600">
          Vui lòng đăng nhập để xem thông tin token.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Token Manager Demo
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Trạng thái token:
          </label>
          <span
            className={`inline-block px-2 py-1 rounded text-sm font-medium ${
              expired
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {expired ? "Đã hết hạn" : "Còn hiệu lực"}
          </span>
        </div>

        {!expired && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thời gian còn lại:
            </label>
            <span className="text-blue-600 font-mono">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}

        {tokenInfo && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thông tin token:
            </label>
            <div className="mt-1 text-sm text-gray-600">
              {tokenInfo.exp && (
                <div>
                  Hết hạn:{" "}
                  {new Date(tokenInfo.exp * 1000).toLocaleString("vi-VN")}
                </div>
              )}
              {tokenInfo.iat && (
                <div>
                  Tạo lúc:{" "}
                  {new Date(tokenInfo.iat * 1000).toLocaleString("vi-VN")}
                </div>
              )}
              {tokenInfo.sub && <div>User ID: {tokenInfo.sub}</div>}
              {tokenInfo.role && <div>Role: {tokenInfo.role}</div>}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Đăng xuất
            </button>

            <button
              onClick={forceCheckToken}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Kiểm tra Token ngay
            </button>

            <button
              onClick={forceExpiredModal}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Test Modal (Force)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenManagerDemo;
