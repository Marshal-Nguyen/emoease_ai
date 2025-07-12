import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const ThankYouScreen = React.forwardRef(({ onComplete }, ref) => {
  const [countdown, setCountdown] = useState(4);
  const navigate = useNavigate();

  // Countdown logic
  useEffect(() => {
    if (countdown === 0) {
      navigate("/EMO");
      if (onComplete) onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate, onComplete]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
      <motion.h1
        className="text-2xl sm:text-3xl text-white font-bold mb-4 text-center relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
          Cảm ơn bạn đã chia sẻ thông tin!
        </span>
        <motion.div
          className="absolute -bottom-2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-400 to-white rounded-full"
          style={{ transform: "translateX(-50%)" }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "4rem", opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/80 text-sm sm:text-base text-center mb-6">
        Chúng tôi sẽ chuyển hướng bạn về trang chính trong{" "}
        <span className="font-bold text-purple-200">{countdown}</span> giây...
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.03,
          backdropFilter: "blur(12px)",
        }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/EMO")}
        className="px-5 py-3 bg-[#602985]/10 backdrop-blur-md border-2 border-[#602985]/30 text-white rounded-xl transition-all duration-300 flex items-center gap-4 shadow-[0_4px_20px_rgba(96,41,133,0.2)] hover:bg-[#602985]/20 hover:border-[#602985]/50 hover:shadow-[0_8px_25px_rgba(96,41,133,0.3)]">
        <span className="text-lg font-medium tracking-wide">
          Về trang chính
        </span>
        <motion.svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          animate={{ x: 0 }}
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400 }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </motion.svg>
      </motion.button>
    </motion.div>
  );
});

export default ThankYouScreen;
