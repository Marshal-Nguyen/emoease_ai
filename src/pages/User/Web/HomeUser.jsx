import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Outlet } from "react-router-dom";
import { openLoginModal } from "../../../store/authSlice";
import NavigaForWeb from "../../../components/Web/NavigaForWeb";
import Footer from "../../../components/Web/Footer";
import Social from "../../../components/Web/Social";
import PremiumChatPopup from "../../../components/Web/ChatPopUp";

const Home = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const userRole = useSelector((state) => state.auth.userRole);
  const [isLoggedIn, setIsLoggedIn] = useState(!!userRole);

  // Thêm state để kiểm tra kích thước màn hình
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    setIsLoggedIn(!!userRole);
  }, [userRole]);

  useEffect(() => {
    // Hàm kiểm tra kích thước màn hình
    const handleResize = () => {
      setShowFooter(window.innerWidth >= 640); // Ẩn Footer nếu nhỏ hơn 640px (sm)
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      {location.pathname !== "/HomeUser/dashboardUser" && (
        <header className="flex items-center justify-between px-4 md:px-10 pt-4 w-full">
          <nav className="flex-1 flex justify-center">
            <NavigaForWeb />
          </nav>
        </header>
      )}

      {/* Nội dung chính */}
      <main className="flex justify-center">
        <Outlet />
      </main>

      {/* Hiển thị Social nếu đúng đường dẫn */}
      <div className="bottom-[12%] fixed z-50">
        {location.pathname === "/EMO/learnAboutEmo" && <Social />}
      </div>

      {/* Kiểm tra đăng nhập trước khi hiển thị PremiumChatPopup */}
      <div>
        {isLoggedIn ? (
          <PremiumChatPopup />
        ) : (
          <div className="bottom-4 right-4 fixed z-50">
            <button
              onClick={() => dispatch(openLoginModal())}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-[#602985] text-white shadow-lg hover:bg-gray-800 focus:outline-none transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {location.pathname === "/EMO/learnAboutEmo" && showFooter && <Footer />}
    </div>
  );
};

export default Home;
