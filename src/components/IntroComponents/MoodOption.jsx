// MoodOption.jsx (quay lại useEffect)
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Ripple = ({ isActive, onComplete }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.span
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ width: "100%", height: "100%", opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            transform: "translate(-50%, -50%) scale(2)",
            transformOrigin: "center",
          }}
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  );
};

export const MoodOption = ({ emoji, label, value, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick(value);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -3,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all overflow-hidden ${
        isSelected
          ? "bg-gradient-to-br from-[#602985] to-[#8034bb] text-white shadow-lg"
          : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
      }`}
      style={{ width: "80px", height: "80px" }}>
      <Ripple isActive={isClicked} onComplete={() => setIsClicked(false)} />
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-green-400 text-gray-900 w-4 h-4 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
      <motion.div
        className="text-2xl sm:text-3xl"
        animate={{
          rotate: isHovered ? [0, 10, -10, 0] : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{
          duration: 0.5,
          type: "tween",
          times: [0, 0.3, 0.6, 1],
          loop: isHovered ? 1 : 0,
        }}>
        {emoji}
      </motion.div>
      <motion.div
        className="font-medium text-xs text-center mt-1 line-clamp-1"
        title={label}>
        {label}
      </motion.div>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-1 w-6 h-1 bg-white rounded-full"
        />
      )}
    </motion.div>
  );
};

const MOOD_MAPPING = {
  Angry: { emoji: "😡", label: "Tức giận" },
  Anxious: { emoji: "😨", label: "Lo lắng" },
  Ashamed: { emoji: "😳", label: "Xấu hổ" },
  Empty: { emoji: "😶", label: "Trống rỗng" },
  Fearful: { emoji: "😱", label: "Sợ hãi" },
  Guilty: { emoji: "😔", label: "Tội lỗi" },
  Happy: { emoji: "😊", label: "Hạnh phúc" },
  Helpless: { emoji: "😞", label: "Bất lực" },
  Hopeless: { emoji: "😢", label: "Tuyệt vọng" },
  Irritable: { emoji: "😣", label: "Cáu kỉnh" },
  Lonely: { emoji: "😢", label: "Cô đơn" },
  Sad: { emoji: "😔", label: "Buồn bã" },
  Stressed: { emoji: "😩", label: "Căng thẳng" },
  Tired: { emoji: "😴", label: "Mệt mỏi" },
  // Normal: { emoji: "😐", label: "Bình thường" },
};

export const MoodQuestion = React.forwardRef(
  (
    { selectedMoods, onMoodSelect, onConfirm, isLoading, emotions = [] },
    ref
  ) => {
    const [moodOptions, setMoodOptions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
      console.log("emotions in MoodQuestion:", emotions);
      if (emotions && emotions.length > 0) {
        setMoodOptions(
          emotions.map((emotion) => ({
            value: emotion.Id,
            emoji: MOOD_MAPPING[emotion.Name]?.emoji || "😶",
            label: MOOD_MAPPING[emotion.Name]?.label || emotion.Name,
          }))
        );
      } else {
        setMoodOptions([]);
      }
    }, [emotions]);

    const handleSelectMood = (value) => {
      console.log("Selected emotion value:", value);
      let updatedMoods = [...(selectedMoods || [])];
      if (updatedMoods.includes(value)) {
        updatedMoods = updatedMoods.filter((mood) => mood !== value);
      } else {
        updatedMoods.push(value);
      }
      onMoodSelect(updatedMoods);
    };

    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col justify-center items-center p-6 relative z-10">
          <p className="text-white">Đang tải...</p>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col justify-center items-center p-6 relative z-10">
          <p className="text-red-500">Lỗi: {error}</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
        <motion.h1
          className="text-2xl sm:text-3xl text-white font-bold mb-6 text-center relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Hôm nay bạn thấy thế nào?
          </span>
          <motion.div
            className="absolute -bottom-2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-400 to-white rounded-full"
            style={{ transform: "translateX(-50%)" }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "4rem", opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />
        </motion.h1>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-w-xl mx-auto my-4 overflow-y-auto max-h-[55vh]">
          {moodOptions?.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}>
              <MoodOption
                emoji={option.emoji}
                label={option.label}
                value={option.value}
                isSelected={selectedMoods?.includes(option.value) || false}
                onClick={handleSelectMood}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex flex-col items-center gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}>
          <div className="flex items-center gap-2 text-center">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#602985] to-[#7b42b0]"></div>
            <span className="text-white text-xs">
              Đã chọn: {selectedMoods?.length || 0} cảm xúc
            </span>
          </div>

          {selectedMoods?.length > 0 && (
            <motion.button
              onClick={onConfirm}
              disabled={isLoading}
              className={`mt-2 px-5 py-2 bg-gradient-to-r from-[#602985] to-[#7b42b0] text-white rounded-lg hover:bg-purple-800 transition-all flex items-center gap-1 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={{
                scale: isLoading ? 1 : 1.03,
              }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-1"></div>
                  <span className="text-sm">Đang xử lý</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Xác nhận</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  }
);

export default MoodQuestion;
