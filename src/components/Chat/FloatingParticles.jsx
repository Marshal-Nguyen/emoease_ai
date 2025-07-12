import React, { useMemo } from "react";
import { motion } from "framer-motion";

// Cấu hình số lượng, màu và kích thước hạt
const PARTICLE_COUNT = 12;
const CLOUD_COUNT = 5;

const particleColors = [
  "bg-[#C8A2C8]/30",
  "bg-[#6B728E]/30",
  "bg-[#F06292]/20",
  "bg-pink-200/40",
  "bg-purple-300/30",
  "bg-indigo-200/30",
];

const particleSizes = ["w-2 h-2", "w-3 h-3", "w-4 h-4", "w-5 h-5", "w-6 h-6"];

// Có thể thay bằng SVG icons hoặc cloud component
const cloudIcons = ["☁️", "🌥️", "🌤️", "⛅", "🌦️"];

const FloatingParticles = React.memo(() => {
  // Tạo particles một lần
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map(() => ({
        size: particleSizes[Math.floor(Math.random() * particleSizes.length)],
        color:
          particleColors[Math.floor(Math.random() * particleColors.length)],
        delay: Math.random() * 5,
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
        duration: 12 + Math.random() * 10,
      })),
    []
  );

  // Tạo clouds một lần
  const clouds = useMemo(
    () =>
      Array.from({ length: CLOUD_COUNT }).map((_, i) => ({
        left: `${5 + Math.random() * 90}%`,
        top: `${5 + Math.random() * 80}%`,
        fontSize: `${3 + Math.random() * 3}rem`,
        icon: cloudIcons[i % cloudIcons.length],
        delay: i * 1.2,
        duration: 20 + Math.random() * 10,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden">
      {particles.map((particle, index) => (
        <motion.div
          key={`particle-${index}`}
          className={`absolute rounded-[50%] ${particle.size} ${particle.color}`}
          style={{
            left: particle.left,
            top: particle.top,
            filter: "blur(1px)",
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -10, 10, 0],
            opacity: [0.3, 0.6, 0.4, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {clouds.map((cloud, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute text-gray-500 opacity-20"
          style={{
            left: cloud.left,
            top: cloud.top,
            fontSize: cloud.fontSize,
            filter: "blur(1.5px)",
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -20, 10, 0],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: "easeInOut",
          }}>
          {cloud.icon}
        </motion.div>
      ))}
    </div>
  );
});

export default FloatingParticles;
