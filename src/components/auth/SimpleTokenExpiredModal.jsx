import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const SimpleTokenExpiredModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-6 border border-gray-200 max-w-md w-full mx-4">
        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-900">
              Phiên đăng nhập hết hạn
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 text-base">
            Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 shadow-md"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTokenExpiredModal;