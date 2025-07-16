import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const CreateWeeklyPlanner = ({ profileId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsForDate, setSessionsForDate] = useState(null);

  // Hardcoded sessions data
  const hardcodedSessions = [
    {
      id: "session1",
      startDate: "2025-07-14T00:00:00Z",
    },
    {
      id: "session2",
      startDate: "2025-07-15T00:00:00Z",
    },
    {
      id: "session3",
      startDate: "2025-07-16T00:00:00Z",
    },
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
  };

  // Format date to use as object key (YYYY-MM-DD)
  const formatDateKey = (date) => {
    if (!date) return "";
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  // Set sessions on component mount
  useEffect(() => {
    setSessions(hardcodedSessions);
  }, []);

  // Fetch activities for selected date
  useEffect(() => {
    const fetchActivitiesForDate = () => {
      try {
        const dateKey = formatDateKey(selectedDate);
        const sessionForDate = sessions.find((session) => {
          const sessionDate = new Date(session.startDate);
          return formatDateKey(sessionDate) === dateKey;
        });

        let activitiesForDate = [];

        if (sessionForDate) {
          setSessionsForDate(sessionForDate.id);
          const sessionActivities = hardcodedActivities[sessionForDate.id] || [];
          activitiesForDate = sessionActivities.map((activity) =>
            createActivityObject(
              activity,
              new Date(activity.timeRange),
              sessionForDate.id
            )
          );
        }

        setActivities(activitiesForDate);

        const initialTaskStatus = {};
        activitiesForDate.forEach((activity) => {
          initialTaskStatus[activity.id] = activity.status === "Completed";
        });
        setTaskStatus(initialTaskStatus);
      } catch (error) {
        console.error("Error processing activities:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu activities. Vui lòng thử lại!");
      }
    };

    if (sessions.length > 0) {
      fetchActivitiesForDate();
    }
  }, [selectedDate, sessions]);

  // Create a standardized activity object
  const createActivityObject = (activity, time, sessionId) => {
    let title = "Activity";
    let description = "No description available";
    let color = "blue";
    let benefits = [];

    if (activity.foodActivity) {
      title = `Meal: ${activity.foodActivity.name}`;
      description = activity.foodActivity.description;
      color = "green";
      benefits = [
        `Time: ${activity.foodActivity.mealTime}`,
        `Nutrition: ${activity.foodActivity.foodNutrients.join(", ")}`,
        `Intensity: ${activity.foodActivity.intensityLevel}`,
      ];
    } else if (activity.physicalActivity) {
      title = `Physical Activity: ${activity.physicalActivity.name}`;
      description = activity.physicalActivity.description;
      color = "indigo";
      benefits = [
        `Intensity: ${activity.physicalActivity.intensityLevel}`,
        `Impact Level: ${activity.physicalActivity.impactLevel}`,
      ];
    } else if (activity.entertainmentActivity) {
      title = `Entertainment: ${activity.entertainmentActivity.name}`;
      description = activity.entertainmentActivity.description;
      color = "purple";
      benefits = [
        `Intensity: ${activity.entertainmentActivity.intensityLevel}`,
        `Impact Level: ${activity.entertainmentActivity.impactLevel}`,
      ];
    } else if (activity.therapeuticActivity) {
      title = `Therapy: ${activity.therapeuticActivity.name}`;
      description = activity.therapeuticActivity.description;
      color = "orange";
      benefits = [
        `Intensity: ${activity.therapeuticActivity.intensityLevel}`,
        `Impact Level: ${activity.therapeuticActivity.impactLevel}`,
        `Instructions: ${activity.therapeuticActivity.instructions}`,
      ];
    }

    const timeString =
      time.getUTCHours().toString().padStart(2, "0") +
      ":" +
      time.getUTCMinutes().toString().padStart(2, "0");

    const endTime = new Date(time);
    const durationMinutes = parseInt(activity.duration?.split(" ")[0] || "30");
    endTime.setMinutes(endTime.getUTCMinutes() + durationMinutes);

    const endTimeString =
      endTime.getUTCHours().toString().padStart(2, "0") +
      ":" +
      endTime.getUTCMinutes().toString().padStart(2, "0");

    return {
      id: activity.id,
      time: timeString,
      title: title,
      duration: `${timeString} - ${endTimeString}`,
      color: color,
      description: description,
      benefits: benefits,
      status: activity.status,
    };
  };

  // Toggle task status
  const toggleTaskStatus = useCallback(
    (taskId) => {
      const currentStatus = taskStatus[taskId] || false;
      const newStatus = !currentStatus;
      const apiStatus = newStatus ? "Completed" : "Pending";

      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [taskId]: newStatus,
      }));

      setActivities((prevActivities) =>
        prevActivities.map((act) =>
          act.id === taskId ? { ...act, status: apiStatus } : act
        )
      );

      toast.success(
        `Đã cập nhật trạng thái thành ${apiStatus === "Completed" ? "Hoàn thành" : "Chờ xử lý"
        }!`
      );
    },
    [taskStatus]
  );

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format day name - starts with Monday
  const formatDayName = (date) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayIndex = (date.getDay() + 6) % 7;
    return days[dayIndex];
  };

  // Get month name
  const getMonthName = (date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[date.getMonth()];
  };

  // Generate dates for two weeks
  const generateTwoWeekDates = () => {
    let startDate =
      sessions.length > 0
        ? new Date(
          [...sessions].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0].startDate
        )
        : new Date();

    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  };

  // Show task details
  const showTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  // Close task details modal
  const closeTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (activities.length === 0) return 0;
    const completedTasks = activities.filter(
      (task) => task.status === "Completed" || taskStatus[task.id] || false
    ).length;
    return Math.round((completedTasks / activities.length) * 100);
  };

  const twoWeekDates = generateTwoWeekDates();

  return (
    <div className="max-w-full bg-[#ffffff] overflow-y-auto pb-30 px-3 rounded-2xl">
      {/* Date navigation */}
      <div className="mb-2">
        <h2 className="text-xl font-serif mb-4">Schedule of activities</h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {twoWeekDates.map((date) => (
              <button
                key={formatDateKey(date)}
                className={`flex flex-col items-center p-3 min-w-16 rounded-lg ${formatDateKey(date) === formatDateKey(selectedDate)
                    ? "bg-purple-600 text-white"
                    : "bg-white border"
                  } ${isToday(date) &&
                    formatDateKey(date) !== formatDateKey(selectedDate)
                    ? "border-purple-500"
                    : "border-gray-200"
                  }`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-xs font-medium">{formatDayName(date)}</span>
                <span className="text-lg font-bold">{date.getDate()}</span>
                <span className="text-xs">{getMonthName(date)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Current date display */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">
              {formatDayName(selectedDate)}, {selectedDate.getDate()}{" "}
              {getMonthName(selectedDate)}
            </h3>
            {isToday(selectedDate) && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Today
              </span>
            )}
          </div>
          <button
            className="text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>
      {/* Progress indicator */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Today's progress</h3>
          <span className="text-sm text-gray-500">
            {
              activities.filter(
                (task) => task.status === "Completed" || taskStatus[task.id] || false
              ).length
            }
            /{activities.length} activities
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>
      {/* Activities list */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No activities scheduled for this day</p>
          </div>
        ) : (
          activities
            .sort((a, b) => {
              const timeA = a.time.split(":").map(Number);
              const timeB = b.time.split(":").map(Number);
              return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
            })
            .map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="flex items-center px-8 py-3">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-500">{activity.duration}</p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${activity.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : activity.status === "Missed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {activity.status === "Completed"
                            ? "Completed"
                            : activity.status === "Missed"
                              ? "Missed"
                              : "Waiting"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <button
                    className="text-purple-600 text-sm font-medium"
                    onClick={() => showTaskDetails(activity)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-[#00000049] bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100 hover:scale-[1.02]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">{selectedTask.title}</h3>
                <button
                  onClick={closeTaskDetail}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Thời gian</p>
                <p className="text-md font-medium text-gray-700">{selectedTask.duration}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Mô tả</p>
                <p className="text-gray-600 leading-relaxed">{selectedTask.description}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Lợi ích</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {selectedTask.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm">{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeTaskDetail}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Đóng
              </button>
              <button
                onClick={() => toggleTaskStatus(selectedTask.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
              >
                {taskStatus[selectedTask.id] ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWeeklyPlanner;