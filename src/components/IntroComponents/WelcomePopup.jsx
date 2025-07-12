import React from "react";
import { motion } from "framer-motion";

export const WelcomePopup = ({ onClose }) => {
  return (
    <>
      {/* Backdrop với hiệu ứng mờ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        onClick={onClose}
      />

      {/* Popup chính */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 flex items-center justify-center z-40">
        <div className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-11/12 text-white border border-white/20 flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center font-[Cursive]">
            Welcome to EmoEase
          </h1>

          <div className="space-y-4 text-center text-sm md:text-base leading-relaxed mb-6">
            {/* <p className="font-medium text-lg md:text-xl text-blue-200">
              "Cảm xúc không có đúng sai — chỉ cần được lắng nghe."
            </p> */}

            <p>
              EmoEase được tạo ra như một{" "}
              <span className="text-yellow-200 font-medium">
                nơi chốn an toàn
              </span>
              , nơi bạn có thể tạm gác lại những ồn ào bên ngoài để quay về lắng
              nghe chính mình.
            </p>

            <div className="flex items-center justify-center space-x-2 py-1">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-16"></div>
              <span className="text-lg">✨</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-16"></div>
            </div>

            <p>
              Đây là bước đầu tiên trên hành trình thấu hiểu và chăm sóc sức
              khỏe tinh thần một cách chủ động và chân thành.
            </p>

            <p>
              Hãy chia sẻ đôi chút về bản thân — những điều tưởng chừng nhỏ bé
              ấy sẽ giúp EMO hiểu bạn hơn, đồng hành cùng bạn và đưa ra những
              gợi ý phù hợp nhất.
            </p>

            <div className="flex items-center justify-center space-x-2 py-1">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-16"></div>
              <span className="text-lg">🌱</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-16"></div>
            </div>

            <p className="font-medium">
              Bắt đầu từ sự thấu cảm, kết nối bằng sự tử tế.
            </p>

            <p className="text-blue-200">
              Hành trình chữa lành không cần phải hoàn hảo, chỉ cần bạn dám bước
              đi —{" "}
              <span className="font-semibold">
                phần còn lại, EMO sẽ đi cùng.
              </span>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-[#602985] to-[#7b42b0] text-white rounded-lg hover:bg-purple-800 transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2">
              <span>Bắt đầu ngay</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default WelcomePopup;
