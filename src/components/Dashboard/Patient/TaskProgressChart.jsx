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
      case "Tuần này": {
        // Tính tuần này (Thứ 2 -> Chủ nhật)
        const currentDayOfWeek = today.getDay(); // 0=CN, 1=T2, ..., 6=T7

        startDate = new Date(today);
        if (currentDayOfWeek === 0) {
          // Nếu hôm nay là Chủ nhật, lấy Thứ 2 của tuần này (6 ngày trước)
          startDate.setDate(today.getDate() - 6);
        } else {
          // Các ngày khác, lùi về Thứ 2 đầu tuần
          startDate.setDate(today.getDate() - (currentDayOfWeek - 1));
        }
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Thêm 6 ngày = Chủ nhật
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case "2 tuần qua": {
        // 14 ngày trước đến hôm nay
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        startDate = new Date(today);
        startDate.setDate(today.getDate() - 13); // 14 ngày (bao gồm hôm nay)
        startDate.setHours(0, 0, 0, 0);
        break;
      }

      default: {
        // Fallback: 7 ngày qua
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // 7 ngày (bao gồm hôm nay)
        startDate.setHours(0, 0, 0, 0);
        break;
      }
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

  // Percentage scale labels - tạo array mới thay vì reverse array gốc
  const percentageScaleLabels = ["100%", "80%", "60%", "40%", "20%", "0"];

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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
      <div className="bg-white rounded-xl shadow-sm p-3 w-full mx-auto border border-gray-100">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-500 mx-auto"></div>
          <p className="mt-2 text-xs text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3 w-full mx-auto border border-gray-100">
        <div className="flex flex-col justify-center items-center h-32 text-center">
          <div className="text-red-500 mb-2">
            <svg
              className="w-6 h-6 mx-auto"
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
          <p className="text-red-600 font-medium text-xs mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-xs"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-md p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Tiến độ điều trị
          </h1>
          <p className="text-xs text-gray-500">Theo dõi quá trình phục hồi</p>
        </div>
        <div className="relative inline-block dropdown-container">
          <button
            className="flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 transition-colors"
            onClick={toggleDropdown}
          >
            <span className="mr-1">📅</span>
            {selectedPeriod}
            <svg
              className={`w-3 h-3 ml-2 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              {["Tuần này", "2 tuần qua"].map((period, index) => (
                <div
                  key={period}
                  className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs transition-colors ${
                    selectedPeriod === period
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700"
                  } ${index !== 1 ? "border-b border-gray-100" : ""}`}
                  onClick={() => selectPeriod(period)}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">
                      {period === "Tuần này" ? "📅" : "📊"}
                    </span>
                    {period}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {/* Percentage scale */}
        <div className="w-6 flex flex-col justify-between h-32 text-xs text-gray-500">
          {percentageScaleLabels.map((label, index) => (
            <div key={index} className="flex items-center justify-end">
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* Chart container */}
        <div className="flex-1">
          <div className="relative bg-gray-50 rounded-lg p-2 h-32">
            {/* Grid lines */}
            <div className="absolute inset-2 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="w-full border-t border-gray-200 h-0"
                ></div>
              ))}
            </div>

            {/* Chart bars */}
            <div className="relative h-full flex items-end justify-between">
              {animatedBars.length === 0 ? (
                /* No data state */
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-gray-300 mb-1">
                    <svg
                      className="w-6 h-6 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-gray-400 mb-1">
                    Chưa có dữ liệu
                  </h3>
                  <p className="text-xs text-gray-400">
                    Không có dữ liệu trong {selectedPeriod.toLowerCase()}
                  </p>
                </div>
              ) : (
                /* Data bars */
                animatedBars.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 max-w-6 group"
                  >
                    <div className="w-full h-24 bg-gray-100 rounded-md relative overflow-hidden border border-gray-200 transition-all">
                      <div
                        className={`absolute bottom-0 w-full rounded-md transition-all duration-700 ease-out ${
                          item.percentage === 100
                            ? "bg-gradient-to-t from-green-500 to-green-400"
                            : item.percentage >= 75
                            ? "bg-gradient-to-t from-blue-500 to-blue-400"
                            : item.percentage >= 50
                            ? "bg-gradient-to-t from-purple-500 to-purple-400"
                            : item.percentage >= 25
                            ? "bg-gradient-to-t from-yellow-500 to-yellow-400"
                            : item.percentage > 0
                            ? "bg-gradient-to-t from-red-500 to-red-400"
                            : ""
                        }`}
                        style={{ height: `${item.percentage}%` }}
                      >
                        {item.percentage > 0 && item.percentage > 30 && (
                          <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2">
                            <span className="inline-block bg-white/80 text-gray-700 text-xs font-semibold px-0.5 py-0.5 rounded text-center">
                              {item.percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-center">
                      <div className="text-xs font-medium text-gray-600">
                        {item.day}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(item.fullDate), "dd/MM")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tooltip */}
            {hoverInfo && animatedBars.length > 0 && (
              <div
                className="absolute bg-gray-800 text-white p-2 rounded-lg shadow-lg z-30 text-xs min-w-max"
                style={{
                  bottom: `${Math.min(
                    hoverInfo.item.percentage * 0.6 + 15,
                    80
                  )}%`,
                  left: `${
                    8 + (hoverInfo.index / (animatedBars.length - 1)) * 75
                  }%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-semibold mb-1">{hoverInfo.item.day}</div>
                <div className="text-gray-300 mb-1">
                  {format(new Date(hoverInfo.item.fullDate), "dd/MM/yyyy")}
                </div>
                <div className="text-green-300">
                  Hoàn thành: {hoverInfo.item.percentage}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics container */}
        <div className="w-36 flex flex-col justify-center space-y-2 pl-2">
          {treatmentData.metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-2 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {metric.label}
                </div>
                <div className="text-xs">
                  {index === 0 ? "✅" : index === 1 ? "📊" : "📈"}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-bold text-gray-800">
                  {metric.value}
                </div>
                {metric.subText && (
                  <div className="text-xs text-gray-500">{metric.subText}</div>
                )}
              </div>
            </div>
          ))}

          {/* Period info */}
          <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                Thời gian
              </div>
              <div className="text-xs">📅</div>
            </div>
            <div className="text-xs font-semibold text-purple-800">
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
