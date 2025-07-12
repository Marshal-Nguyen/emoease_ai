import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const ImprovementGoalQuestion = React.forwardRef(
  (
    { selectedGoal, onGoalSelect, onSubmit, isLoading = false, goals = [] },
    ref
  ) => {
    const [selectedGoals, setSelectedGoals] = useState([]);

    useEffect(() => {
      if (selectedGoal) {
        setSelectedGoals(
          Array.isArray(selectedGoal) ? selectedGoal : [selectedGoal]
        );
      } else {
        setSelectedGoals([]);
      }
    }, [selectedGoal]);

    const handleSelectGoal = (value) => {
      let updatedGoals;
      if (selectedGoals.includes(value)) {
        updatedGoals = selectedGoals.filter((id) => id !== value);
      } else if (selectedGoals.length < 2) {
        updatedGoals = [...selectedGoals, value];
      } else {
        updatedGoals = [selectedGoals[1], value];
      }
      setSelectedGoals(updatedGoals);
      onGoalSelect(updatedGoals);
    };

    const handleSubmit = () => {
      if (selectedGoals.length === 0 && goals.length > 0) {
        const defaultGoal = [goals[0].value];
        setSelectedGoals(defaultGoal);
        onGoalSelect(defaultGoal);
      }
      if (onSubmit) {
        onSubmit();
      }
    };

    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-3 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-3 text-sm">Đang tải mục tiêu...</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative z-10">
        <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.5);
              border-radius: 3px;
            }
          `}
        </style>
        <motion.h1
          className="text-xl sm:text-3xl text-white font-bold mb-6 text-center relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Bạn muốn cải thiện điều gì nhất hiện tại?
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-center text-sm mb-7">
          Chọn tối đa 2 mục tiêu bạn muốn cải thiện
        </motion.p>

        <div className="relative w-full min-w-[280px] max-w-3xl max-h-[60vh] overflow-y-auto custom-scrollbar px-4 sm:px-6">
          {goals.map((goal, index) => {
            return (
              <motion.div
                key={goal.value}
                className="py-2 min-h-[80px] flex items-center"
                initial={{ scale: 1, opacity: 1 }} // Loại bỏ whileInView
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}>
                <div
                  onClick={() => handleSelectGoal(goal.value)}
                  className={`
                  bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer
                  transform transition-all duration-300 w-full
                  hover:bg-white/20 hover:-translate-y-1
                  ${
                    selectedGoals.includes(goal.value)
                      ? "ring-2 ring-blue-400 bg-white/30 scale-105"
                      : "hover:scale-[1.02]"
                  }
                  flex items-center
                `}>
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-3xl">🎯</span>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold">{goal.label}</h3>
                      <p className="text-white/70 text-xs sm:text-sm line-clamp-3">
                        {goal.description}
                      </p>
                    </div>
                    {selectedGoals.includes(goal.value) && (
                      <span className="text-blue-400 text-xl">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
          disabled={isLoading}
          className="mt-6 px-5 py-3
            bg-[#602985]/10 backdrop-blur-md
            border-2 border-[#602985]/30
            text-white rounded-xl
            transition-all duration-300
            flex items-center gap-4
            shadow-[0_4px_20px_rgba(96,41,133,0.2)]
            hover:bg-[#602985]/20
            hover:border-[#602985]/50
            hover:shadow-[0_8px_25px_rgba(96,41,133,0.3)]
            disabled:opacity-50
            group">
          <span className="text-lg font-medium tracking-wide">
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="bg-[#ffffff9d] backdrop-blur-md 
              px-3 py-1 rounded-full text-sm text-[#602985]
              border border-[#602985]/30 font-medium">
              {selectedGoals.length}/2
            </span>
            {!isLoading && (
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
            {isLoading && (
              <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </motion.button>
      </motion.div>
    );
  }
);

export default ImprovementGoalQuestion;
