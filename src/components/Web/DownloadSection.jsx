import styles from "../../styles/Web/DownloadSection.module.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openLoginModal } from "../../store/authSlice";
import { toast } from "react-toastify";

const DownloadSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  // ✅ Lấy role từ Redux
  const userRole = useSelector((state) => state.auth.userRole);
  const [isLoggedIn, setIsLoggedIn] = useState(!!userRole);

  useEffect(() => {
    setIsLoggedIn(!!userRole);
  }, [userRole]);

  const handleTestClick = (event) => {
    if (["Doctor", "Staff", "Manager"].includes(userRole)) {
      event.preventDefault(); // Chặn chuyển trang
      toast.warning("Bạn không thể truy cập vào bài kiểm tra!"); // Hiển thị thông báo
    }
  };

  return (
    <div className={`${styles.container}`}>
      <h1 className={`${styles.title} leading-tight`}>Your story matters</h1>
      <h1 className={`${styles.title} leading-tight`}>We're here to listen.</h1>

      <p className={`${styles.subtitle} leading-tight`}>
        Find comfort, healing, and hope through every conversation.
      </p>
      <div className="flex items-center gap-7 mt-3">
        <button className="relative border hover:cursor-pointer rounded-xl bg-[#492580] max-w-48 h-13 px-3 font-mono font-thin text-white transition-colors duration-1000 ease-linear before:absolute before:inset-0 before:-z-[1] before:m-auto before:h-3/4 before:w-2/3 before:animate-ping before:rounded-xl before:bg-[#8566b1] hover:bg-[#8566b1] hover:before:bg-[#8566b1]">
          {isLoggedIn ? (
            <Link
              to="/EMO/testEmotion"
              onClick={handleTestClick}
              className="hover:cursor-pointer text-sm sm:text-sm md:text-sm ">
              Start Your Journey
            </Link>
          ) : (
            <span
              className="hover:cursor-pointer text-sm sm:text-sm md:text-sm "
              onClick={() => dispatch(openLoginModal())}>
              Start Your Journey
            </span>
          )}
        </button>
        <button className={styles.googlePlayButton}>
          <div className="flex max-w-48 h-13 px-3 gap-2 rounded-xl border border-[#6A4C93] items-center justify-center bg-black text-white dark:text-black dark:bg-white sm:h-14">
            <svg viewBox="30 336.7 120.9 129.2" className="w-5 sm:w-7">
              <path
                d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7  c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"
                fill="#FFD400"></path>
              <path
                d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3  c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"
                fill="#FF3333"></path>
              <path
                d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1  c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"
                fill="#48FF48"></path>
              <path
                d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6  c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"
                fill="#3BCCFF"></path>
            </svg>
            <div>
              <div className="text-[.5rem] sm:text-xs text-left">GET IT ON</div>
              <div className="text-sm font-semibold font-sans -mt-1 sm:text-xl">
                Google Play
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DownloadSection;
