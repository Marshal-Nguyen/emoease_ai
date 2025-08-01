import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { FaSun } from "react-icons/fa6";
import { FaCloudMoon } from "react-icons/fa";
import { IoPartlySunnySharp } from "react-icons/io5";

// Utility functions
const formatDateKey = (date) =>
  date
    ? `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    : "";

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatDayName = (date) =>
  ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][date.getDay()];

const getMonthName = (date) =>
  [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ][date.getMonth()];

const getColorForPeriod = (periodName) =>
({ "Buổi sáng": "yellow", "Buổi chiều": "blue", "Buổi tối": "purple" }[
  periodName
] || "gray");

// Reusable Components
const DateButton = ({ date, isSelected, isToday, hasData, onClick }) => (
  <button
    // className={`flex flex-col items-center p-3 min-w-16 rounded-lg ${isSelected
    //     ? "bg-purple-600 text-white"
    //     : hasData
    //       ? "bg-purple-100 text-purple-800 border border-purple-300"
    //       : `bg-white ${isToday ? "bg-pink-100 border border-purple-500" : "border border-gray-200"}`
    //   }`}
    className={`flex flex-col items-center p-3 min-w-16 rounded-lg transition-all duration-200 ${isSelected
      ? "bg-purple-600 text-white"
      : `${isToday
        ? "bg-pink-100 border border-purple-500"
        : hasData
          ? " border border-purple-500"
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

const TaskItem = ({
  activityId,
  action,
  periodName,
  taskStatus,
  toggleTaskStatus,
}) => (
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
          onChange={() => toggleTaskStatus(activityId, action.Id)}
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
          <h4 className="font-medium">{action.ActionName}</h4>
        </div>
        <div>
          <span
            className={`px - 2 py - 1 rounded - full text - xs ${taskStatus[activityId]
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
              } `}
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
    ActionName: PropTypes.string.isRequired,
    Id: PropTypes.string.isRequired,
  }).isRequired,
  periodName: PropTypes.string.isRequired,
  taskStatus: PropTypes.object.isRequired,
  toggleTaskStatus: PropTypes.func.isRequired,
};

const WeeklyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

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

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const profileId = localStorage.getItem("profileId");
        if (!profileId) {
          throw new Error("No profile ID found in localStorage");
        }

        const response = await fetch(
          `https://mental-care-server-nodenet.onrender.com/api/treatment-routes/_?patientId=${profileId}`
        );
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch activities");
        }

        // Process API data to match the required structure
        const processedActivities = result.data.map((item) => ({
          Id: item.Id,
          DoctorId: item.DoctorId,
          PatientId: item.PatientId,
          CreatedAt: item.CreatedAt,
          Date: item.Date,
          RoadMap: [
            {
              PeriodId: "morning",
              PeriodName: "Buổi sáng",
              Actions: item.Actions.filter(
                (action) => action.TimePeriods.PeriodName === "Buổi sáng"
              ).map((action) => ({
                ActionName: action.ActionName,
                Id: action.Id,
                Status: action.Status,
              })),
            },
            {
              PeriodId: "afternoon",
              PeriodName: "Buổi chiều",
              Actions: item.Actions.filter(
                (action) => action.TimePeriods.PeriodName === "Buổi chiều"
              ).map((action) => ({
                ActionName: action.ActionName,
                Id: action.Id,
                Status: action.Status,
              })),
            },
            {
              PeriodId: "evening",
              PeriodName: "Buổi tối",
              Actions: item.Actions.filter(
                (action) => action.TimePeriods.PeriodName === "Buổi tối"
              ).map((action) => ({
                ActionName: action.ActionName,
                Id: action.Id,
                Status: action.Status,
              })),
            },
          ].filter((period) => period.Actions.length > 0),
        }));

        setActivities(processedActivities);

        // Store available dates as strings for comparison
        const dates = [...new Set(result.data.map((item) => item.Date))];
        setAvailableDates(dates);

        // Set initial selected date to today
        setSelectedDate(new Date());

        // Initialize task status
        const initialTaskStatus = processedActivities.reduce(
          (acc, activity) => {
            activity.RoadMap.forEach((period) => {
              period.Actions.forEach((action, index) => {
                acc[`${activity.Id}-${period.PeriodId}-${index}`] =
                  action.Status === "completed";
              });
            });
            return acc;
          },
          {}
        );
        setTaskStatus(initialTaskStatus);
      } catch (error) {
        console.error("Error loading activities:", error);
        toast.error("Lỗi khi tải hoạt động. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const toggleTaskStatus = useCallback(async (taskId, actionId) => {
    try {
      const currentStatus = taskStatus[taskId] || false;
      const newStatus = !currentStatus;
      const statusPayload = newStatus ? "completed" : "not_started";

      // Gọi API để cập nhật trạng thái
      const response = await fetch(
        `https://mental-care-server-nodenet.onrender.com/api/treatment-routes/actions/${actionId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: statusPayload }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Cập nhật trạng thái sau khi API thành công
      setTaskStatus((prev) => ({ ...prev, [taskId]: newStatus }));
      toast.success(`Cập nhật trạng thái thành ${newStatus ? "Hoàn thành" : "Chờ"}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Lỗi khi cập nhật trạng thái. Vui lòng thử lại!");
    }
  }, [taskStatus]); // Thêm taskStatus vào dependency array

  const progress = useMemo(() => {
    if (!activities.length) return 0;
    let totalTasks = 0;
    let completedTasks = 0;
    activities
      .filter((a) => a.Date === formatDateKey(selectedDate))
      .forEach((activity) => {
        activity.RoadMap.forEach((period) => {
          period.Actions.forEach((_, index) => {
            totalTasks++;
            if (taskStatus[`${activity.Id}-${period.PeriodId}-${index}`])
              completedTasks++;
          });
        });
      });
    return Math.round((completedTasks / totalTasks) * 100) || 0;
  }, [activities, taskStatus, selectedDate]);

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
                hasData={availableDates.includes(formatDateKey(date))}
                onClick={setSelectedDate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Current Date Display */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold">
              {formatDayName(selectedDate)}, {selectedDate.getDate()}{" "}
              {getMonthName(selectedDate)}
            </h3>
            {isToday(selectedDate) && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Hôm nay
              </span>
            )}
          </div>
          <button
            className="text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50"
            onClick={() => setSelectedDate(new Date())}
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Tiến độ hôm nay</h3>
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
        ) : activities.filter((a) => a.Date === formatDateKey(selectedDate))
          .length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">
              Không có hoạt động nào được lên lịch cho ngày này
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200" />
            {activities
              .filter((a) => a.Date === formatDateKey(selectedDate))
              .map((activity) =>
                activity.RoadMap.map((period) => (
                  <div key={period.PeriodId} className="mb-8 relative">
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-8 h-8 bg-${getColorForPeriod(
                          period.PeriodName
                        )}-400 rounded-full flex items-center justify-center z-10`}
                      >
                        {period.PeriodName === "Buổi sáng" && (
                          <FaSun className="text-white text-lg" />
                        )}
                        {period.PeriodName === "Buổi chiều" && (
                          <IoPartlySunnySharp className="text-white text-lg" />
                        )}
                        {period.PeriodName === "Buổi tối" && (
                          <FaCloudMoon className="text-white text-lg" />
                        )}
                      </div>
                      <h3 className="ml-4 text-lg font-semibold">
                        {period.PeriodName}
                      </h3>
                    </div>
                    <div className="ml-12 space-y-4">
                      {period.Actions.map((action, index) => (
                        <TaskItem
                          key={`${activity.Id}-${period.PeriodId}-${index}`}
                          activityId={`${activity.Id}-${period.PeriodId}-${index}`}
                          action={action}
                          periodName={period.PeriodName}
                          taskStatus={taskStatus}
                          toggleTaskStatus={toggleTaskStatus}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
