import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "../../styles/Web/BackGround.module.css";
import DownloadSection from "./DownloadSection";
import IntrFPT from "./IntrFPT";
import IssueEmotion from "./IssueEmotion";
import OptionService from "./OptionService";
import ImproveEmotion from "./ImproveEmotion";
import QuestionRequest from "./QuestionRequest";
import GoogleMapComponent from "../GoogleMap/GoogleMapComponent";

const MOBILE_MAX_WIDTH = 768;

const BackGround = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_MAX_WIDTH : false
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Khởi tạo giá trị ban đầu
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className="relative min-w-screen h-[150vh] overflow-hidden">
        {/* Nền chính - Không di chuyển */}
        <div
          className="absolute top-30 left-0 w-full h-screen"
          style={{
            backgroundImage: "url('/bg_HomeCenter.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: `translateY(${scrollY * 0.1}px)`,
            zIndex: -1,
          }}></div>

        {/* Component DownloadSection nằm chính giữa ảnh nền */}
        <div className="absolute top-1/7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full">
          <DownloadSection />
        </div>

        {/* Các lớp ảnh di chuyển */}
        <motion.img
          src="/bg_HomeUnder.webp"
          alt=""
          animate={{ y: -scrollY * 0.3 }}
          className="absolute top-[20%] left-0 w-full h-[120vh] scale-100 object-cover"
        />

        <motion.img
          src="/bg_HomeBottomRight.webp"
          alt=""
          animate={{ y: -scrollY * 0.1 }}
          className="absolute top-[13%] left-0 w-full h-[120vh] scale-110 object-cover"
        />
      </div>
      {isMobile ? (
        <div className="w-full flex justify-center items-center min-h-[60vh] bg-gradient-to-b from-white via-purple-50 to-white">
          <div className="relative bg-gradient-to-br from-[#f3e8ff] via-white to-[#e0e7ff] border-2 border-purple-200 rounded-3xl shadow-2xl px-6 py-10 text-center max-w-xs mx-auto flex flex-col items-center gap-4 overflow-hidden">
            {/* Icon floating */}
            <div className="absolute -top-8 -right-8 bg-[#c4b5fd] rounded-full w-24 h-24 flex items-center justify-center opacity-30 animate-pulse z-0"></div>
            <div className="absolute -bottom-8 -left-8 bg-[#a5b4fc] rounded-full w-16 h-16 flex items-center justify-center opacity-20 animate-pulse z-0"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="inline-block text-6xl mb-2 animate-bounce">
                💻✨
              </span>
              <h2 className="text-xl font-extrabold text-[#4F258A] mb-2 drop-shadow">
                Chào mừng bạn đến với EmoEase!
              </h2>
              <p className="text-base text-[#4F258A] font-medium leading-relaxed mb-2">
                <span className="font-semibold text-purple-700 block mb-1">
                  Trải nghiệm đầy đủ và tối ưu nhất chỉ có trên máy tính.
                </span>
                Một số tính năng nâng cao của EmoEase hiện chỉ khả dụng trên
                giao diện desktop.
                <br />
                <span className="italic text-sm text-gray-500">
                  (Hãy thử truy cập lại bằng máy tính để tận hưởng trọn vẹn!)
                </span>
              </p>
              <div className="mt-3 flex justify-center">
                <svg width="56" height="56" fill="none" viewBox="0 0 56 56">
                  <rect width="56" height="56" rx="16" fill="#F3E8FF" />
                  <path
                    d="M18 42h20M22 38V24a6 6 0 1 1 12 0v14"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="22"
                    y="38"
                    width="12"
                    height="4"
                    rx="2"
                    fill="#C4B5FD"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <IntrFPT />
          </div>
          {/* <div>
            <IssueEmotion />
          </div> */}
          <div>
            <ImproveEmotion />
          </div>
          <div>
            <QuestionRequest />
          </div>
          <div>
            <GoogleMapComponent />
          </div>
        </>
      )}
    </>
  );
};

export default BackGround;
