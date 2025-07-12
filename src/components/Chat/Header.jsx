import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Heart, Home, MessageCircle } from "lucide-react";
import FancyHomeButton from "./FancyHomeButton";

const Header = () => {
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-11 p-4 md:p-6 ">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div whileHover={{ scale: 1.12, rotate: 12 }}>
            <img
              src="/emo.webp"
              alt="Logo"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] flex items-center justify-center text-white shadow-lg"
            />
          </motion.div>
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl text-white group-hover:text-[#F3D1F4] transition-all tracking-tight">
              EmoEase – Ở đây để bạn là chính mình
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 font-serif italic mt-1">
              Một nơi đủ dịu để trái tim bạn được nghỉ ngơi
            </p>
          </div>
        </Link>

        {/* Menu Items */}

        <FancyHomeButton />
      </nav>
    </motion.header>
  );
};

export default Header;
