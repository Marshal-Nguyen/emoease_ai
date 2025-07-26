import React, { useState } from "react";
import { useSelector } from "react-redux";

/**
 * Component để debug và kiểm tra token thực tế
 */
const TokenDebugger = () => {
  const { token } = useSelector((state) => state.auth);
  const [localStorageToken, setLocalStorageToken] = useState(
    localStorage.getItem("token")
  );

  const refreshLocalStorage = () => {
    setLocalStorageToken(localStorage.getItem("token"));
  };

  const checkLocalStorage = () => {
    const keys = ["token", "userRole", "profileId", "userId", "username"];
    const data = {};
    keys.forEach((key) => {
      data[key] = localStorage.getItem(key);
    });
    console.log("📦 LocalStorage data:", data);
    return data;
  };

  const createTestToken = () => {
    // Tạo token test hết hạn
    const testTokenData = {
      sub: "test123",
      role: "User",
      iat: Math.floor(Date.now() / 1000) - 7200, // 2 giờ trước
      exp: Math.floor(Date.now() / 1000) - 3600, // Hết hạn 1 giờ trước
    };

    // Tạo JWT giả (base64 encode)
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify(testTokenData));
    const signature = "fake_signature";

    const testToken = `${header}.${payload}.${signature}`;

    localStorage.setItem("token", testToken);
    console.log("🧪 Đã tạo test token hết hạn:", testToken);

    // Reload trang để Redux store update
    window.location.reload();
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Token Debugger</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Redux Token:
          </label>
          <div className="p-3 bg-white rounded border text-xs font-mono break-all">
            {token || "Không có token"}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LocalStorage Token:
          </label>
          <div className="p-3 bg-white rounded border text-xs font-mono break-all">
            {localStorageToken || "Không có token"}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={refreshLocalStorage}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
          >
            Refresh LocalStorage
          </button>

          <button
            onClick={checkLocalStorage}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
          >
            Log LocalStorage (Console)
          </button>

          <button
            onClick={createTestToken}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
          >
            Tạo Token Test (Hết hạn)
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Sử dụng Console (F12) để xem chi tiết debug logs
        </div>
      </div>
    </div>
  );
};

export default TokenDebugger;
