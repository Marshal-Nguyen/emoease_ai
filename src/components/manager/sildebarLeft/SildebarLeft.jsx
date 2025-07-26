import React, { useState, useRef, useEffect } from "react";
import { AiFillApple, AiFillCaretDown, AiFillHeart } from "react-icons/ai";
import { toast } from "react-toastify";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import IconManager from "../../../util/icon/icon";
import styles from "../../../styles/Web/Navigation.module.css";
import "./SildebarLeft.css";

const { GrDocumentStore, FaUserDoctor, FaChartSimple, TbReportSearch, MdManageAccounts, CiGift, MdOutlineAssignmentReturned, TbDeviceIpadCancel, RiAccountPinCircleFill, BiLogOut, FaChevronDown, IoMdArrowDropdown, IoMdArrowDropup, TbFileInvoice, CgUserList, RiFeedbackFill, LiaFileInvoiceDollarSolid, GrUserManager, MdOutlineManageAccounts, GiStonePile, LiaGiftsSolid, VscGitPullRequestGoToChanges, GiGoldNuggets, GiReceiveMoney, GiEmeraldNecklace, GiCrystalEarrings, GiDiamondRing, GiNecklaceDisplay, AiOutlineGold, LiaMoneyBillWaveSolid, LiaCircleNotchSolid, IoDiamondOutline, PiDiamondsFourLight, MdWarehouse, MdOutlinePriceChange, GiWorld, FaMoneyBillTrendUp, TbBasketDiscount, GiStoneBlock, MdOutlinePayments, RiCopperDiamondLine } = IconManager;

const menuItemsData = [
    { id: 0, text: "Dashboard", path: 'dashboard', icon: <FaChartSimple />, subMenu: [] },
    { id: 1, text: "Users", path: 'viewCustomer', icon: <GrUserManager />, subMenu: [] },
    { id: 2, text: "Doctor", path: 'viewDoctor', icon: <FaUserDoctor />, subMenu: [] },
    // {
    //     id: 2, text: "Doctor", path: 'viewDoctor', icon: <FaUserDoctor />, subMenu: [
    //         { path: 'viewDoctor', text: 'List doctor' },
    //         { path: 'addDoctor', text: 'Add doctor' },
    //     ]
    // },
    { id: 3, text: "Bookings", path: 'booking', icon: <TbFileInvoice />, subMenu: [] },
    { id: 4, text: "Transactions", path: 'transaction', icon: <LiaMoneyBillWaveSolid />, subMenu: [] },
    // {
    //     id: 5, text: "Service Packages", path: 'promotion', icon: <LiaGiftsSolid />, subMenu: [
    //         { path: 'managePackages', text: 'List Packages' },
    //         { path: 'addPackages', text: 'Add Packages' },
    //     ]
    // },
    // { id: 6, text: "Pending Replies", path: 'view-message', icon: <RiFeedbackFill />, subMenu: [] },
];

