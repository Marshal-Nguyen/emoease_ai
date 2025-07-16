import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  // Định dạng số tiền sang VND
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  function parseDateTime(datetimeString) {
    const dateObj = new Date(datetimeString);

    if (isNaN(dateObj.getTime())) {
      return { date: null, time: null, error: "Invalid datetime string" };
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;

    return {
      date: formattedDate,
      time: formattedTime,
    };
  }

  const { date, time } = parseDateTime(state?.payDate);

  // Animation cho check mark
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

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
        style={{ boxShadow: "0 8px 20px rgba(131, 88, 217, 0.1)" }}
      >
        <div className="flex flex-row h-full">
          {/* Left side - Purple gradient with success icon */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-1/4 flex flex-col justify-center items-center p-6 rounded-r-3xl">
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
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
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
              Payment Successful!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-purple-100 mt-2 text-center italic"
            >
              "Find comfort, healing, and hope"
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
                <h2 className="text-purple-800 font-medium text-lg mb-3">
                  Transaction Details
                </h2>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                      <span className="text-purple-700 font-medium">
                        Amount:
                      </span>
                      <span className="font-bold text-purple-900">
                        {state.amount
                          ? formatAmount(state.amount)
                          : "Không xác định"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-purple-100 py-3">
                      <span className="text-purple-700 font-medium">
                        Transaction ID:
                      </span>
                      <span className="font-mono text-purple-900 text-sm">
                        {state?.transactionNo || "Không xác định"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-purple-700 font-medium">Time:</span>
                      <span className="text-purple-900 text-sm">
                        {date + " - " + time || "Không xác định"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin buổi hẹn */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 rounded-lg p-4 border border-purple-100 bg-white"
                >
                  <h3 className="text-purple-800 font-medium mb-2 text-sm">
                    Appointment Details:
                  </h3>
                  <p className="text-purple-700 text-xs">
                    **Your appointment confirmation has been sent to your email.
                    Our therapist will contact you as soon as possible.**
                  </p>
                </motion.div>
              </motion.div>

              {/* Thank you message and actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="w-1/2 pl-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-purple-800 font-medium text-lg mb-3">
                    Thank you!
                  </h2>
                  <p className="text-purple-600 text-sm mb-4">
                    Thank you for choosing EmoEase. We look forward to
                    supporting you on your therapeutic journey.
                  </p>
                  <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400">
                    <p className="text-indigo-800 text-xs">
                      <strong>Note:</strong> You will receive an email with
                      instructions on how to prepare for your first therapy
                      session. Please check your inbox regularly!
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex flex-col space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 rounded-lg bg-purple-600 text-white font-medium transition-all duration-300 hover:bg-purple-700 text-sm"
                    onClick={() => {
                      navigate("/EMO");
                    }}
                  >
                    Back to Home
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-2 rounded-lg bg-transparent border border-purple-300 text-purple-600 font-medium transition-all duration-300 hover:bg-purple-50 text-sm"
                    onClick={() => {
                      navigate("/EMO");
                    }}
                  >
                    View My Appointments
                  </motion.button>
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4 text-right text-xs text-purple-400"
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

export default PaymentSuccess;
