import React from "react";
import { motion } from "framer-motion";

const personalityOptions = [
  {
    value: "None",
    label: "Không chắc lắm",
    description:
      "Bạn vẫn đang tìm hiểu bản thân – điều đó là hoàn toàn bình thường 💭",
    icon: "🤔",
  },
  {
    value: "Introversion",
    label: "Hướng nội",
    description: "Bạn thấy thoải mái khi ở một mình và thích sự yên tĩnh.",
    icon: "🧘",
  },
  {
    value: "Extroversion",
    label: "Hướng ngoại",
    description:
      "Bạn thích trò chuyện, gặp gỡ mọi người và luôn tràn đầy năng lượng.",
    icon: "🎉",
  },
  {
    value: "Adaptability",
    label: "Linh hoạt",
    description: "Bạn có thể hướng nội hoặc hướng ngoại tùy vào tình huống.",
    icon: "🔄",
  },
];

export const PersonalityQuestion = React.forwardRef(
  (
    { selectedPersonality, onPersonalitySelect, onSubmit, isSubmitting },
    ref
  ) => {
    const handleSelectPersonality = (value) => {
      onPersonalitySelect(value);
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
          className="text-xl sm:text-3xl text-white font-bold mb-2 text-center relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r mb-10 from-white to-purple-200">
            Bạn cảm thấy mình giống kiểu người nào nhất hiện tại?
          </span>
          <motion.div
            className="absolute -bottom-2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-400 to-white rounded-full"
            style={{ transform: "translateX(-50%)" }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "4rem", opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
        </motion.h1>

        <p className="text-white/60 text-sm text-center mt-4 mb-10">
          Đừng lo nếu chưa chắc chắn. Câu trả lời này chỉ giúp EmoEase hiểu bạn
          hơn một chút 💜
        </p>

        <div className="relative w-4/5 max-w-3xl h-[255px] overflow-y-auto custom-scrollbar hide-scrollbar pt-3 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {personalityOptions.map((option) => (
              <motion.div
                key={option.value}
                className="snap-start"
                initial={{ scale: 0.9, opacity: 0.6 }}
                whileInView={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  },
                }}
                viewport={{
                  once: false,
                  amount: 0.8,
                  margin: "-5%",
                }}>
                <div
                  onClick={() => handleSelectPersonality(option.value)}
                  className={`
                    bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer
                    transform transition-all duration-300 w-full
                    hover:bg-white/20 hover:-translate-y-1
                    ${
                      selectedPersonality === option.value
                        ? "ring-2 ring-blue-400 bg-white/30 scale-105"
                        : "hover:scale-[1.02]"
                    }
                    flex items-center mx-auto h-[100px]
                  `}>
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold">
                        {option.label}
                      </h3>
                      <p className="text-white/70 text-xs line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                    {selectedPersonality === option.value && (
                      <span className="text-blue-400 text-xl">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.03,
            backdropFilter: "blur(12px)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedPersonality}
          className="mt-6 px-5 py-3 bg-[#602985]/10 backdrop-blur-md border-2 border-[#602985]/30 text-white rounded-xl transition-all duration-300 flex items-center gap-4 shadow-[0_4px_20px_rgba(96,41,133,0.2)] hover:bg-[#602985]/20 hover:border-[#602985]/50 hover:shadow-[0_8px_25px_rgba(96,41,133,0.3)] disabled:opacity-50">
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

export default PersonalityQuestion;
