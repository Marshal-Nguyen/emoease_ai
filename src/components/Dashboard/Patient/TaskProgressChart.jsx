import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

const TaskProgressChart = () => {
  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animatedBars, setAnimatedBars] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [weeksData, setWeeksData] = useState({
    "Week 1": { bars: [], metrics: [] },
    "Week 2": { bars: [], metrics: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profileId = useSelector((state) => state.auth.profileId);
  // const API_SCHEDULING = import.meta.env.VITE_API_SCHEDULE_URL;
  const API_SCHEDULING = import.meta.env.VITE_API;
  // Fetch data from API

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_SCHEDULING}/bookings?PageIndex=1&PageSize=10&SortOrder=asc&PatientId=${profileId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const bookings = response.data.data;

        if (!bookings || bookings.length === 0) {
          setError("No bookings found");
          setLoading(false);
          return;
        }

        const sessions = bookings.map((booking, index) => ({
          sessionId: booking.Id,
          order: booking.Date,
          percentage: Math.floor(Math.random() * 101),
        }));

        const week1Sessions = sessions.slice(0, 7);
        const week2Sessions = sessions.slice(7, 14);

        const processedData = {
          "Week 1": {
            bars: week1Sessions.map((session) => {
              const date = parseISO(session.order);
              return {
                day: format(date, "EEE"),
                fullDate: format(date, "yyyy-MM-dd"),
                percentage: session.percentage || 0,
                sessionId: session.sessionId,
              };
            }),
            metrics: [
              {
                label: "Completed",
                value: getCompletionCount(week1Sessions),
                percentage: getCompletionPercentage(week1Sessions),
              },
              { label: "Total Sessions", value: week1Sessions.length },
              {
                label: "Average Progress",
                value: `${getAveragePercentage(week1Sessions)}%`,
              },
            ],
          },
          "Week 2": {
            bars: week2Sessions.map((session) => {
              const date = parseISO(session.order);
              return {
                day: format(date, "EEE"),
                fullDate: format(date, "yyyy-MM-dd"),
                percentage: session.percentage || 0,
                sessionId: session.sessionId,
              };
            }),
            metrics: [
              {
                label: "Completed",
                value: getCompletionCount(week2Sessions),
                percentage: getCompletionPercentage(week2Sessions),
              },
              { label: "Total Sessions", value: week2Sessions.length },
              {
                label: "Average Progress",
                value: `${getAveragePercentage(week2Sessions)}%`,
              },
            ],
          },
        };

        setWeeksData(processedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (profileId) {
      fetchData();
    }
  }, [profileId]);

  // Helper functions for metrics calculations
  function getCompletionCount(sessions) {
    return sessions.filter((session) => session.percentage === 100).length;
  }

  function getCompletionPercentage(sessions) {
    const completedCount = getCompletionCount(sessions);
    return sessions.length > 0
      ? Math.round((completedCount / sessions.length) * 100)
      : 0;
  }

  function getAveragePercentage(sessions) {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce(
      (acc, session) => acc + (session.percentage || 0),
      0
    );
    return Math.round(sum / sessions.length);
  }

  // Get current data based on selected week
  const currentData = weeksData[selectedWeek];

  // Percentage scale labels
  const percentageScaleLabels = ["0", "20%", "40%", "60%", "80%", "100%"];

  // Animation effect for bars when data changes
  useEffect(() => {
    if (currentData.bars.length > 0) {
      // Reset bars to 0 height first
      setAnimatedBars(
        currentData.bars.map((bar) => ({ ...bar, percentage: 0 }))
      );

      // Use setTimeout to trigger the animation after a small delay
      const timer = setTimeout(() => {
        // Animate to actual height
        setAnimatedBars(currentData.bars);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [selectedWeek, currentData.bars]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectWeek = (week) => {
    setSelectedWeek(week);
    setIsDropdownOpen(false);
  };

  const handleMouseEnter = (item, index) => {
    setHoverInfo({
      item,
      index,
      x: index * 40 + 20, // Approximate position
    });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-md p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800">
          Roadmap Tracking
        </h1>
        <div className="relative inline-block">
          <button
            className="flex items-center bg-gray-100 border-none rounded-lg px-4 py-2 text-sm text-gray-800"
            onClick={toggleDropdown}
          >
            {selectedWeek}
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
              {Object.keys(weeksData).map((week) => (
                <div
                  key={week}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => selectWeek(week)}
                >
                  {week}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Percentage scale */}
        <div className="w-10 mr-2 flex flex-col justify-between h-56 text-xs text-gray-500">
          {percentageScaleLabels.reverse().map((label, index) => (
            <div key={index} className="flex items-center">
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Chart container */}
        <div className="w-9/12 pr-6">
          <div className="flex h-64 items-end justify-between relative">
            {/* Horizontal guide lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {percentageScaleLabels.map((_, index) => (
                <div
                  key={index}
                  className="w-full border-t border-gray-200 h-0"
                ></div>
              ))}
            </div>

            {/* Bars */}
            {animatedBars.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-5 z-10"
                onMouseEnter={() => handleMouseEnter(item, index)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-full h-56 bg-purple-100 rounded-2xl relative overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-purple-700 rounded-2xl transition-all duration-1000 ease-out"
                    style={{ height: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">{item.day}</div>
                <div className="text-xs text-gray-400">{item.fullDate}</div>
              </div>
            ))}

            {/* Hover tooltip */}
            {hoverInfo && (
              <div
                className="absolute bg-gray-800 text-white p-2 rounded shadow-lg z-20 text-xs"
                style={{
                  bottom: `${hoverInfo.item.percentage + 5}%`,
                  left: `${hoverInfo.index * 40}px`,
                }}
              >
                <div className="font-bold">{hoverInfo.item.day}</div>
                <div>{hoverInfo.item.fullDate}</div>
                <div>Hoàn thành: {hoverInfo.item.percentage}%</div>
                <div>Session ID: {hoverInfo.item.sessionId.slice(0, 8)}...</div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics container */}
        <div className="w-2/12 flex flex-col justify-center space-y-6">
          {currentData.metrics.map((metric, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="text-sm text-gray-500">{metric.label}</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold text-gray-800">
                  {metric.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskProgressChart;
