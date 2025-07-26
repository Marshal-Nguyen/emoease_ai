import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentFailure = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Định dạng số tiền sang VND
  const formatAmount = (amount) => {
    if (!amount) return "Không xác định";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm lấy thông báo lỗi từ mã lỗi VNPay
  const getVNPayErrorMessage = (responseCode) => {
    const errorMessages = {
      24: "Transaction canceled by customer",
      51: "Insufficient account balance",
      65: "Transaction limit exceeded for the day",
      75: "Payment bank under maintenance",
      99: "Unknown error",
      "02": "Transaction failed",
    };
    return errorMessages[responseCode] || "Transaction failed";
  };

  // Animation cho X mark
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  // Thông tin lỗi từ state hoặc giá trị mặc định
  const errorInfo = {
    responseCode: state?.responseCode || "99",
    message:
      state?.message ||
      getVNPayErrorMessage(state?.responseCode) ||
      "Giao dịch thất bại",
    error: state?.error,
    transactionId: state?.txnRef || "Unknown",
    amount: state?.amount || null,
    orderInfo: state?.orderInfo || "Thanh toán dịch vụ tư vấn tâm lý",
    time: new Date().toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };

  if (!state) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-red-500 text-xl font-bold">
          Some thing went wrong. Please try again later.
        </h1>
        <button
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          onClick={() => navigate("/EMO")}
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[cals[100vh-10px]]">
      <img src="/FreeYourMind.png" className="h-[200px]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden"
        style={{ boxShadow: "0 8px 20px rgba(217, 88, 88, 0.1)" }}
      >
        <div className="flex flex-row h-full">
          {/* Left side - Red gradient with error icon */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 w-1/4 flex flex-col justify-center items-center p-6 rounded-r-3xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4"
            >
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isLoaded ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </svg>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-bold text-white text-center"
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              Payment Failed
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-red-100 mt-2 text-center italic"
            >
              "We're here to help you resolve this issue"
            </motion.p>
          </div>

          {/* Right side - Content */}
          <div className="w-3/4 p-6">
            <div className="flex flex-row h-full">
              {/* Transaction Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-1/2 pr-4"
              >
                <h2 className="text-red-800 font-medium text-lg mb-3">
                  Transaction Details
                </h2>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center border-b border-red-100 pb-3">
                      <span className="text-red-700 font-medium">
                        Error Code:
                      </span>
                      <span className="font-bold text-red-900">
                        {errorInfo.responseCode}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-red-100 py-3">
                      {/* <span className="text-red-700 font-medium">
                        Error Message:
                      </span> */}
                      <span className="font-mono text-red-900 text-sm">
                        {errorInfo.message}
                      </span>
                    </div>

                    {errorInfo.amount && (
                      <div className="flex justify-between items-center border-b border-red-100 py-3">
                        <span className="text-red-700 font-medium">
                          Amount:
                        </span>
                        <span className="text-red-900 text-sm">
                          {formatAmount(errorInfo.amount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-red-700 font-medium">Time:</span>
                      <span className="text-red-900 text-sm">
                        {errorInfo.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error details */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 rounded-lg p-4 border border-red-100 bg-white"
                >
                  <h3 className="text-red-800 font-medium mb-2 text-sm">
                    What happened?
                  </h3>
                  <p className="text-red-700 text-xs">
                    {errorInfo.error ||
                      "Your payment could not be processed. This may be due to insufficient funds, connection issues, or bank restrictions. Please try again or use a different payment method."}
                  </p>
                </motion.div>
              </motion.div>

              {/* Support message and actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="w-1/2 pl-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-red-800 font-medium text-lg mb-3">
                    We're here to help
                  </h2>
                  <p className="text-red-600 text-sm mb-4">
                    Don't worry, your session has not been booked yet. You can
                    try again with a different payment method or contact our
                    support team for assistance.
                  </p>
                  <div className="bg-rose-50 rounded-lg p-4 border-l-4 border-rose-400">
                    <p className="text-rose-800 text-xs mb-2">
                      <strong>Need help?</strong> Our support team is available
                      to assist you:
                    </p>
                    <div className="flex items-center mb-1">
                      <svg
                        className="w-4 h-4 mr-2 text-rose-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs">hotro@emoease.com</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-rose-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-xs">1900 xxxx</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex flex-col space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 rounded-lg bg-red-600 text-white font-medium transition-all duration-300 hover:bg-red-700 text-sm"
                    onClick={() => {
                      navigate("/EMO");
                    }}
                  >
                    View Option
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-2 rounded-lg bg-transparent border border-red-300 text-red-600 font-medium transition-all duration-300 hover:bg-red-50 text-sm"
                    onClick={() => {
                      navigate("/EMO");
                    }}
                  >
                    Back to Home
                  </motion.button>
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4 text-right text-xs text-red-400"
                >
                  <p>
                    © 2025 EmoEase - Your story matters. We're here to listen.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;
