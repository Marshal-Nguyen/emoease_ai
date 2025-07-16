import React from "react";
import styles from "../../../styles/Dashboard/Patients/Navigation.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Thêm useLocation
import {
  LayoutDashboard,
  LogOut,
  Map,
  FileText,
  User,
  MessageCircleCode,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials } from "../../../store/authSlice";
import { toast } from "react-toastify";
import { useAuth } from "../../oauth/AuthContext";
const Navigation = () => {
  const dispatch = useDispatch();
  const profileId = useSelector((state) => state.auth.profileId);
  const { setIsLoggedIn } = useAuth();
  const nav = useNavigate();
  console.log("Test Profile", profileId);

  // Sử dụng useLocation để lấy thông tin URL hiện tại
  const location = useLocation();

  const NavItem = ({ icon, text, to }) => {
    // Kiểm tra xem đường dẫn hiện tại có chứa "to" hay không
    const isActive = location.pathname.includes(to);

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 cursor-pointer transition duration-300 font-medium ${
          isActive
            ? "text-white text-[15px] font-serif bg-gradient-to-r from-[#9284e0] to-[#5849b1] px-4 py-2.5 rounded-[11px] shadow-sm"
            : "text-[#554d4ddc] font-serif text-[15px] hover:text-[#5241b1] hover:bg-white/10 px-4 py-2.5 rounded-xl"
        }`}
      >
        {icon}
        <span className="tracking-wide">{text}</span>
      </Link>
    );
  };

  return (
    <div className={styles.container}>
      <div className="grid grid-cols-1 grid-rows-8 h-full text-center">
        <div className="row-span-2 flex items-center justify-center">
          <div className="w-35 flex justify-center items-center h-35 bg-gradient-to-b from-[#925FE2] to-[#7042C0] rounded-4xl">
            <img src="/LogoUpdate.png" alt="Logo" className="w-[70%]" />
          </div>
        </div>
        <div className="row-span-5 row-start-3 mt-4 flex justify-center">
          <nav className="flex flex-col gap-5 text-white font-light">
            <NavItem
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              to="StatictisPatient"
            />
            <NavItem icon={<Map size={20} />} text="Roadmap" to="Roadmap" />
            <NavItem
              icon={<FileText size={20} />}
              text="Records"
              to="HistoryPatient"
            />
            <NavItem
              icon={<ShoppingCart size={20} />}
              text="Shopping"
              to="Shopping"
            />
            <NavItem
              icon={<User size={20} />}
              text="Profile Patient"
              to="ProfilePatient"
            />
            <NavItem
              icon={<MessageCircleCode size={20} />}
              text="Messenger"
              to="Chat"
            />
          </nav>
        </div>
        <div className="row-start-8 hover:text-[#5D4DB8] flex justify-center gap-3 items-center rounded-xl px-2.5 mx-auto transition duration-200">
          <ArrowLeft size={20} strokeWidth={1.5} color="#554d4ddc" />
          <button
            type="button"
            onClick={() => nav("/")}
            className="cursor-pointer font-medium tracking-wide text-[#554d4ddc] hover:text-[#5D4DB8] font-serif"
          >
            Back To Home
          </button>
        </div>
        <div className="hover:text-[#5D4DB8] flex justify-center gap-3 items-center rounded-xl px-2.5 mx-auto transition duration-200">
          <LogOut size={20} strokeWidth={1.5} color="#554d4ddc" />
          <button
            type="button"
            onClick={() => {
              dispatch(clearCredentials());
              setIsLoggedIn(false);
              toast.success("Logout successfully!");
            }}
            className="cursor-pointer font-medium tracking-wide text-[#554d4ddc] hover:text-[#5D4DB8] font-serif"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
