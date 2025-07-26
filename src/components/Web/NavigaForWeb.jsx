// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import styles from "../../styles/Web/Navigation.module.css";
// import { useSelector, useDispatch } from "react-redux";
// import { openLoginModal } from "../../store/authSlice"; // Import action mở modal
// import { toast } from "react-toastify"; // Import toast

// const NavigaForWeb = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const location = useLocation();
//   const dispatch = useDispatch();

//   // ✅ Lấy role từ Redux
//   const userRole = useSelector((state) => state.auth.userRole);
//   const [isLoggedIn, setIsLoggedIn] = useState(!!userRole);

//   useEffect(() => {
//     setIsLoggedIn(!!userRole);
//   }, [userRole]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // ✅ Chặn Doctor, Staff, Manager không được làm test
//   const handleTestClick = (event) => {
//     if (["Doctor", "Staff", "Manager"].includes(userRole)) {
//       event.preventDefault(); // Chặn chuyển trang
//       toast.warning("Bạn không thể truy cập vào bài kiểm tra!"); // Hiển thị thông báo
//     }
//   };

//   return (
//     <nav className="ml-8 flex items-center px-6 py-5 rounded-2xl bg-white shadow-[0px_5px_4px_-5px_#00000041]">
//       {/* Left Navigation */}
//       <div className="flex space-x-10 text-gray-600 font-medium items-center">
//         <Link
//           to="TestQuestionList"
//           className={`hover:text-purple-500 ${
//             location.pathname === "/HomeUser/TestQuestionList"
//               ? "text-purple-500"
//               : ""
//           }`}>
//           Game
//         </Link>
//         <Link
//           to="learnAboutEmo"
//           className={`hover:text-purple-500 ${
//             location.pathname === "/HomeUser/learnAboutEmo"
//               ? "text-purple-500"
//               : ""
//           }`}>
//           Learn about EmoEase
//         </Link>
//         <Link
//           to="counselor"
//           className={`hover:text-purple-500 ${
//             location.pathname === "/HomeUser/counselor" ? "text-purple-500" : ""
//           }`}>
//           Therapist
//         </Link>
//       </div>

//       {/* Logo */}
//       <div className="flex-grow flex justify-center mx-10">
//         <div
//           className={`${styles.knewave} text-[#4a2580] font-light text-5xl tracking-widest`}>
//           EMOEASE
//         </div>
//       </div>

//       {/* Right Navigation */}
//       <div className="flex space-x-15 text-gray-600 font-medium items-center">
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className={`block cursor-pointer ${
//               location.pathname === "/HomeUser/workshop"
//                 ? "text-purple-500"
//                 : ""
//             }`}
//             aria-expanded={isOpen}>
//             Extras
//           </button>

//           {isOpen && (
//             <div className="absolute left-0 mt-2 w-40 bg-white shadow-md rounded-md border z-999">
//               <Link
//                 onClick={() => setIsOpen(false)}
//                 to="workshop"
//                 className={`block px-4 py-2 hover:bg-gray-100 ${
//                   location.pathname === "/workshop" ? "text-purple-500" : ""
//                 }`}>
//                 Workshop
//               </Link>
//               <Link
//                 onClick={() => setIsOpen(false)}
//                 to="shop"
//                 className={`block px-4 py-2 hover:bg-gray-100 hover:rounded-md ${
//                   location.pathname === "/shop" ? "text-purple-500" : ""
//                 }`}>
//                 Store
//               </Link>
//             </div>
//           )}
//         </div>
//         <Link
//           to="blog"
//           className={`hover:text-purple-500 ${
//             location.pathname === "/blog" ? "text-purple-500" : ""
//           }`}>
//           Blog
//         </Link>

//         {/* ✅ Check trạng thái đăng nhập */}
//         {isLoggedIn ? (
//           <Link
//             to="testEmotion"
//             onClick={handleTestClick} // Chặn role bị cấm
//             className="bg-[#9553f2] text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700">
//             Take the test
//           </Link>
//         ) : (
//           <button
//             onClick={() => dispatch(openLoginModal())}
//             className="bg-[#9553f2] text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700">
//             Take the test
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default NavigaForWeb;
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../../styles/Web/Navigation.module.css";
import { useSelector, useDispatch } from "react-redux";
import { openLoginModal } from "../../store/authSlice";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import StartButton from "../Chat/StartButton";
import LogIn from "../Web/LogIn";
import { Menu } from "lucide-react";

