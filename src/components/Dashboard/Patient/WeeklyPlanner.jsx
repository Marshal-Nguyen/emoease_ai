import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const WeeklyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [loading, setLoading] = useState(false); // Loading cho việc tải dữ liệu ban đầu
  const [taskLoading, setTaskLoading] = useState({}); // Loading cho từng task
  const [sessions, setSessions] = useState([]);
  const [sessionsForDate, setSessionsForDate] = useState(null);
  const profileId = useSelector((state) => state.auth.profileId);

  // API endpoints
  const BASE_URL = "https://psychologysupport-scheduling.azurewebsites.net";
  const SCHEDULES_ENDPOINT = `${BASE_URL}/schedules`;
  const ACTIVITIES_ENDPOINT = `${BASE_URL}/schedule-activities`;

  // Format date to use as object key (YYYY-MM-DD)
  const formatDateKey = (date) => {
    if (!date) return "";
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  // Fetch sessions once when component mounts
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log("Fetching sessions data...");
        const scheduleResponse = await axios.get(
          `${SCHEDULES_ENDPOINT}?PageIndex=1&PageSize=10&SortBy=startDate&SortOrder=asc&PatientId=${profileId}`
        );
        console.log("Schedule Response:", scheduleResponse.data);

        const sessionsData =
          scheduleResponse.data.schedules.data[0]?.sessions || [];
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error(
          "Có lỗi xảy ra khi tải dữ liệu sessions. Vui lòng thử lại!"
        );
      }
    };

    fetchSessions();
  }, [profileId]);

  // Fetch activities only for the selected date
  useEffect(() => {
    const fetchActivitiesForDate = async () => {
      try {
        setLoading(true);
        const dateKey = formatDateKey(selectedDate);
        console.log(`Fetching activities for date: ${dateKey}`);

        // Find session for the selected date
        const sessionForDate = sessions.find((session) => {
          const sessionDate = new Date(session.startDate);
          return formatDateKey(sessionDate) === dateKey;
        });

        let activitiesForDate = [];

        if (sessionForDate) {
          setSessionsForDate(sessionForDate.id);
          console.log(
            `Found session ID: ${sessionForDate.id} for date: ${dateKey}`
          );
          const activityResponse = await axios.get(
            `${ACTIVITIES_ENDPOINT}/${sessionForDate.id}`
          );
          console.log(
            `Activities for session ${sessionForDate.id}:`,
            activityResponse.data
          );

          activitiesForDate = activityResponse.data.scheduleActivities.map(
            (activity) => {
              return createActivityObject(
                activity,
                new Date(activity.timeRange),
                sessionForDate.id
              );
            }
          );
        } else {
          console.log(
            `No session found for date: ${dateKey}, using default activities`
          );
        }

        setActivities(activitiesForDate);

        // Initialize task status based on activity status
        const initialTaskStatus = {};
        activitiesForDate.forEach((activity) => {
          initialTaskStatus[activity.id] = activity.status === "Completed";
        });
        setTaskStatus(initialTaskStatus);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching activities for date:", error);
        toast.error(
          "Có lỗi xảy ra khi tải dữ liệu activities. Vui lòng thử lại!"
        );
        setLoading(false);
      }
    };

    if (sessions.length > 0) {
      fetchActivitiesForDate();
    }
  }, [selectedDate, sessions]);

  // Create a standardized activity object from API data
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

    // Calculate end time based on duration
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

  // Toggle task status with API call
  const toggleTaskStatus = useCallback(
    async (taskId) => {
      console.log("SessionsForDate:", sessionsForDate);
      console.log("taskId:", taskId);
      const currentStatus = taskStatus[taskId] || false;
      const activity = activities.find((act) => act.id === taskId);
      console.log("activity:", activity);

      const newStatus = !currentStatus;
      const apiStatus = newStatus ? "Completed" : "Pending";

      // Nếu trạng thái hiện tại của activity đã khớp với hành động, chỉ cập nhật taskStatus
      if (
        (apiStatus === "Completed" && activity.status === "Completed") ||
        (apiStatus === "Pending" && activity.status !== "Completed")
      ) {
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: newStatus,
        }));
        return;
      }

      // Gửi API để cập nhật trạng thái
      setTaskLoading((prev) => ({ ...prev, [taskId]: true }));
      try {
        const response = await fetch(
          `https://psychologysupport-scheduling.azurewebsites.net/schedule-activities/${taskId}/${sessionsForDate}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: apiStatus }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update activity status");
        }

        // Cập nhật taskStatus
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: newStatus,
        }));

        // Cập nhật activities với trạng thái mới
        setActivities((prevActivities) =>
          prevActivities.map((act) =>
            act.id === taskId ? { ...act, status: apiStatus } : act
          )
        );

        // Thông báo thành công
        toast.success(
          `Đã cập nhật trạng thái thành ${
            apiStatus === "Completed" ? "Hoàn thành" : "Chờ xử lý"
          }!`
        );
      } catch (error) {
        console.error("Error updating activity status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại!");
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: currentStatus,
        }));
      } finally {
        setTaskLoading((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [taskStatus, activities, sessionsForDate]
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

  // Format day name - MODIFIED to start with Monday
  const formatDayName = (date) => {
    // Reordered array to make Monday the first day
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    // Get day index (0-6), where 0 is Monday, 6 is Sunday
    const dayIndex = (date.getDay() + 6) % 7;
    return days[dayIndex];
  };

  // Get month name
  const getMonthName = (date) => {
    const months = [
      "Jan",
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

  // Generate dates for TWO weeks (14 days) navigation - MODIFIED to start with Monday
  // Update the generateTwoWeekDates function to start from the first session date
  const generateTwoWeekDates = () => {
    // Find the earliest session date from the API
    let startDate;

    if (sessions && sessions.length > 0) {
      // Sort sessions by startDate to find the earliest one
      const sortedSessions = [...sessions].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
      });

      startDate = new Date(sortedSessions[0].startDate);
    } else {
      // If no sessions available, use the current date
      startDate = new Date();
    }

    // Generate 14 days starting from the first session date
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

  // Using the new two week dates function
  const twoWeekDates = generateTwoWeekDates();

  return (
    <div className="max-w-full bg-[#ffffff] h-screen overflow-y-auto py-6 px-3 rounded-2xl">
      {/* Date navigation */}
      <div className="mb-2">
        <h2 className="text-xl font-serif mb-4">Schedule of activities</h2>
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {twoWeekDates.map((date) => (
              <button
                key={formatDateKey(date)}
                className={`flex flex-col items-center p-3 min-w-16 rounded-lg ${
                  formatDateKey(date) === formatDateKey(selectedDate)
                    ? "bg-purple-600 text-white"
                    : "bg-white border"
                } ${
                  isToday(date) &&
                  formatDateKey(date) !== formatDateKey(selectedDate)
                    ? "border-purple-500"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedDate(date)}>
                <span className="text-xs font-medium">
                  {formatDayName(date)}
                </span>
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
            onClick={() => setSelectedDate(new Date())}>
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
                (task) =>
                  task.status === "Completed" || taskStatus[task.id] || false
              ).length
            }
            /{activities.length} activities
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: `${calculateProgress()}%` }}></div>
        </div>
      </div>
      {/* Activities list */}
      <div className="space-y-4">
        {/* <h3 className="font-serif text-lg">Activities of the day</h3> */}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">
              No activities scheduled for this day
            </p>
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
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="flex items-center px-8 py-3">
                  <div className="mr-4">
                    <label
                      className="relative text-[#FF91AF] flex items-center justify-center gap-2"
                      htmlFor={`heart-${activity.id}`}>
                      <input
                        className="peer appearance-none"
                        id={`heart-${activity.id}`}
                        name={`heart-${activity.id}`}
                        type="checkbox"
                        checked={activity.status === "Completed" || false}
                        onChange={() => toggleTaskStatus(activity.id)}
                        disabled={loading[activity.id] || false} // Disable khi đang loading
                      />
                      <span className="absolute left-0 top-1/2 h-5 w-5 -translate-x-full -translate-y-1/2 rounded-[0.25em] border-2 border-[#FF91AF] flex items-center justify-center"></span>
                      <svg
                        className="absolute left-0 top-1/2 h-5 w-5 -translate-x-full -translate-y-1/2 duration-500 ease-out [stroke-dasharray:1000] [stroke-dashoffset:1000] peer-checked:[stroke-dashoffset:0]"
                        viewBox="0 0 68 87"
                        fill="transparent"
                        height="20"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M28.048 74.752c-.74 0-3.428.03-3.674-.175-3.975-3.298-10.07-11.632-12.946-15.92C7.694 53.09 5.626 48.133 3.38 42.035 1.937 38.12 1.116 35.298.93 31.012c-.132-3.034-.706-7.866 0-10.847C2.705 12.67 8.24 7.044 15.801 7.044c1.7 0 3.087-.295 4.55.875 4.579 3.663 5.515 8.992 7.172 14.171.142.443 3.268 6.531 2.1 7.698-.362.363-1.161-10.623-1.05-12.071.26-3.37 1.654-5.522 3.15-8.398 3.226-6.205 7.617-7.873 14.52-7.873 2.861 0 5.343-.274 8.049 1.224 16.654 9.22 14.572 23.568 5.773 37.966-1.793 2.934-3.269 6.477-5.598 9.097-1.73 1.947-4.085 3.36-5.774 5.424-2.096 2.562-3.286 5.29-5.598 7.698-4.797 4.997-9.56 10.065-14.522 14.872-1.64 1.588-10.194 6.916-10.672 7.873-.609 1.217 2.76-.195 4.024-.7"
                          strokeWidth="6" /* Giảm độ dày nét để phù hợp với kích thước nhỏ */
                          pathLength="1000"
                          stroke="#FF91AF"></path>
                      </svg>
                    </label>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-500">
                          {activity.duration}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : activity.status === "Missed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
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
                    onClick={() => showTaskDetails(activity)}>
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
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedTask.title}
                </h3>
                <button
                  onClick={closeTaskDetail}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
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
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Thời gian
                </p>
                <p className="text-md font-medium text-gray-700">
                  {selectedTask.duration}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Mô tả
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Lợi ích
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {selectedTask.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Trạng thái
                </p>
                <div className="flex items-center mt-2">
                  <label
                    className="relative text-[#FF91AF] flex items-center justify-center ml-5"
                    htmlFor={`heart-detail-${selectedTask.id}`} // ID độc nhất
                  >
                    <input
                      className="peer appearance-none"
                      id={`heart-detail-${selectedTask.id}`} // ID độc nhất
                      name={`heart-detail-${selectedTask.id}`} // Name độc nhất
                      type="checkbox"
                      checked={
                        selectedTask.status === "Completed" ||
                        taskStatus[selectedTask.id] ||
                        false
                      }
                      onChange={() => toggleTaskStatus(selectedTask.id)}
                    />
                    <span className="absolute left-0 top-1/2 h-5 w-5 -translate-x-full -translate-y-1/2 rounded-[0.25em] border-2 border-[#FF91AF] flex items-center justify-center"></span>
                    <svg
                      className="absolute left-0 top-1/2 h-5 w-5 -translate-x-full -translate-y-1/2 duration-500 ease-out [stroke-dasharray:1000] [stroke-dashoffset:1000] peer-checked:[stroke-dashoffset:0]"
                      viewBox="0 0 68 87"
                      fill="transparent"
                      height="20"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M28.048 74.752c-.74 0-3.428.03-3.674-.175-3.975-3.298-10.07-11.632-12.946-15.92C7.694 53.09 5.626 48.133 3.38 42.035 1.937 38.12 1.116 35.298.93 31.012c-.132-3.034-.706-7.866 0-10.847C2.705 12.67 8.24 7.044 15.801 7.044c1.7 0 3.087-.295 4.55.875 4.579 3.663 5.515 8.992 7.172 14.171.142.443 3.268 6.531 2.1 7.698-.362.363-1.161-10.623-1.05-12.071.26-3.37 1.654-5.522 3.15-8.398 3.226-6.205 7.617-7.873 14.52-7.873 2.861 0 5.343-.274 8.049 1.224 16.654 9.22 14.572 23.568 5.773 37.966-1.793 2.934-3.269 6.477-5.598 9.097-1.73 1.947-4.085 3.36-5.774 5.424-2.096 2.562-3.286 5.29-5.598 7.698-4.797 4.997-9.56 10.065-14.522 14.872-1.64 1.588-10.194 6.916-10.672 7.873-.609 1.217 2.76-.195 4.024-.7"
                        strokeWidth="6"
                        pathLength="1000"
                        stroke="#FF91AF"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 ml-2">
                      Đánh dấu là hoàn thành
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeTaskDetail}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                Đóng
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;
