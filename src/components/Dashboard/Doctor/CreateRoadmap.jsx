import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { FaSun, FaCloudMoon } from "react-icons/fa";
import { IoPartlySunnySharp } from "react-icons/io5";

// Hardcoded sessions data
const hardcodedSessions = [
    { id: "session1", startDate: "2025-07-14T00:00:00Z" },
    { id: "session2", startDate: "2025-07-15T00:00:00Z" },
    { id: "session3", startDate: "2025-07-16T00:00:00Z" },
    { id: "session4", startDate: "2025-07-31T00:00:00Z" },
];

// Hardcoded activities data
const hardcodedActivities = {
    session1: [
        {
            id: "act1",
            timeRange: "2025-07-14T08:00:00Z",
            duration: "30 minutes",
            status: "Pending",
            foodActivity: {
                name: "Breakfast",
                description: "Healthy oatmeal with fruits",
                mealTime: "Morning",
                foodNutrients: ["Fiber", "Vitamin C"],
                intensityLevel: "Low",
            },
        },
        {
            id: "act2",
            timeRange: "2025-07-14T10:00:00Z",
            duration: "45 minutes",
            status: "Pending",
            physicalActivity: {
                name: "Morning Walk",
                description: "Brisk walking in the park",
                intensityLevel: "Moderate",
                impactLevel: "Low",
            },
        },
    ],
    session2: [
        {
            id: "act3",
            timeRange: "2025-07-15T09:00:00Z",
            duration: "30 minutes",
            status: "Pending",
            foodActivity: {
                name: "Lunch",
                description: "Grilled chicken with vegetables",
                mealTime: "Noon",
                foodNutrients: ["Protein", "Vitamin A"],
                intensityLevel: "Low",
            },
        },
    ],
    session3: [
        {
            id: "act4",
            timeRange: "2025-07-16T14:00:00Z",
            duration: "60 minutes",
            status: "Pending",
            therapeuticActivity: {
                name: "Physical Therapy",
                description: "Rehabilitation exercises",
                intensityLevel: "Moderate",
                impactLevel: "Medium",
                instructions: "Follow therapist guidance",
            },
        },
    ],
    session4: [
        {
            id: "act5",
            timeRange: "2025-07-31T20:00:00Z",
            duration: "30 minutes",
            status: "Pending",
            PeriodName: "Tối",
            therapeuticActivity: {
                name: "Medication Review",
                description: "Review medication schedule with doctor",
                intensityLevel: "Low",
                impactLevel: "Low",
            },
        },
        {
            id: "act6",
            timeRange: "2025-07-31T08:00:00Z",
            duration: "30 minutes",
            status: "Pending",
            PeriodName: "Sáng",
            therapeuticActivity: {
                name: "Medication Review",
                description: "Review medication schedule with doctor",
                intensityLevel: "Low",
                impactLevel: "Low",
            },
        },
    ],
};

