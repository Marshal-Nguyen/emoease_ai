import React from "react";
import { motion } from "framer-motion";

export const AllergiesQuestion = React.forwardRef(
  ({ allergies, onAllergiesChange, onSubmit, isSubmitting }, ref) => {
    const handleChange = (e) => {
      onAllergiesChange(e.target.value);
    };

    const handleSubmit = () => {
      if (onSubmit) {
        onSubmit();
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
        <motion.h1
          className="text-xl sm:text-3xl text-white font-semibold mb-10 text-center relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Nếu bạn có dị ứng hay nhạy cảm với gì đó,
            <br className="hidden sm:block" /> hãy chia sẻ để EmoEase lưu ý nhé
            💜
          </span>
          <motion.div
            className="absolute -bottom-2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-400 to-white rounded-full"
            style={{ transform: "translateX(-50%)" }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "4rem", opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-4/5 max-w-3xl mb-2">
          <input
            type="text"
            value={allergies || ""}
            onChange={handleChange}
            placeholder="Nhập các loại dị ứng nếu có (ví dụ: phấn hoa, hải sản...)"
            className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </motion.div>

        <p className="text-sm text-white/60 text-center mb-4">
          Nếu không có dị ứng nào, bạn có thể để trống và nhấn tiếp tục nhé.
        </p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-2 px-5 py-3 bg-[#602985]/10 backdrop-blur-md border-2 border-[#602985]/30 text-white rounded-xl transition-all duration-300 flex items-center gap-4 shadow-[0_4px_20px_rgba(96,41,133,0.2)] hover:bg-[#602985]/20 hover:border-[#602985]/50 hover:shadow-[0_8px_25px_rgba(96,41,133,0.3)] disabled:opacity-50">
          <span className="text-lg font-medium tracking-wide">
            {isSubmitting ? "Đang xử lý..." : "Tiếp tục nhé"}
          </span>
          {!isSubmitting && (
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
          )}
          {isSubmitting && (
            <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          )}
        </motion.button>
      </motion.div>
    );
  }
);

export default AllergiesQuestion;
