import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { format } from "date-fns";

const TaskProgressChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Tuần này");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animatedBars, setAnimatedBars] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [treatmentData, setTreatmentData] = useState({
    bars: [],
    period: { startDate: "", endDate: "" },
    totalDays: 0,
    metrics: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profileId = useSelector((state) => state.auth.profileId);
  const API_BASE = import.meta.env.VITE_API;

  // Helper function to get date range for different periods
  const getDateRange = (period) => {
    const today = new Date();
    let startDate, endDate;

    switch (period) {
      case "Tuần này":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        endDate.setDate(startOfWeek.getDate() + 6);
        startDate = startOfWeek;
        break;
      case "Tuần trước":
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      case "30 ngày qua":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { startDate, endDate } = getDateRange(selectedPeriod);

        const response = await axios.get(
          `${API_BASE}/treatment-routes/stats/completion?patientId=${profileId}&startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.data.success) {
          setError("Không thể tải dữ liệu");
          setLoading(false);
          return;
        }

        const { bars, period, totalDays } = response.data.data;

        if (!bars || bars.length === 0) {
          // Set empty data instead of error when no data found
          setTreatmentData({
            bars: [],
            period: period || { startDate: "", endDate: "" },
            totalDays: totalDays || 0,
            metrics: [
              { label: "Hoàn thành", value: 0, subText: "0% tổng số" },
              {
                label: "Tổng phiên",
                value: 0,
                subText: `trong ${totalDays || 0} ngày`,
              },
              { label: "Tiến độ TB", value: "0%", subText: "trung bình" },
            ],
          });
          setLoading(false);
          return;
        }

        // Calculate metrics
        const completedSessions = bars.filter(
          (bar) => bar.percentage === 100
        ).length;
        const totalSessions = bars.length;
        const completionRate =
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0;
        const averageProgress =
          bars.length > 0
            ? Math.round(
                bars.reduce((sum, bar) => sum + bar.percentage, 0) / bars.length
              )
            : 0;

        const metrics = [
          {
            label: "Hoàn thành",
            value: completedSessions,
            subText: `${completionRate}% tổng số`,
          },
          {
            label: "Tổng phiên",
            value: totalSessions,
            subText: `trong ${totalDays} ngày`,
          },
          {
            label: "Tiến độ TB",
            value: `${averageProgress}%`,
            subText: "trung bình",
          },
        ];

        setTreatmentData({
          bars,
          period,
          totalDays,
          metrics,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching treatment data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (profileId) {
      fetchData();
    }
  }, [profileId, selectedPeriod]);

  // Percentage scale labels
  const percentageScaleLabels = ["0", "20%", "40%", "60%", "80%", "100%"];

  // Animation effect for bars when data changes
  useEffect(() => {
    if (treatmentData.bars.length > 0) {
      // Reset bars to 0 height first
      setAnimatedBars(
        treatmentData.bars.map((bar) => ({ ...bar, percentage: 0 }))
      );

      // Use setTimeout to trigger the animation after a small delay
      const timer = setTimeout(() => {
        // Animate to actual height
        setAnimatedBars(treatmentData.bars);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [selectedPeriod, treatmentData.bars]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectPeriod = (period) => {
    setSelectedPeriod(period);
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
      <div className="bg-white rounded-2xl shadow-md p-6 w-full mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu điều trị...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 w-full mx-auto">
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800">
          Tiến độ điều trị
        </h1>
        <div className="relative inline-block">
          <button
            className="flex items-center bg-gray-100 border-none rounded-lg px-4 py-2 text-sm text-gray-800"
            onClick={toggleDropdown}
          >
            {selectedPeriod}
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
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              {["Tuần này", "Tuần trước", "30 ngày qua"].map((period) => (
                <div
                  key={period}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => selectPeriod(period)}
                >
                  {period}
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

            {/* Check if there's data to display */}
            {animatedBars.length === 0 ? (
              /* No data state */
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Không có dữ liệu điều trị trong khoảng thời gian "
                  {selectedPeriod.toLowerCase()}". Hãy thử chọn khoảng thời gian
                  khác.
                </p>
              </div>
            ) : (
              /* Bars when data exists */
              animatedBars.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center w-5 z-10"
                  onMouseEnter={() => handleMouseEnter(item, index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-full h-56 bg-gradient-to-t from-purple-50 to-purple-100 rounded-2xl relative overflow-hidden shadow-inner">
                    <div
                      className={`absolute bottom-0 w-full rounded-2xl transition-all duration-1000 ease-out ${
                        item.percentage === 100
                          ? "bg-gradient-to-t from-green-500 to-green-400"
                          : item.percentage >= 50
                          ? "bg-gradient-to-t from-purple-600 to-purple-500"
                          : "bg-gradient-to-t from-orange-500 to-orange-400"
                      }`}
                      style={{ height: `${item.percentage}%` }}
                    >
                      {item.percentage > 0 && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold">
                          {item.percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-600">
                    {item.day}
                  </div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(item.fullDate), "dd/MM")}
                  </div>
                </div>
              ))
            )}

            {/* Hover tooltip - only show when there's data */}
            {hoverInfo && animatedBars.length > 0 && (
              <div
                className="absolute bg-gray-800 text-white p-3 rounded-lg shadow-lg z-20 text-xs min-w-max"
                style={{
                  bottom: `${hoverInfo.item.percentage + 10}%`,
                  left: `${hoverInfo.index * 40}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-bold text-sm mb-1">
                  {hoverInfo.item.day}
                </div>
                <div className="text-gray-300 mb-1">
                  {hoverInfo.item.fullDate}
                </div>
                <div className="text-green-300">
                  Hoàn thành: {hoverInfo.item.percentage}%
                </div>
                <div className="text-gray-300 text-xs mt-1">
                  ID: {hoverInfo.item.sessionId.slice(0, 8)}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics container */}
        <div className="w-2/12 flex flex-col justify-center space-y-6">
          {treatmentData.metrics.map((metric, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="text-sm text-gray-500">{metric.label}</div>
              <div className="flex flex-col">
                <div className="text-2xl font-semibold text-gray-800">
                  {metric.value}
                </div>
                {metric.subText && (
                  <div className="text-xs text-gray-400 mt-1">
                    {metric.subText}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Period info */}
          <div className="border-t pt-4 mt-6">
            <div className="text-xs text-gray-500 mb-2">Khoảng thời gian</div>
            <div className="text-xs text-gray-600">
              {treatmentData.period.startDate && treatmentData.period.endDate
                ? `${format(
                    new Date(treatmentData.period.startDate),
                    "dd/MM"
                  )} - ${format(
                    new Date(treatmentData.period.endDate),
                    "dd/MM/yyyy"
                  )}`
                : selectedPeriod}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressChart;
