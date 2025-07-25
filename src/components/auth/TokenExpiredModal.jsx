import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const TokenExpiredModal = ({ isOpen, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full border-2 border-red-200"
          >
            {/* Icon cảnh báo */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
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

            {/* Tiêu đề */}
            <h2 className="text-lg font-bold text-gray-800 text-center mb-3">
              Phiên đăng nhập hết hạn
            </h2>

            {/* Nội dung */}
            <p className="text-gray-600 text-center mb-6 text-sm">
              Vui lòng đăng nhập lại để tiếp tục sử dụng.
            </p>

            {/* Nút xác nhận */}
            <div className="flex justify-center">
              <button
                onClick={onConfirm}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Đồng ý
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TokenExpiredModal;
