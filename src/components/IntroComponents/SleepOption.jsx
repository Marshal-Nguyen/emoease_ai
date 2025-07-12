import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const SleepQuestion = React.forwardRef(
  (
    {
      currentQuestion,
      formData,
      onOptionSelect,
      options,
      questionText,
      showConfirmButton = false,
      onConfirm,
      isLoading = false,
    },
    ref
  ) => {
    const isOptionSelected =
      formData && formData[currentQuestion] !== undefined;
    const shouldReduceMotion = useReducedMotion();

    // Animation variants cố định
    const containerVariants = {
      initial: { opacity: 1, y: 0 }, // Loại bỏ animation ban đầu để tránh trạng thái khác nhau
      animate: { opacity: 1, y: 0 },
    };

    const optionVariants = {
      initial: { scale: 1, opacity: 1 }, // Loại bỏ hiệu ứng ban đầu để đảm bảo hiển thị ngay
      animate: { scale: 1, opacity: 1 },
    };

    return (
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative z-20" // Đã xóa lớp nền màu đen
      >
        <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.5);
              border-radius: 3px;
            }
            .custom-scrollbar {
              scroll-snap-type: y mandatory;
            }
            .custom-option {
              filter: brightness(1.2);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            .selected-option {
              transform: scale(1.05) !important;
            }
            .selected-option:hover {
              transform: scale(1.05) !important;
            }
          `}
        </style>

        <motion.h1
          className="text-2xl sm:text-2xl md:text-3xl text-white font-bold mb-10 text-center relative"
          variants={containerVariants}
          initial="initial"
          animate="animate">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            {questionText}
          </span>
        </motion.h1>

        <div className="relative w-full min-w-[280px] max-w-3xl max-h-[60vh] overflow-y-auto custom-scrollbar px-4 sm:px-6 rounded-lg">
          {options.map((option, index) => (
            <motion.div
              key={option.value}
              className="snap-start py-2 h-[75px] flex items-center custom-option"
              variants={optionVariants}
              initial="initial"
              animate="animate">
              <div
                onClick={() => onOptionSelect(option.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && onOptionSelect(option.value)
                }
                role="button"
                tabIndex={0}
                className={`
                  bg-white/15 backdrop-blur-sm p-3 rounded-lg cursor-pointer
                  transform transition-all duration-300 w-full
                  hover:bg-white/25 hover:-translate-y-1
                  ${
                    formData[currentQuestion] === option.value
                      ? "ring-2 ring-blue-400 bg-white/30 selected-option"
                      : "hover:scale-[1.02]"
                  }
                  flex items-center mx-auto h-[60px]
                `}>
                <div className="flex items-center gap-3 w-full">
                  <span className="inline-flex items-center justify-center w-8 h-8 text-2xl">
                    {option.icon}
                  </span>
                  <div className="text-left flex-1">
                    <h3 className="text-white font-semibold">{option.label}</h3>
                    <p
                      className="text-white/80 text-xs sm:text-sm"
                      style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>
                      {option.description}
                    </p>
                  </div>
                  {formData[currentQuestion] === option.value && (
                    <span className="text-blue-400 text-xl">✓</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showConfirmButton && isOptionSelected && (
          <div className="mt-4 sm:mt-6 flex justify-center">
            <motion.button
              initial={{ opacity: 1, y: 0 }} // Loại bỏ animation ban đầu
              animate={{ opacity: 1, y: 0 }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : { scale: 1.03, backdropFilter: "blur(12px)" }
              }
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              onClick={onConfirm}
              disabled={isLoading}
              className="
                px-5 py-3
                bg-[#602985]/15 backdrop-blur-md
                border-2 border-[#602985]/40
                text-white rounded-xl
                transition-all duration-300
                flex items-center gap-4
                shadow-[0_4px_20px_rgba(96,41,133,0.3)]
                hover:bg-[#602985]/25
                hover:border-[#602985]/60
                hover:shadow-[0_8px_25px_rgba(96,41,133,0.4)]
                disabled:opacity-50
                group
              ">
              <span className="text-base sm:text-lg font-medium tracking-wide">
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
              </span>
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              ) : (
                <motion.svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  animate={{ x: 0 }}
                  whileHover={shouldReduceMotion ? {} : { x: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  }
);

export default SleepQuestion;