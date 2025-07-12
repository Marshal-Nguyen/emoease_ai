import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

// Hook kiểm tra màn hình hẹp để rút gọn chữ
function useShortLabel() {
  const [short, setShort] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      // Ví dụ: nhỏ hơn 1100px thì rút gọn
      setShort(window.innerWidth < 1100);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return short;
}

const StartButton = ({ onClick }) => {
  const shortLabel = useShortLabel();

  return (
    <motion.button
      onClick={onClick}
      className="relative hover:cursor-pointer overflow-hidden group rounded-full px-3 py-3 bg-[#f4e4ff] shadow-lg hover:shadow-xl border border-purple-200 flex items-center gap-3 transition-all duration-300 focus:outline-none"
      whileHover={{
        boxShadow: "0 8px 32px 0 rgba(168, 85, 247, 0.25)",
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-0 group-hover:opacity-80 transition-opacity duration-300"
        style={{ zIndex: 0 }}
      />

      {/* Button content */}
      <div className="relative flex items-center gap-2 z-10">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <MessageCircle className="w-5 h-5 text-purple-400" />
        </motion.div>

        <span className="font-semibold text-[16px] text-purple-600 drop-shadow-sm">
          {shortLabel ? "Chat" : "Talk to Emo"}
        </span>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}>
          <Sparkles className="w-5 h-5 text-pink-400" />
        </motion.div>
      </div>

      {/* Sparkle effects */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.7, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1,
        }}
        style={{ zIndex: 1 }}>
        <div className="text-purple-200 text-5xl">✨</div>
      </motion.div>
    </motion.button>
  );
};

export default StartButton;