const SildebarLeft = ({ onMenuClick }) => {
    const [activeItem, setActiveItem] = useState(menuItemsData[0]?.id);
    const [showSubMenu, setShowSubMenu] = useState({ [menuItemsData[0]?.id]: true });
    const actionRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const currentPath = location.pathname.split("/manager/")[1];
        const activeMenuItem = menuItemsData.find(
            (item) =>
                item.path?.toLowerCase() === currentPath?.toLowerCase() ||
                item.subMenu.some((subItem) => subItem.path?.toLowerCase() === currentPath?.toLowerCase())
        );

        if (activeMenuItem) {
            setShowSubMenu({ [activeMenuItem.id]: true });
            handleItemClick(activeMenuItem);

            setTimeout(() => {
                const currentItem = document.getElementById(`menu-item-${activeMenuItem.id}`);
                if (currentItem) {
                    document.documentElement.style.setProperty("--height-end", `${currentItem.offsetHeight}px`);
                    document.documentElement.style.setProperty("--top-end", `${currentItem.getBoundingClientRect().top}px`);
                }
            }, 300);
        }
    }, [location.pathname]);

    useEffect(() => {
        const currentItem = document.getElementById(`menu-item-${menuItemsData[0]?.id}`);
        if (currentItem) {
            document.documentElement.style.setProperty("--height-end", `${currentItem.offsetHeight}px`);
            document.documentElement.style.setProperty("--top-end", `${currentItem.getBoundingClientRect().top}px`);
        }
        if (actionRef.current) {
            actionRef.current.classList.add("runanimation");
        }
    }, []);

    const handleItemClick = (item) => {
        setActiveItem(item.id);
        setActionRef(item.id);
    };

    const setActionRef = (id) => {
        setTimeout(() => {
            const currentItem = document.getElementById(`menu-item-${id}`);
            if (currentItem) {
                document.documentElement.style.setProperty("--height-end", `${currentItem.offsetHeight}px`);
                document.documentElement.style.setProperty("--top-end", `${currentItem.getBoundingClientRect().top}px`);
            }
            if (actionRef.current) {
                actionRef.current.classList.remove("runanimation");
                void actionRef.current.offsetWidth; // Force reflow
                actionRef.current.classList.add("runanimation");
            }
        }, 0);
    };

    const handleSubMenuToggle = (index) => {
        setShowSubMenu((prev) => {
            const newState = Object.keys(prev).reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {});
            newState[index] = !prev[index];
            return newState;
        });
    };

    const handleLogOut = () => {
        toast.success('Logout successful. See you next time!');
        localStorage.clear();
    };

    return (
        <div className="w-56 z-120 flex flex-col bg-white shadow-md">
            <div className="flex items-center justify-center py-5 border-b border-white">
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`${styles.knewave} text-purple-400 font-light text-3xl tracking-widest`}
                >
                    EMOEASE
                </motion.div>
            </div>

            <div className="relative p-0 m-0 text-16 flex-1">
                {menuItemsData.map((item) => {
                    if (item.subMenu?.length > 0) {
                        return (
                            <div
                                key={item.id}
                                id={`menu-item-${item.id}`}
                                className={`my-2 ${activeItem === item.id ? " " : ""}`}
                            >
                                <div
                                    className={`flex items-center py-2 pl-5 pr-2 relative cursor-pointer hover:bg-gray-300 hover:rounded-full transition-all duration-500 ${activeItem === item.id ? "font-bold bg-gray-200 text-purple-500" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActionRef(activeItem);
                                        handleSubMenuToggle(item.id);
                                    }}
                                >
                                    <span className={`w-8 text-center text-base z-10 mr-2 ml-0.5 scale-130 ${activeItem === item.id ? "text-white" : ""}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.text}</span>
                                    <span className={`ml-auto transform transition-transform ${showSubMenu[item.id] ? "rotate-180" : ""}`}>
                                        <AiFillCaretDown />
                                    </span>
                                </div>

                                <div className={`${showSubMenu[item.id] ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
                                    {showSubMenu[item.id] && (
                                        <div>
                                            {item.subMenu.map((subItem) => (
                                                <NavLink
                                                    to={subItem.path}
                                                    key={subItem.path}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleItemClick(item);
                                                        onMenuClick(subItem.text);
                                                    }}
                                                    className={({ isActive }) => (isActive ? "text-purple-500 font-bold" : "")}
                                                >
                                                    <div className={`flex items-center m-5 hover:bg-gray-300 rounded-full ${activeItem === item.id ? "" : ""}`}>
                                                        <span className={`w-8 text-center text-base z-10 mr-2 ml-0.5 scale-130 ${activeItem === item.id ? "text-white" : "pl-4"}`}>
                                                            <AiFillHeart />
                                                        </span>
                                                        <span className={`${activeItem === item.id ? "" : "pl-4"}`}>{subItem.text}</span>
                                                    </div>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={item.id}
                            id={`menu-item-${item.id}`}
                            className={`my-2 ${activeItem === item.id ? "font-bold bg-gray-200 text-purple-500" : ""}`}
                        >
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-5 py-2 relative cursor-pointer hover:bg-gray-300 hover:rounded-full transition-all duration-500 ${activeItem === item.id ? "font-bold" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item);
                                    onMenuClick(item.text);
                                }}
                            >
                                <span className={`w-8 text-center text-base z-10 mr-2 ml-0.5 scale-130 ${activeItem === item.id ? "text-white" : ""}`}>
                                    {item.icon}
                                </span>
                                <span>{item.text}</span>
                            </NavLink>
                        </div>
                    );
                })}
            </div>

            <div>
                <NavLink to="/Emo">
                    <div className="flex items-center w-full p-2 my-3 bg-[#faf3e0] hover:bg-gray-100 rounded">
                        <BiLogOut size={24} className="mr-2 text-red-500" />
                        <span className="ml-4 text-lg text-gray-800">Back</span>
                    </div>
                </NavLink>
            </div>

            <div
                id="action"
                ref={actionRef}
                className="absolute w-10 h-[var(--height-end)] rounded-full bg-gradient-to-b from-[#C45AB3] to-[#DD789A] top-[var(--top-end)] left-2 transition-all duration-500 flex items-center justify-center scale-100"
            />
        </div>
    );
};

export default SildebarLeft;