// Hook kiểm tra kích thước màn hình
function useShortMenuLabel() {
  const [short, setShort] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setShort(window.innerWidth < 1100 && window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return short;
}

const NavigaForWeb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();

  const userRole = useSelector((state) => state.auth.userRole);
  const isLoggedIn = !!userRole;
  const shortMenu = useShortMenuLabel();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRestrictedAction = (message, callback) => (event) => {
    event.preventDefault();
    toast.info(message, {
      position: "top-center",
      autoClose: 2000,
    });
    callback?.();
  };

  const handleTestClick = (event) => {
    console.log("userRole:", userRole);
    if (["Doctor", "Staff", "Manager"].includes(userRole)) {
      toast.info("Bạn không thể truy cập vào bài kiểm tra!", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleComingSoon = handleRestrictedAction(
    "Coming Soon! This feature is under development."
  );
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };
  return (
    <nav className="w-full max-w-6xl mx-auto px-4 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-lg relative transition-all duration-300">
      <div className="hidden md:flex items-center w-full">
        {/* Menu trái */}
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div
            className="w-12 h-12 rounded-full overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: "url('/emo.webp')",
              visibility: "hidden",
            }}
          />
          <a
            href="#"
            onClick={handleComingSoon}
            className="hover:text-purple-500 cursor-pointer relative group text-base"
            data-tooltip-id="coming-soon-tooltip"
            data-tooltip-content="Coming Soon!"
          >
            {shortMenu ? "Ga.." : "Game"}
            <span className="absolute -top-2 -right-4 bg-yellow-400 text-xs px-1 rounded-full text-white">
              Soon
            </span>
          </a>
          <Link
            to="learnAboutEmo"
            className={`hover:text-purple-500 text-base ${location.pathname === "/EMO/learnAboutEmo"
              ? "text-purple-500"
              : ""
              }`}
          >
            {shortMenu ? "Lear..." : "Learn about EmoEase"}
          </Link>
          {/* {userRole === "User" && ( */}
          <Link
            to="counselor"
            className={`hover:text-purple-500 ${location.pathname === "/EMO/counselor" ? "text-purple-500" : ""
              }`}
          >
            Therapist
          </Link>
          {/* )} */}
        </div>
        {/* Logo giữa */}
        <div className="flex flex-1 justify-center min-w-0">
          <Link to="/">
            <div
              className={`${styles.knewave} text-[#4a2580] font-light text-5xl tracking-widest`}
            >
              EMOEASE
            </div>
          </Link>
        </div>
        {/* Menu phải */}
        <div className="flex flex-1 items-center justify-end gap-4 min-w-0">
          {/* Ẩn Extras khi shortMenu là true */}
          <a
            href="#"
            onClick={handleComingSoon}
            className="hover:text-purple-500 cursor-pointer relative group text-base"
            data-tooltip-id="coming-soon-tooltip"
            data-tooltip-content="Coming Soon!"
          >
            {shortMenu ? "Ex.." : "Extras"}
            <span className="absolute -top-2 -right-4 bg-yellow-400 text-xs px-1 rounded-full text-white">
              Soon
            </span>
          </a>
          <Link
            to="shop"
            className={`hover:text-purple-500 ${location.pathname === "/EMO/shop" ? "text-purple-500" : ""
              }`}
          >
            Store
          </Link>
          {isLoggedIn ? (
            <Link to="/AIChatBoxWithEmo" onClick={handleTestClick}>
              <StartButton />
            </Link>
          ) : (
            <StartButton onClick={() => dispatch(openLoginModal())} />
          )}
          <div className="">
            <LogIn />
          </div>
        </div>
      </div>
      {/* Navigation cho mobile */}
      <div className="flex w-full items-center justify-between md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/30 backdrop-blur-md shadow px-3 py-2 rounded-xl text-sm font-semibold"
        >
          <Menu className="w-5 h-5 text-[#C8A2C8]" />
        </button>
        <div className="pointer-events-none select-none flex-1 flex justify-center">
          <div
            className={`${styles.knewave} text-[#4a2580] font-light text-2xl tracking-widest`}
          >
            EMOEASE
          </div>
        </div>
        <div className="mr-1 flex items-center ">
          <LogIn />
        </div>
      </div>
      {/* Dành cho mở popup mobile */}
      {isOpen && (
        <>
          {/* Overlay làm tối nền */}
          <div
            className="fixed inset-0 bg-black/40 z-[999]"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng menu"
          />
          {/* Menu mobile */}
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 w-full bg-gradient-to-b from-purple-50 to-white shadow-lg rounded-b-2xl z-[1000] pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out"
          >
            <div className="p-4">
              <Link
                to="learnAboutEmo"
                className="flex items-center justify-between px-4 py-3 bg-white bg-opacity-90 rounded-lg mb-2 hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200 text-base border-none shadow-sm"
                onClick={handleMenuItemClick}
              >
                <span>Learn about EmoEase</span>
                <span className="text-purple-500">📖</span>
              </Link>
              <Link
                to="shop"
                className="flex items-center justify-between px-4 py-3 bg-white bg-opacity-90 rounded-lg mb-2 hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200 text-base border-none shadow-sm"
                onClick={handleMenuItemClick}
              >
                <span>Store</span>
                <span className="text-purple-500">🛒</span>
              </Link>
              {isLoggedIn ? (
                <Link
                  to="/AIChatBoxWithEmo"
                  onClick={handleTestClick}
                  className="flex items-center justify-center px-4 py-2"
                >
                  <span>
                    <StartButton />
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleMenuItemClick();
                    dispatch(openLoginModal());
                  }}
                  className="flex items-center justify-center w-full text-left px-4 py-2"
                >
                  <span>
                    <StartButton />
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
      <Tooltip id="coming-soon-tooltip" place="top" effect="solid" />
    </nav>
  );
};

export default NavigaForWeb;