// Utility functions
const formatDateKey = (date) =>
    date
        ? `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
        : "";

const isToday = (date) => {
    const today = new Date("2025-07-31");
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

const formatDayName = (date) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][date.getDay()];

const getMonthName = (date) =>
    ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"][
    date.getMonth()
    ];

const getColorForPeriod = (periodName) =>
    ({ Sáng: "yellow", Chiều: "blue", Tối: "purple" })[periodName] || "gray";

const getPeriodForTime = (time) => {
    const hours = parseInt(time.split(":")[0]);
    if (hours < 12) return "Sáng";
    if (hours < 18) return "Chiều";
    return "Tối";
};

// Reusable Components
const DateButton = ({ date, isSelected, isToday, onClick }) => (
    <button
        className={`flex flex-col items-center p-3 min-w-16 rounded-lg ${isSelected
            ? "bg-purple-600 text-white"
            : `bg-white border ${isToday ? "border-purple-500" : "border-gray-200"}`
            }`}
        onClick={() => onClick(date)}
    >
        <span className="text-xs font-medium">{formatDayName(date)}</span>
        <span className="text-lg font-bold">{date.getDate()}</span>
        <span className="text-xs">{getMonthName(date)}</span>
    </button>
);

DateButton.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    isSelected: PropTypes.bool.isRequired,
    isToday: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

const TaskItem = ({ activityId, action, periodName, taskStatus, toggleTaskStatus }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex items-center">
        <div className="mx-4">
            <label
                className="relative text-[#FF91AF] flex items-center justify-center gap-2"
                htmlFor={`heart-${activityId}`}
            >
                <input
                    className="peer appearance-none"
                    id={`heart-${activityId}`}
                    name={`heart-${activityId}`}
                    type="checkbox"
                    checked={taskStatus[activityId] || false}
                    onChange={() => toggleTaskStatus(activityId)}
                />
                <span className="absolute left-0 top-1/2 h-5 w-5 -translate-x-full -translate-y-1/2 rounded-[0.25em] border-2 border-[#FF91AF] flex items-center justify-center"></span>
                <svg
                    className="absolute left-0 top-1/2 h-5 w-5 -translate-x-full -translate-y-1/2 duration-500 ease-out [stroke-dasharray:1000] [stroke-dashoffset:1000] peer-checked:[stroke-dashoffset:0]"
                    viewBox="0 0 68 87"
                    fill="transparent"
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M28.048 74.752c-.74 0-3.428.03-3.674-.175-3.975-3.298-10.07-11.632-12.946-15.92C7.694 53.09 5.626 48.133 3.38 42.035 1.937 38.12 1.116 35.298.93 31.012c-.132-3.034-.706-7.866 0-10.847C2.705 12.67 8.24 7.044 15.801 7.044c1.7 0 3.087-.295 4.55.875 4.579 3.663 5.515 8.992 7.172 14.171.142.443 3.268 6.531 2.1 7.698-.362.363-1.161-10.623-1.05-12.071.26-3.37 1.654-5.522 3.15-8.398 3.226-6.205 7.617-7.873 14.52-7.873 2.861 0 5.343-.274 8.049 1.224 16.654 9.22 14.572 23.568 5.773 37.966-1.793 2.934-3.269 6.477-5.598 9.097-1.73 1.947-4.085 3.36-5.774 5.424-2.096 2.562-3.286 5.29-5.598 7.698-4.797 4.997-9.56 10.065-14.522 14.872-1.64 1.588-10.194 6.916-10.672 7.873-.609 1.217 2.76-.195 4.024-.7"
                        strokeWidth="6"
                        pathLength="1000"
                        stroke="#FF91AF"
                    />
                </svg>
            </label>
        </div>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <div>
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${taskStatus[activityId] ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                    >
                        {taskStatus[activityId] ? "Hoàn thành" : "Chờ"}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

TaskItem.propTypes = {
    activityId: PropTypes.string.isRequired,
    action: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    periodName: PropTypes.string.isRequired,
    taskStatus: PropTypes.object.isRequired,
    toggleTaskStatus: PropTypes.func.isRequired,
};

const ActivityModal = ({ isOpen, onClose, selectedDate, onSave }) => {
    const [timeOfDay, setTimeOfDay] = useState("");
    const [activities, setActivities] = useState([]);
    const [currentActivity, setCurrentActivity] = useState("");

    const handleAddActivity = () => {
        if (currentActivity.trim() && timeOfDay) {
            setActivities([...activities, { name: currentActivity, timeOfDay }]);
            setCurrentActivity("");
            toast.success("Hoạt động đã được thêm vào danh sách!");
        } else {
            toast.error("Vui lòng chọn buổi và nhập tên hoạt động.");
        }
    };

    const handleDeleteActivity = (indexToDelete) => {
        setActivities(activities.filter((_, index) => index !== indexToDelete));
        toast.success("Hoạt động đã được xóa!");
    };

    const handleSave = () => {
        if (timeOfDay && activities.length > 0) {
            onSave(selectedDate, timeOfDay, activities);
            setTimeOfDay("");
            setActivities([]);
            setCurrentActivity("");
            onClose();
            toast.success("Lộ trình đã được lưu!");
        } else {
            toast.error("Vui lòng chọn buổi và thêm ít nhất một hoạt động.");
        }
    };

    // New handler for cancel button to reset states and close modal
    const handleCancel = () => {
        setTimeOfDay("");
        setActivities([]);
        setCurrentActivity("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-out animate-in fade-in">
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-10">
                <h2 className="text-2xl font-extrabold mb-6 text-purple-700 tracking-tight">Thêm Hoạt động</h2>

                <div className="mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">Ngày:</label>
                    <input
                        type="date"
                        value={formatDateKey(selectedDate)}
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed transition-shadow duration-200 hover:shadow-md"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">Chọn buổi:</label>
                    <div className="flex gap-3">
                        {["Sáng", "Chiều", "Tối"].map((time) => (
                            <button
                                key={time}
                                onClick={() => setTimeOfDay(time)}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${timeOfDay === time
                                        ? "bg-purple-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-purple-200"
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-800 font-semibold mb-2">Thêm hoạt động:</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={currentActivity}
                            onChange={(e) => setCurrentActivity(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddActivity();
                                }
                            }}
                            placeholder="Nhập tên hoạt động"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-md"
                        />
                        <button
                            onClick={handleAddActivity}
                            className="py-3 px-6 bg-green-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:bg-green-600 hover:shadow-lg"
                        >
                            Thêm
                        </button>
                    </div>
                </div>

                {activities.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-gray-800 font-semibold mb-2">Danh sách hoạt động:</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            {activities.map((activity, index) => (
                                <li
                                    key={index}
                                    className="text-gray-700 flex justify-between items-center transition-all duration-200 animate-in slide-in-from-left-5"
                                >
                                    <span>{activity.name} ({activity.timeOfDay})</span>
                                    <button
                                        onClick={() => handleDeleteActivity(index)}
                                        className="text-red-500 hover:text-red-600 font-medium transition-all duration-200 hover:scale-110"
                                    >
                                        Xóa
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCancel} // Use the new handleCancel function
                        className="py-3 px-6 bg-gray-300 text-gray-800 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:bg-gray-400 hover:shadow-lg"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="py-3 px-6 bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:bg-purple-700 hover:shadow-lg"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

ActivityModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedDate: PropTypes.instanceOf(Date).isRequired,
    onSave: PropTypes.func.isRequired,
};

const WeeklyPlanner = ({ patientId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date("2025-07-31"));
    const [sessions, setSessions] = useState(hardcodedSessions);
    const [activities, setActivities] = useState([]);
    const [taskStatus, setTaskStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customActivities, setCustomActivities] = useState({}); // Store custom activities

    // Generate two-week dates
    const twoWeekDates = useMemo(() => {
        const dates = [];
        const today = new Date("2025-07-31");
        for (let i = -7; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, []);

    // Create a standardized activity object
    const createActivityObject = (activity, time, sessionId) => {
        let title = "Activity";
        let description = "No description available";

        if (activity.foodActivity) {
            title = `Meal: ${activity.foodActivity.name}`;
            description = activity.foodActivity.description;
        } else if (activity.physicalActivity) {
            title = `Physical Activity: ${activity.physicalActivity.name}`;
            description = activity.physicalActivity.description;
        } else if (activity.therapeuticActivity) {
            title = `Therapy: ${activity.therapeuticActivity.name}`;
            description = activity.therapeuticActivity.description;
        }

        const timeString =
            time.getUTCHours().toString().padStart(2, "0") +
            ":" +
            time.getUTCMinutes().toString().padStart(2, "0");

        return {
            id: activity.id,
            title,
            description,
            time: timeString,
            status: activity.status,
            periodName: activity.PeriodName || getPeriodForTime(timeString),
        };
    };

    // Fetch and group activities by period
    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(true);
                const dateKey = formatDateKey(selectedDate);
                const sessionForDate = sessions.find(
                    (session) => formatDateKey(new Date(session.startDate)) === dateKey
                );

                let activitiesForDate = [];
                if (sessionForDate) {
                    const sessionActivities = [
                        ...(hardcodedActivities[sessionForDate.id] || []),
                        ...(customActivities[sessionForDate.id] || []),
                    ];
                    activitiesForDate = sessionActivities.map((activity) =>
                        createActivityObject(activity, new Date(activity.timeRange), sessionForDate.id)
                    );
                }

                const groupedActivities = [
                    {
                        PeriodId: "per-001",
                        PeriodName: "Sáng",
                        Actions: activitiesForDate.filter((act) => act.periodName === "Sáng"),
                    },
                    {
                        PeriodId: "per-002",
                        PeriodName: "Chiều",
                        Actions: activitiesForDate.filter((act) => act.periodName === "Chiều"),
                    },
                    {
                        PeriodId: "per-003",
                        PeriodName: "Tối",
                        Actions: activitiesForDate.filter((act) => act.periodName === "Tối"),
                    },
                ].filter((period) => period.Actions.length > 0);

                setActivities(groupedActivities);

                const initialTaskStatus = {};
                activitiesForDate.forEach((activity) => {
                    initialTaskStatus[activity.id] = activity.status === "Completed";
                });
                setTaskStatus(initialTaskStatus);
            } catch (error) {
                console.error("Error processing activities:", error);
                toast.error("Có lỗi xảy ra khi tải dữ liệu activities. Vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        };

        if (sessions.length > 0) {
            loadActivities();
        }
    }, [selectedDate, sessions, customActivities]);

    // Toggle task status
    const toggleTaskStatus = useCallback((taskId) => {
        setTaskStatus((prev) => {
            const currentStatus = prev[taskId] || false;
            const newStatus = !currentStatus;
            try {
                toast.success(`Cập nhật trạng thái thành ${newStatus ? "Hoàn thành" : "Chờ"}!`);
                return { ...prev, [taskId]: newStatus };
            } catch (error) {
                console.error("Error updating status:", error);
                toast.error("Lỗi khi cập nhật trạng thái. Vui lòng thử lại!");
                return prev;
            }
        });
    }, []);

    // Calculate progress
    const progress = useMemo(() => {
        if (!activities.length) return 0;
        let totalTasks = 0;
        let completedTasks = 0;
        activities.forEach((period) => {
            period.Actions.forEach((action) => {
                totalTasks++;
                if (taskStatus[action.id]) completedTasks++;
            });
        });
        return Math.round((completedTasks / totalTasks) * 100) || 0;
    }, [activities, taskStatus]);

    // Handle saving new activities from modal
    const handleSaveActivity = (date, timeOfDay, newActivities) => {
        const dateKey = formatDateKey(date);
        const sessionForDate = sessions.find(
            (session) => formatDateKey(new Date(session.startDate)) === dateKey
        );

        if (!sessionForDate) {
            const newSessionId = `session${sessions.length + 1}`;
            setSessions([...sessions, { id: newSessionId, startDate: date.toISOString() }]);
            const newActivityData = newActivities.map((activity, index) => ({
                id: `act${Date.now() + index}`,
                timeRange: `${dateKey}T${timeOfDay === "Sáng" ? "08:00:00" : timeOfDay === "Chiều" ? "14:00:00" : "20:00:00"}Z`,
                duration: "30 minutes",
                status: "Pending",
                PeriodName: timeOfDay,
                therapeuticActivity: {
                    name: activity.name,
                    description: `Custom therapeutic activity`,
                    intensityLevel: "Low",
                    impactLevel: "Low",
                },
            }));
            setCustomActivities((prev) => ({
                ...prev,
                [newSessionId]: newActivityData,
            }));
        } else {
            const newActivityData = newActivities.map((activity, index) => ({
                id: `act${Date.now() + index}`,
                timeRange: `${dateKey}T${timeOfDay === "Sáng" ? "08:00:00" : timeOfDay === "Chiều" ? "14:00:00" : "20:00:00"}Z`,
                duration: "30 minutes",
                status: "Pending",
                PeriodName: timeOfDay,
                therapeuticActivity: {
                    name: activity.name,
                    description: `Custom therapeutic activity`,
                    intensityLevel: "Low",
                    impactLevel: "Low",
                },
            }));
            setCustomActivities((prev) => ({
                ...prev,
                [sessionForDate.id]: [...(prev[sessionForDate.id] || []), ...newActivityData],
            }));
        }
    };

    return (
        <div className="max-w-full bg-white h-screen overflow-y-auto py-6 px-3 rounded-2xl">
            {/* Date Navigation */}
            <div className="mb-4">
                <h2 className="text-xl font-serif mb-4">Lịch hoạt động</h2>
                <div className="overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                        {twoWeekDates.map((date) => (
                            <DateButton
                                key={formatDateKey(date)}
                                date={date}
                                isSelected={formatDateKey(date) === formatDateKey(selectedDate)}
                                isToday={isToday(date)}
                                onClick={setSelectedDate}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Current Date Display and Add Button */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold">
                            {formatDayName(selectedDate)}, {selectedDate.getDate()} {getMonthName(selectedDate)}
                        </h3>
                        {isToday(selectedDate) && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Hôm nay
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50"
                            onClick={() => setSelectedDate(new Date("2025-07-31"))}
                        >
                            Hôm nay
                        </button>
                        <button
                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Thêm
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Tiến độ hôm nay</h3>
                    <span className="text-sm text-gray-500">
                        {Object.values(taskStatus).filter((status) => status).length}/
                        {Object.keys(taskStatus).length} hoạt động
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-500">Không có hoạt động nào được lên lịch cho ngày này</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200" />
                        {activities.map((period) => (
                            <div key={period.PeriodId} className="mb-8 relative">
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-8 h-8 bg-${getColorForPeriod(
                                            period.PeriodName
                                        )}-400 rounded-full flex items-center justify-center z-10`}
                                    >
                                        {period.PeriodName === "Sáng" && <FaSun className="text-white text-lg" />}
                                        {period.PeriodName === "Chiều" && (
                                            <IoPartlySunnySharp className="text-white text-lg" />
                                        )}
                                        {period.PeriodName === "Tối" && <FaCloudMoon className="text-white text-lg" />}
                                    </div>
                                    <h3 className="ml-4 text-lg font-semibold">{period.PeriodName}</h3>
                                </div>
                                <div className="ml-12 space-y-4">
                                    {period.Actions.map((action) => (
                                        <TaskItem
                                            key={action.id}
                                            activityId={action.id}
                                            action={action}
                                            periodName={period.PeriodName}
                                            taskStatus={taskStatus}
                                            toggleTaskStatus={toggleTaskStatus}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Activity Modal */}
            <ActivityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                onSave={handleSaveActivity}
            />
        </div>
    );
};

WeeklyPlanner.propTypes = {
    patientId: PropTypes.string.isRequired,
};

export default WeeklyPlanner;