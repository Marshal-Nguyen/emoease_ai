import React from "react";

const SimpleTokenExpiredModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-xl p-6 border border-red-200 max-w-sm w-full">
        {/* Icon và tiêu đề */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Phiên đăng nhập hết hạn
            </h3>
          </div>
        </div>

        {/* Nội dung */}
        <div className="mb-6">
          <p className="text-gray-700">
            Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.
          </p>
        </div>

        {/* Nút */}
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 shadow-lg"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTokenExpiredModal;
