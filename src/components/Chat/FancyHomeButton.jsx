import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const FancyHomeButton = () => {
  const location = useLocation();
  const isActive = location.pathname === "/";

  const [emoji, setEmoji] = useState("🏡");

  // Emoji theo giờ
  useEffect(() => {
    const hour = new Date().getHours();
    setEmoji(hour >= 6 && hour < 18 ? "🏡" : "🌙");
  }, []);

  // Tạo bong bóng
  const bubbles = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 6 + Math.random() * 10,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, []);

  // State để điều khiển hover cho glow aura
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-fit h-fit">
      {/* Bubble effect xung quanh */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-white/40 blur-md pointer-events-none"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: bubble.left,
            bottom: "-20px",
          }}
          animate={{
            y: [0, -50],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Nút chính */}
      <Link
        to="/"
        className="relative group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-2xl border backdrop-blur-md
            ${
              isActive
                ? "bg-white/30 text-[#C8A2C8] border-white/40"
                : "bg-white/20 hover:bg-white/30 text-[#C8A2C8]/80 border-white/20"
            }`}>
          {/* Emoji */}
          <motion.span
            className="text-lg"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}>
            {emoji}
          </motion.span>
          <span className="hidden sm:inline tracking-wide font-medium">
            Về chốn dịu dàng
          </span>
        </motion.div>

        {/* Glow aura - animate bằng Framer Motion thay vì Tailwind hover */}
        <motion.span
          className="absolute -inset-1.5 bg-gradient-to-r from-[#C8A2C8]/20 to-[#6B728E]/20 rounded-full blur-xl pointer-events-none"
          animate={{ opacity: isHovered ? 0.7 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </Link>
    </div>
  );
};

export default FancyHomeButton;
