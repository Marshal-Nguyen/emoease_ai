import React from "react";
import styles from "../../../styles/Dashboard/Patients/Navigation.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  LogOut,
  Activity,
  ClipboardList,
  UserCircle,
  Heart,
  MessageCircleCode,
  ArrowLeft,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../../store/authSlice";
import { toast } from "react-toastify";
import { useAuth } from "../../oauth/AuthContext";
const Navigation = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { setIsLoggedIn } = useAuth();
  const navItems = [
    {
      icon: <Activity size={20} strokeWidth={1.5} />,
      text: "Dashboard",
      to: "StatictisDoctor",
    },
    {
      icon: <Brain size={20} strokeWidth={1.5} />,
      text: "Treatment Plan",
      to: "MedicalRecordsCreate",
    },
    {
      icon: <ClipboardList size={20} strokeWidth={1.5} />,
      text: "Booking",
      to: "PatientBooking",
    },
    {
      icon: <MessageCircleCode size={20} strokeWidth={1.5} />,
      text: "Messenger",
      to: "Chat",
    },
    // {
    //   icon: <ClipboardList size={20} strokeWidth={1.5} />,
    //   text: "Patient History",
    //   to: "History",
    // },
    {
      icon: <UserCircle size={20} strokeWidth={1.5} />,
      text: "My Profile",
      to: "ProfileDoctor",
    },
  ];

  const NavItem = ({ icon, text, to }) => {
    const isActive = location.pathname.includes(to);

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 cursor-pointer transition duration-300 font-medium ${isActive
            ? "text-white text-[15px] font-serif bg-gradient-to-r from-[#9284e0] to-[#6d5fbe] px-4 py-2.5 rounded-[11px] shadow-sm"
            : "text-[#554d4ddc] font-serif text-[15px] hover:text-[#5D4DB8] hover:bg-white/10 px-4 py-2.5 rounded-xl"
          }`}
      >
        {icon}
        <span className="tracking-wide">{text}</span>
      </Link>
    );
  };

  const nav = useNavigate();

  return (
    <div className={styles.container}>
      <div className="grid grid-cols-1 grid-rows-8 h-full text-center">
        <div className="row-span-2 flex items-center justify-center">
          <div
            className="w-35 flex justify-center items-center h-35
          bg-gradient-to-b from-[#bb95f7a2] to-[#7042c0]

            rounded-2xl shadow-md"
          >
            <img src="/LogoUpdate.png" className="w-[70%]" />
          </div>
        </div>

        <div className="row-span-5 row-start-3 mt-4 flex justify-center">
          <nav className="flex flex-col gap-5 text-white">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                text={item.text}
                to={item.to}
              />
            ))}
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

        <div className="hover:text-[#5D4DB8] flex justify-center gap-3 items-center  rounded-xl px-2.5 mx-auto transition duration-200">
          <LogOut size={20} strokeWidth={1.5} color="#554d4ddc" />
          <button
            type="button"
            onClick={() => {
              dispatch(clearCredentials());
              setIsLoggedIn(false);
              toast.success("Logout successfully");
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
