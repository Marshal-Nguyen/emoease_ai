import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import { FaSun, FaCloudMoon } from "react-icons/fa";
import { IoPartlySunnySharp } from "react-icons/io5";

// Utility functions
const formatDateKey = (date) => {
    if (!date) return "";
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return `${utcDate.getUTCFullYear()}-${(utcDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${utcDate
        .getUTCDate()
        .toString()
        .padStart(2, "0")}`;
};

const isToday = (date) => {
    const today = new Date();
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
    ({
        "Buổi sáng": "bg-yellow-400",
        "Buổi chiều": "bg-blue-400",
        "Buổi tối": "bg-purple-400",
    })[periodName] || "bg-gray-400";

// Reusable Components
const DateButton = ({ date, isSelected, isToday, hasData, onClick }) => (
    <button
        className={`flex flex-col items-center p-3 min-w-16 rounded-lg transition-all duration-200 ${isSelected
            ? "bg-purple-600 text-white"
            : `${isToday
                ? "bg-pink-100 border border-purple-500"
                : hasData
                    ? " border border-purple-300"
                    : "bg-white border border-gray-200"
            }`
            } hover:shadow-md`}
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
    hasData: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

const TaskItem = ({ activityId, action, taskStatus }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex items-center transition-all duration-200 hover:shadow-lg">
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

const ActivityModal = ({ isOpen, onClose, selectedDate, onSave, timePeriods, initialActivities = [], sessionId }) => {
    const [currentActivity, setCurrentActivity] = useState("");
    const [currentTimeOfDay, setCurrentTimeOfDay] = useState("");
    const [activities, setActivities] = useState(initialActivities);

    useEffect(() => {
        if (isOpen) {
            setActivities(initialActivities);
        }
    }, [isOpen, initialActivities]);

    const handleAddActivity = useCallback(() => {
        if (currentActivity.trim() && currentTimeOfDay) {
            setActivities((prev) => [...prev, { name: currentActivity, timeOfDay: currentTimeOfDay }]);
            setCurrentActivity("");
            setCurrentTimeOfDay("");
        } else {
            toast.error("Vui lòng chọn buổi và nhập tên hoạt động.");
        }
    }, [currentActivity, currentTimeOfDay]);

    const handleDeleteActivity = useCallback((index) => {
        setActivities((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleSave = useCallback(() => {
        if (activities.length > 0) {
            onSave(selectedDate, activities, sessionId);
            setActivities([]);
            setCurrentActivity("");
            setCurrentTimeOfDay("");
            onClose();
        } else {
            toast.error("Vui lòng thêm ít nhất một hoạt động.");
        }
    }, [activities, selectedDate, onSave, onClose, sessionId]);

    const handleCancel = useCallback(() => {
        setActivities(initialActivities);
        setCurrentActivity("");
        setCurrentTimeOfDay("");
        onClose();
    }, [initialActivities, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-out animate-in fade-in">
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-10">
                <h2 className="text-2xl font-extrabold mb-6 text-purple-700 tracking-tight">
                    {initialActivities.length > 0 ? "Cập nhật Hoạt động" : "Thêm Hoạt động"}
                </h2>
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
                        {timePeriods.map((period) => (
                            <button
                                key={period.Id}
                                onClick={() => setCurrentTimeOfDay(period.PeriodName)}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${currentTimeOfDay === period.PeriodName
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-gray-200 text-gray-700 hover:bg-purple-200"
                                    }`}
                            >
                                {period.PeriodName}
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
                            onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
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
                                    <span>
                                        {activity.name} ({activity.timeOfDay})
                                    </span>
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
                        onClick={handleCancel}
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
    timePeriods: PropTypes.arrayOf(
        PropTypes.shape({
            Id: PropTypes.string.isRequired,
            PeriodName: PropTypes.string.isRequired,
        })
    ).isRequired,
    initialActivities: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            timeOfDay: PropTypes.string.isRequired,
        })
    ),
    sessionId: PropTypes.string,
};

const WeeklyPlanner = ({ patientId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [activities, setActivities] = useState([]);
    const [taskStatus, setTaskStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customActivities, setCustomActivities] = useState({});
    const [timePeriods, setTimePeriods] = useState([]);

    useEffect(() => {
        const fetchTimePeriods = async () => {
            try {
                const response = await axios.get("https://mental-care-server-nodenet.onrender.com/api/time-periods/allTime");
                if (response.data.success) {
                    setTimePeriods(response.data.data);
                } else {
                    toast.error("Không thể lấy danh sách time periods.");
                }
            } catch (error) {
                toast.error("Lỗi khi lấy danh sách time periods.");
            }
        };
        fetchTimePeriods();
    }, []);

    const fetchTreatmentRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://mental-care-server-nodenet.onrender.com/api/treatment-routes/_?patientId=${patientId}`);
            if (response.data.success) {
                const fetchedSessions = response.data.data.map((route) => ({
                    id: route.Id,
                    startDate: new Date(route.Date),
                }));
                setSessions(fetchedSessions);

                const activitiesBySession = {};
                response.data.data.forEach((route) => {
                    activitiesBySession[route.Id] = route.Actions.map((action) => ({
                        id: action.Id,
                        timeRange: route.Date,
                        duration: "30 minutes",
                        status: action.Status === "completed" ? "Completed" : "Pending",
                        PeriodName: mapApiPeriodToLocal(action.TimePeriods?.PeriodName || action.PeriodName || ""),
                        therapeuticActivity: {
                            name: action.ActionName,
                            description: `Therapeutic activity: ${action.ActionName}`,
                            intensityLevel: "Low",
                            impactLevel: "Low",
                        },
                    }));
                });
                setCustomActivities((prev) => ({ ...prev, ...activitiesBySession }));
            } else {
                // toast.error("Không thể lấy danh sách lộ trình điều trị.");
            }
        } catch (error) {
            // toast.error("Lỗi khi lấy dữ liệu lộ trình điều trị.");
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchTreatmentRoutes();
    }, [fetchTreatmentRoutes]);

    const mapApiPeriodToLocal = useCallback((apiPeriodName) => {
        if (!apiPeriodName) return "Buổi sáng";
        const periodMap = {
            "buổi sáng": "Buổi sáng",
            "buổi chiều": "Buổi chiều",
            "buổi tối": "Buổi tối",
            morning: "Buổi sáng",
            afternoon: "Buổi chiều",
            evening: "Buổi tối",
        };
        return periodMap[apiPeriodName.toLowerCase()] || apiPeriodName;
    }, []);

    const twoWeekDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = -7; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, []);

    const createActivityObject = useCallback(
        (activity, time) => ({
            id: activity.id,
            title: activity.therapeuticActivity ? `Therapy: ${activity.therapeuticActivity.name}` : "Activity",
            description: activity.therapeuticActivity?.description || "No description available",
            time:
                time.getUTCHours().toString().padStart(2, "0") +
                ":" +
                time.getUTCMinutes().toString().padStart(2, "0"),
            status: activity.status,
            periodName: activity.PeriodName,
        }),
        []
    );

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
                    activitiesForDate = (customActivities[sessionForDate.id] || []).map((activity) =>
                        createActivityObject(activity, new Date(activity.timeRange), sessionForDate.id)
                    );
                }

                const groupedActivities = [
                    { PeriodId: "per-001", PeriodName: "Buổi sáng", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi sáng") },
                    { PeriodId: "per-002", PeriodName: "Buổi chiều", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi chiều") },
                    { PeriodId: "per-003", PeriodName: "Buổi tối", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi tối") },
                ];

                setActivities(groupedActivities);

                const initialTaskStatus = {};
                activitiesForDate.forEach((activity) => {
                    initialTaskStatus[activity.id] = activity.status === "Completed";
                });
                setTaskStatus(initialTaskStatus);
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu activities.");
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, [selectedDate, sessions, customActivities, createActivityObject]);

    const toggleTaskStatus = useCallback((taskId) => {
        setTaskStatus((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    }, []);

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

    const hasDataForSelectedDate = useMemo(
        () =>
            sessions.some((session) => formatDateKey(new Date(session.startDate)) === formatDateKey(selectedDate)),
        [sessions, selectedDate]
    );

    const modalData = useMemo(() => {
        const dateKey = formatDateKey(selectedDate);
        const sessionForDate = sessions.find(
            (session) => formatDateKey(new Date(session.startDate)) === dateKey
        );
        if (sessionForDate) {
            const activities = (customActivities[sessionForDate.id] || []).map((activity) => ({
                name: activity.therapeuticActivity.name,
                timeOfDay: activity.PeriodName,
            }));
            return { initialActivities: activities, sessionId: sessionForDate.id };
        }
        return { initialActivities: [], sessionId: null };
    }, [selectedDate, sessions, customActivities]);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
        const dateKey = formatDateKey(selectedDate);
        const sessionForDate = sessions.find(
            (session) => formatDateKey(new Date(session.startDate)) === dateKey
        );
        if (sessionForDate) {
            const activitiesForDate = (customActivities[sessionForDate.id] || []).map((activity) =>
                createActivityObject(activity, new Date(activity.timeRange), sessionForDate.id)
            );
            const groupedActivities = [
                { PeriodId: "per-001", PeriodName: "Buổi sáng", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi sáng") },
                { PeriodId: "per-002", PeriodName: "Buổi chiều", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi chiều") },
                { PeriodId: "per-003", PeriodName: "Buổi tối", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi tối") },
            ];
            setActivities(groupedActivities);
        }
    }, [selectedDate, sessions, customActivities, createActivityObject]);

    const handleSaveActivity = useCallback(
        async (date, newActivities, sessionId = null) => {
            try {
                const doctorId = localStorage.getItem("profileId");
                if (!doctorId) {
                    toast.error("Không tìm thấy doctorId.");
                    return;
                }

                if (!timePeriods || timePeriods.length === 0) {
                    toast.error("Danh sách time periods chưa được tải.");
                    return;
                }

                if (!Array.isArray(newActivities) || newActivities.length === 0) {
                    toast.error("Danh sách hoạt động không hợp lệ.");
                    return;
                }

                const dateKey = formatDateKey(date);
                const dateString = `${dateKey}T00:00:00Z`;

                const payload = {
                    patientId,
                    doctorId,
                    date: dateString,
                    actions: newActivities.map((activity) => {
                        const timePeriod = timePeriods.find((period) => period.PeriodName === activity.timeOfDay);
                        if (!timePeriod) {
                            toast.error(`Không tìm thấy time period cho ${activity.timeOfDay}.`);
                            throw new Error(`Không tìm thấy time period cho ${activity.timeOfDay}`);
                        }
                        return {
                            timePeriodsId: timePeriod.Id,
                            actionName: activity.name,
                            status: "pending",
                        };
                    }),
                };

                let response;
                if (sessionId) {
                    response = await axios.put(`https://mental-care-server-nodenet.onrender.com/api/treatment-routes/${sessionId}`, payload);
                } else {
                    response = await axios.post("https://mental-care-server-nodenet.onrender.com/api/treatment-routes", payload);
                }

                if (response.status === 200 || response.status === 201) {
                    const newSessionId = response.data.data?.Id || response.data.id || response.data.sessionId;
                    if (!newSessionId) {
                        await fetchTreatmentRoutes();
                        return;
                    }

                    const newActivityData = (response.data.data?.Actions || response.data.Actions || []).map((action, index) => ({
                        id: action.Id || `temp-${Date.now()}-${index}`,
                        timeRange: dateString,
                        duration: "30 minutes",
                        status: action.Status === "completed" ? "Completed" : "Pending",
                        PeriodName: mapApiPeriodToLocal(newActivities[index]?.timeOfDay || "Unknown"),
                        therapeuticActivity: {
                            name: action.ActionName || "Unknown Activity",
                            description: `Custom therapeutic activity: ${action.ActionName || "Unknown"}`,
                            intensityLevel: "Low",
                            impactLevel: "Low",
                        },
                    }));

                    setSessions((prev) => {
                        const updatedSessions = prev.some((session) => session.id === newSessionId)
                            ? prev.map((session) =>
                                session.id === newSessionId ? { ...session, startDate: dateString } : session
                            )
                            : [...prev, { id: newSessionId, startDate: dateString }];
                        return updatedSessions;
                    });

                    setCustomActivities((prev) => ({
                        ...prev,
                        [newSessionId]: newActivityData,
                    }));

                    const activitiesForDate = newActivityData.map((activity) =>
                        createActivityObject(activity, new Date(activity.timeRange), newSessionId)
                    );
                    const groupedActivities = [
                        { PeriodId: "per-001", PeriodName: "Buổi sáng", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi sáng") },
                        { PeriodId: "per-002", PeriodName: "Buổi chiều", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi chiều") },
                        { PeriodId: "per-003", PeriodName: "Buổi tối", Actions: activitiesForDate.filter((act) => act.periodName === "Buổi tối") },
                    ];
                    setActivities(groupedActivities);

                    const initialTaskStatus = {};
                    activitiesForDate.forEach((activity) => {
                        initialTaskStatus[activity.id] = activity.status === "Completed";
                    });
                    setTaskStatus(initialTaskStatus);

                    await fetchTreatmentRoutes();
                } else {
                    toast.error("Phản hồi API không hợp lệ.");
                }
            } catch (error) {
                toast.error(`Lỗi khi ${sessionId ? "cập nhật" : "lưu"} hoạt động.`);
            }
        },
        [patientId, timePeriods, mapApiPeriodToLocal, createActivityObject, fetchTreatmentRoutes]
    );

    return (
        <div className="max-w-full bg-white h-[calc(100vh-4rem)] overflow-y-auto py-6 px-3 rounded-2xl">
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
                                hasData={sessions.some(
                                    (session) => formatDateKey(new Date(session.startDate)) === formatDateKey(date)
                                )}
                                onClick={setSelectedDate}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold">
                            {formatDayName(selectedDate)}, {selectedDate.getDate()} {getMonthName(selectedDate)}
                        </h3>
                        {isToday(selectedDate) && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Hôm nay</span>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                            onClick={() => setSelectedDate(new Date())}
                        >
                            Hôm nay
                        </button>
                        <button
                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200"
                            onClick={openModal}
                        >
                            {hasDataForSelectedDate ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Tiến độ hôm nay</h3>
                    <span className="text-sm text-gray-500">
                        {Object.values(taskStatus).filter((status) => status).length}/{Object.keys(taskStatus).length} hoạt động
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : activities.every((period) => period.Actions.length === 0) ? (
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
                                        className={`w-8 h-8 ${getColorForPeriod(
                                            period.PeriodName
                                        )} rounded-full flex items-center justify-center z-10`}
                                    >
                                        {period.PeriodName === "Buổi sáng" && <FaSun className="text-white text-lg" />}
                                        {period.PeriodName === "Buổi chiều" && (
                                            <IoPartlySunnySharp className="text-white text-lg" />
                                        )}
                                        {period.PeriodName === "Buổi tối" && <FaCloudMoon className="text-white text-lg" />}
                                    </div>
                                    <h3 className="ml-4 text-lg font-semibold">{period.PeriodName}</h3>
                                </div>
                                <div className="ml-12 space-y-4">
                                    {period.Actions.length > 0 ? (
                                        period.Actions.map((action) => (
                                            <TaskItem
                                                key={action.id}
                                                activityId={action.id}
                                                action={action}
                                                periodName={period.PeriodName}
                                                taskStatus={taskStatus}
                                                toggleTaskStatus={toggleTaskStatus}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-500">
                                            Không có hoạt động nào trong buổi {period.PeriodName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ActivityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                onSave={handleSaveActivity}
                timePeriods={timePeriods}
                initialActivities={modalData.initialActivities}
                sessionId={modalData.sessionId}
            />
        </div>
    );
};

WeeklyPlanner.propTypes = {
    patientId: PropTypes.string.isRequired,
};

export default WeeklyPlanner;
