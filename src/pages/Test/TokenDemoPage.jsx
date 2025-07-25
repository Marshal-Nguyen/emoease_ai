import React from "react";
import TokenManagerDemo from "../../components/auth/TokenManagerDemo";
import TokenDebugger from "../../components/auth/TokenDebugger";

/**
 * Trang demo để test các chức năng quản lý token
 * Có thể truy cập qua /token-demo
 */
const TokenDemoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Token Manager Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trang này dùng để kiểm tra chức năng quản lý token. Token sẽ được
            kiểm tra tự động mỗi 2 phút. Khi token hết hạn, một popup sẽ xuất
            hiện và yêu cầu bạn xác nhận để chuyển về trang chủ.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Token Info */}
          <TokenManagerDemo />

          {/* Token Debugger */}
          <TokenDebugger />

          {/* Instructions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Hướng dẫn test
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="flex w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold items-center justify-center mr-3 mt-0.5">
                  1
                </span>
                <div>
                  <strong>Kiểm tra tự động:</strong> Token được kiểm tra mỗi 2
                  phút
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold items-center justify-center mr-3 mt-0.5">
                  2
                </span>
                <div>
                  <strong>Popup thông báo:</strong> Khi token hết hạn, popup sẽ
                  xuất hiện
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold items-center justify-center mr-3 mt-0.5">
                  3
                </span>
                <div>
                  <strong>Chuyển hướng:</strong> Nhấn "Đồng ý" để về trang chủ
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold items-center justify-center mr-3 mt-0.5">
                  4
                </span>
                <div>
                  <strong>Test thủ công:</strong> Nhấn "Đăng xuất" để test ngay
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">Lưu ý</h4>
              <p className="text-sm text-yellow-700">
                Tính năng này sẽ hoạt động trên toàn bộ ứng dụng khi đã đăng
                nhập. Component TokenValidator đã được tích hợp vào App.jsx để
                kiểm tra token ở mọi trang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDemoPage;
