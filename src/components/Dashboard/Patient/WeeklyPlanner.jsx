import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import supabase from "../../../Supabase/supabaseClient";
import axios from "axios";

const WeeklyPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState({});
  const [bookings, setBookings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const profileId = useSelector((state) => state.auth.profileId);

  // Cấu hình bản đồ
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };

  // Format date to use as object key (YYYY-MM-DD)
  const formatDateKey = (date) => {
    if (!date) return "";
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("Fetching bookings from Supabase...");
        setLoading(true);

        if (!profileId) {
          console.log("No profileId available");
          return;
        }

        const { data, error } = await supabase
          .from("Bookings")
          .select(
            `
            Id,
            PatientId,
            DoctorId,
            Date,
            StartTime,
            EndTime,
            Status,
            Notes,
            CreatedAt
          `
          )
          .eq("PatientId", profileId)
          .order("Date", { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Bookings data fetched:", data);
        setBookings(data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Error loading bookings. Please try again!");
      } finally {
        setLoading(false);
      }
    };

    // fetchBookings();
  }, [profileId]);

  // Generate activity suggestions based on time of day and user preferences
  const generateActivitySuggestions = (timeSlot, hasBooking = false) => {
    const suggestions = [];
    const hour = parseInt(timeSlot.split(":")[0]);

    // Morning activities (6-12)
    if (hour >= 6 && hour < 12) {
      suggestions.push(
        {
          type: "physical",
          name: "Morning Stretching",
          description: "Gentle stretching to start your day fresh",
          duration: "15 minutes",
          color: "indigo",
        },
        {
          type: "nutrition",
          name: "Healthy Breakfast",
          description: "Nutritious meal to fuel your morning",
          duration: "30 minutes",
          color: "green",
        }
      );
    }

    // Afternoon activities (12-18)
    if (hour >= 12 && hour < 18) {
      suggestions.push(
        {
          type: "mindfulness",
          name: "Mindful Break",
          description: "Take a moment to practice mindfulness",
          duration: "10 minutes",
          color: "purple",
        },
        {
          type: "physical",
          name: "Walk Outside",
          description: "Fresh air and light exercise",
          duration: "20 minutes",
          color: "indigo",
        }
      );
    }

    // Evening activities (18-22)
    if (hour >= 18 && hour <= 22) {
      suggestions.push(
        {
          type: "relaxation",
          name: "Evening Relaxation",
          description: "Wind down with calming activities",
          duration: "30 minutes",
          color: "blue",
        },
        {
          type: "reflection",
          name: "Daily Reflection",
          description: "Reflect on your day and set intentions",
          duration: "15 minutes",
          color: "orange",
        }
      );
    }

    return suggestions;
  };

  // Generate two weeks of dates from current date
  const generateTwoWeekDates = useCallback(() => {
    const dates = [];
    const today = new Date();

    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, []);

  // Fetch activities for the selected date
  useEffect(() => {
    const fetchActivitiesForDate = async () => {
      try {
        setLoading(true);
        const dateKey = formatDateKey(selectedDate);
        console.log("Fetching activities for date:", dateKey);

        // Find bookings for the selected date
        const bookingsForDate = bookings.filter((booking) => {
          const bookingDate = new Date(booking.Date);
          return formatDateKey(bookingDate) === dateKey;
        });

        console.log("Bookings for date:", bookingsForDate);

        let activitiesForDate = [];

        // Generate activities based on bookings
        bookingsForDate.forEach((booking, index) => {
          // Main consultation activity
          activitiesForDate.push({
            id: `consultation-${booking.Id}`,
            time: booking.StartTime || "09:00",
            title: "Mental Health Consultation",
            duration: `${booking.StartTime || "09:00"} - ${
              booking.EndTime || "10:00"
            }`,
            color: "blue",
            description:
              booking.Notes ||
              "Scheduled consultation with your doctor. This is an important session for your mental health journey.",
            benefits: [
              "Professional mental health assessment",
              "Personalized treatment recommendations",
              "Progress tracking and monitoring",
              "Safe space to discuss concerns",
            ],
            status: booking.Status || "Pending",
            preferenceType: "consultation",
            preference: "Mental Health",
            bookingId: booking.Id,
          });

          // Additional therapeutic activities
          const baseActivities = [
            {
              id: `mindfulness-${booking.Id}-${index}`,
              time: "14:00",
              title: "Mindfulness Meditation",
              duration: "14:00 - 14:30",
              color: "green",
              description:
                "Practice mindfulness meditation to reduce stress and anxiety. Focus on breathing and present moment awareness.",
              benefits: [
                "Reduces stress and anxiety levels",
                "Improves focus and concentration",
                "Promotes emotional well-being",
                "Enhances self-awareness",
              ],
              status: "Pending",
              preferenceType: "activity",
              preference: "Meditation",
              bookingId: booking.Id,
            },
            {
              id: `exercise-${booking.Id}-${index}`,
              time: "16:00",
              title: "Light Physical Exercise",
              duration: "16:00 - 17:00",
              color: "indigo",
              description:
                "Gentle physical activities to boost mood and energy. Include walking, stretching, or light cardio exercises.",
              benefits: [
                "Releases endorphins for better mood",
                "Improves physical fitness",
                "Enhances sleep quality",
                "Boosts energy levels",
              ],
              status: "Pending",
              preferenceType: "activity",
              preference: "Exercise",
              bookingId: booking.Id,
            },
            {
              id: `journaling-${booking.Id}-${index}`,
              time: "20:00",
              title: "Reflection & Journaling",
              duration: "20:00 - 20:30",
              color: "purple",
              description:
                "End your day with reflection and journaling. Write down thoughts, feelings, and daily experiences.",
              benefits: [
                "Improves emotional processing",
                "Enhances self-reflection",
                "Tracks mental health progress",
                "Promotes better sleep",
              ],
              status: "Pending",
              preferenceType: "activity",
              preference: "Journaling",
              bookingId: booking.Id,
            },
          ];

          activitiesForDate.push(...baseActivities);
        });

        // If no bookings, create default wellness activities
        if (bookingsForDate.length === 0) {
          activitiesForDate = [
            {
              id: `default-mindfulness-${dateKey}`,
              time: "08:00",
              title: "Morning Mindfulness",
              duration: "08:00 - 08:15",
              color: "green",
              description:
                "Start your day with a brief mindfulness session to set a positive tone.",
              benefits: [
                "Sets positive intention for the day",
                "Reduces morning anxiety",
                "Improves focus throughout the day",
              ],
              status: "Pending",
              preferenceType: "activity",
              preference: "Meditation",
              bookingId: null,
            },
            {
              id: `default-exercise-${dateKey}`,
              time: "17:00",
              title: "Evening Walk",
              duration: "17:00 - 17:30",
              color: "indigo",
              description:
                "Take a relaxing evening walk to unwind and reflect on your day.",
              benefits: [
                "Promotes physical health",
                "Reduces stress",
                "Improves sleep quality",
              ],
              status: "Pending",
              preferenceType: "activity",
              preference: "Exercise",
              bookingId: null,
            },
          ];
        }

        console.log("Generated activities:", activitiesForDate);
        setActivities(activitiesForDate);

        // Initialize task status
        const initialTaskStatus = {};
        activitiesForDate.forEach((activity) => {
          initialTaskStatus[activity.id] = activity.status === "Completed";
        });
        setTaskStatus(initialTaskStatus);
      } catch (error) {
        console.error("Error generating activities for date:", error);
        toast.error("Error loading activities. Please try again!");
      } finally {
        setLoading(false);
      }
    };

    fetchActivitiesForDate();
  }, [selectedDate, bookings]);

  // Toggle task status with Supabase update
  const toggleTaskStatus = useCallback(
    async (taskId) => {
      const currentStatus = taskStatus[taskId] || false;
      const activity = activities.find((act) => act.id === taskId);
      const newStatus = !currentStatus;
      const apiStatus = newStatus ? "Completed" : "Pending";

      // Update local state immediately for better UX
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [taskId]: newStatus,
      }));

      setTaskLoading((prev) => ({ ...prev, [taskId]: true }));

      try {
        // If this is a booking-related activity, update the booking status
        if (activity && activity.bookingId) {
          const { error } = await supabase
            .from("Bookings")
            .update({
              Status: apiStatus,
              LastModified: new Date().toISOString(),
            })
            .eq("Id", activity.bookingId);

          if (error) {
            console.error("Supabase update error:", error);
            throw error;
          }

          console.log(
            `Updated booking ${activity.bookingId} status to ${apiStatus}`
          );
        }

        // Update activity status in local state
        setActivities((prevActivities) =>
          prevActivities.map((act) =>
            act.id === taskId ? { ...act, status: apiStatus } : act
          )
        );

        toast.success(
          `Status updated to ${
            apiStatus === "Completed" ? "Completed" : "Pending"
          }!`
        );
      } catch (error) {
        console.error("Error updating activity status:", error);
        toast.error("Error updating status. Please try again!");

        // Revert local state on error
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: currentStatus,
        }));
      } finally {
        setTaskLoading((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [taskStatus, activities]
  );

  // Parse ChatGPT response into structured data
  const parseSuggestions = (responseText) => {
    const suggestionsList = [];
    const lines = responseText.split("\n").filter((line) => line.trim());

    let currentSuggestion = null;
    for (const line of lines) {
      if (/^\d+\./.test(line)) {
        if (currentSuggestion) suggestionsList.push(currentSuggestion);
        currentSuggestion = {
          name: "",
          address: "",
          type: "",
          price: "",
          rating: "",
          lat: null,
          lng: null,
        };
        currentSuggestion.name = line.replace(/^\d+\.\s*/, "").trim();
      } else if (currentSuggestion) {
        if (line.includes("Location:")) {
          currentSuggestion.address = line.replace("Location:", "").trim();
        } else if (
          line.includes("Loại món ăn:") ||
          line.includes("Loại hình hoạt động:")
        ) {
          currentSuggestion.type = line
            .replace(/Loại món ăn:|Loại hình hoạt động:/, "")
            .trim();
        } else if (line.includes("Mức giá:") || line.includes("Giá dịch vụ:")) {
          currentSuggestion.price = line
            .replace(/Mức giá:|Giá dịch vụ:/, "")
            .trim();
        } else if (line.includes("Rate:")) {
          currentSuggestion.rating = line.replace("Rate:", "").trim();
        }
      }
    }
    if (currentSuggestion) suggestionsList.push(currentSuggestion);

    // Gán tọa độ giả lập (vì ChatGPT không trả về tọa độ chính xác)
    return suggestionsList.map((suggestion, index) => ({
      ...suggestion,
      lat: 10.7769 + index * 0.01, // Giả lập tọa độ gần TP.HCM
      lng: 106.7009 + index * 0.01,
    }));
  };

  // Fetch suggestions directly from frontend using only ChatGPT
  const fetchSuggestions = useCallback(async (task) => {
    setSuggestionsLoading(true);
    setSuggestions([]);

    try {
      // Bước 1: Lấy tọa độ người dùng
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Bước 2: Tạo prompt cho ChatGPT
          const prompt = `
            Người dùng hiện đang ở tọa độ (latitude: ${latitude}, longitude: ${longitude}) tại TP.HCM, Việt Nam.
            Hãy đề xuất các địa điểm phù hợp dựa trên sở thích của họ.

            ${
              task.preferenceType === "food"
                ? `- Người dùng muốn tìm món ăn: ${task.preference}. Đề xuất các quán ăn hoặc nhà hàng với thông tin sau:
                    - Tên quán
                    - Location
                    - Loại món ăn (Việt, Nhật, Ý, v.v.)
                    - Mức giá trung bình (nếu có)
                    - Rate từ khách hàng (nếu có)`
                : `- Người dùng muốn tìm địa điểm hoạt động: ${task.preference} (như bơi lội, đánh tennis,…). Đề xuất các địa điểm phù hợp với thông tin sau:
                    - Tên địa điểm
                    - Loại hình hoạt động (bể bơi, sân tennis, gym, v.v.)
                    - Location
                    - Giá dịch vụ (nếu có)
                    - Rate từ khách hàng (nếu có)`
            }

            Trả về danh sách ít nhất 5 gợi ý chất lượng, ưu tiên các địa điểm gần tọa độ của người dùng.
            Định dạng mỗi gợi ý như sau:
            1. Tên quán/địa điểm
            Location: [Location cụ thể]
            Loại món ăn/Loại hình hoạt động: [Loại]
            Mức giá/Giá dịch vụ: [Giá]
            Rate: [Rate]
          `;

          // Bước 3: Gọi ChatGPT API
          const chatGptResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 1000,
            },
            {
              headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          const parsedSuggestions = parseSuggestions(
            chatGptResponse.data.choices[0].message.content
          );
          setSuggestions(parsedSuggestions);
          setSuggestionsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Không thể lấy vị trí. Sử dụng tọa độ mặc định (TP.HCM)."
          );
          const latitude = 10.7769; // TP.HCM
          const longitude = 106.7009;

          // Tạo prompt với tọa độ mặc định
          const prompt = `
            Người dùng hiện đang ở tọa độ (latitude: ${latitude}, longitude: ${longitude}) tại TP.HCM, Việt Nam.
            Hãy đề xuất các địa điểm phù hợp dựa trên sở thích của họ.

            ${
              task.preferenceType === "food"
                ? `- Người dùng muốn tìm món ăn: ${task.preference}. Đề xuất các quán ăn hoặc nhà hàng với thông tin sau:
                    - Tên quán
                    - Location
                    - Loại món ăn (Việt, Nhật, Ý, v.v.)
                    - Mức giá trung bình (nếu có)
                    - Rate từ khách hàng (nếu có)`
                : `- Người dùng muốn tìm địa điểm hoạt động: ${task.preference} (như bơi lội, đánh tennis,…). Đề xuất các địa điểm phù hợp với thông tin sau:
                    - Tên địa điểm
                    - Loại hình hoạt động (bể bơi, sân tennis, gym, v.v.)
                    - Location
                    - Giá dịch vụ (nếu có)
                    - Rate từ khách hàng (nếu có)`
            }

            Trả về danh sách ít nhất 5 gợi ý chất lượng, ưu tiên các địa điểm gần tọa độ của người dùng.
            Định dạng mỗi gợi ý như sau:
            1. Tên quán/địa điểm
            Location: [Location cụ thể]
            Loại món ăn/Loại hình hoạt động: [Loại]
            Mức giá/Giá dịch vụ: [Giá]
            Rate: [Rate]
          `;

          // Gọi ChatGPT API với tọa độ mặc định
          axios
            .post(
              "https://api.openai.com/v1/chat/completions",
              {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1000,
              },
              {
                headers: {
                  Authorization: `Bearer ${OPENAI_API_KEY}`,
                  "Content-Type": "application/json",
                },
              }
            )
            .then((chatGptResponse) => {
              const parsedSuggestions = parseSuggestions(
                chatGptResponse.data.choices[0].message.content
              );
              setSuggestions(parsedSuggestions);
              setSuggestionsLoading(false);
            })
            .catch((err) => {
              console.error(
                "Error fetching suggestions with default location:",
                err
              );
              toast.error("Có lỗi xảy ra khi lấy gợi ý. Vui lòng thử lại!");
              setSuggestionsLoading(false);
            });
        }
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Có lỗi xảy ra khi lấy gợi ý. Vui lòng thử lại!");
      setSuggestionsLoading(false);
    }
  }, []);

  // Show task details and fetch suggestions
  const showTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
    fetchSuggestions(task);
  };

  // Close task details modal
  const closeTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
    setSuggestions([]);
  };

  // Các hàm khác giữ nguyên
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDayName = (date) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayIndex = (date.getDay() + 6) % 7;
    return days[dayIndex];
  };

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

  const calculateProgress = () => {
    if (activities.length === 0) return 0;
    const completedTasks = activities.filter(
      (task) => task.status === "Completed" || taskStatus[task.id] || false
    ).length;
    return Math.round((completedTasks / activities.length) * 100);
  };

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
                onClick={() => setSelectedDate(date)}
              >
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
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Roadmap Section - Coming Soon */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-md p-6 mb-4 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Personalized Roadmap</h3>
              <p className="text-sm text-gray-600">
                AI-powered mental health journey planning
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border border-orange-200">
              <svg
                className="w-3 h-3 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Coming Soon
            </span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                What's Coming:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                  Personalized mental health journey mapping
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                  AI-driven milestone tracking and recommendations
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                  Progress visualization and goal setting tools
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <button
            disabled
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z"
              />
            </svg>
            Get Notified When Available
          </button>
        </div>
      </div>
      {/* Activities list */}
      <div className="space-y-4">
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
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="flex items-center px-8 py-3">
                  <div className="mr-4">
                    <label
                      className="relative text-[#FF91AF] flex items-center justify-center gap-2"
                      htmlFor={`heart-${activity.id}`}
                    >
                      <input
                        className="peer appearance-none"
                        id={`heart-${activity.id}`}
                        name={`heart-${activity.id}`}
                        type="checkbox"
                        checked={activity.status === "Completed" || false}
                        onChange={() => toggleTaskStatus(activity.id)}
                        disabled={taskLoading[activity.id] || false}
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
                        ></path>
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
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                    {selectedTask.duration}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-800 pr-8">
                    {selectedTask.title}
                  </h3>
                </div>
                <button
                  onClick={closeTaskDetail}
                  className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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

            {/* Body - Scrollable Area */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-8 space-y-6">
                {/* Description Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Benefits Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Benefits
                  </h4>
                  <ul className="space-y-3">
                    {selectedTask.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 bg-green-50 rounded-lg p-4"
                      >
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <svg
                            className="w-4 h-4 text-green-600"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-700">{benefit}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Status
                  </h4>
                  <div className="bg-pink-50 rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-pink-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          Task Completion
                        </p>
                        <p className="text-sm text-gray-500">
                          Mark when you've completed this task
                        </p>
                      </div>
                    </div>

                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id={`heart-detail-${selectedTask.id}`}
                        checked={
                          selectedTask.status === "Completed" ||
                          taskStatus[selectedTask.id] ||
                          false
                        }
                        onChange={() => toggleTaskStatus(selectedTask.id)}
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Suggestions
                  </h4>

                  {suggestionsLoading ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600 font-medium">
                        Finding perfect places for you...
                      </p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-6">
                      {/* Google Maps */}
                      {/* <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
                        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                          {window.google ? (
                            <GoogleMap
                              mapContainerStyle={{
                                height: "300px",
                                width: "100%",
                              }}
                              center={{
                                lat: suggestions[0]?.lat || 10.7769,
                                lng: suggestions[0]?.lng || 106.7009,
                              }}
                              zoom={13}
                              options={{
                                styles: [
                                  {
                                    featureType: "all",
                                    elementType: "geometry.fill",
                                    stylers: [{ saturation: -100 }],
                                  },
                                ],
                                zoomControl: true,
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false,
                              }}>
                              {suggestions.map((suggestion, index) => (
                                <Marker
                                  key={index}
                                  position={{
                                    lat: suggestion.lat,
                                    lng: suggestion.lng,
                                  }}
                                  icon={
                                    window.google && {
                                      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='%239333ea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E",
                                      scaledSize: new window.google.maps.Size(
                                        32,
                                        32
                                      ),
                                      anchor: new window.google.maps.Point(
                                        16,
                                        32
                                      ),
                                    }
                                  }
                                />
                              ))}
                            </GoogleMap>
                          ) : (
                            <div className="bg-gray-100 h-[300px] w-full flex items-center justify-center">
                              <p className="text-gray-500">Loading map...</p>
                            </div>
                          )}
                        </LoadScript>
                      </div> */}

                      {/* Suggestion Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                          >
                            <div className="p-5">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full text-xs font-bold mr-2">
                                      {index + 1}
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-800">
                                      {suggestion.name}
                                    </h4>
                                  </div>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                  {suggestion.type}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center mb-3 gap-y-2">
                                <div className="flex items-center mr-4">
                                  <div className="flex text-yellow-400">
                                    <span className="text-black text-sm">
                                      ⭐
                                    </span>
                                    <span className="ml-1 text-sm font-medium text-gray-500">
                                      {suggestion.rating}
                                    </span>
                                  </div>
                                </div>
                                <div className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {suggestion.price}
                                </div>
                              </div>

                              <div className="flex items-start mb-4">
                                <svg
                                  className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {suggestion.address}
                                </p>
                              </div>

                              <div className="flex space-x-3 mt-4">
                                <button
                                  className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors duration-200"
                                  onClick={() =>
                                    window.open(
                                      `https://www.google.com/maps/dir/?api=1&destination=${suggestion.lat},${suggestion.lng}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9 20L3 12L9 4"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M3 12H21"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Direction
                                </button>
                                <button
                                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center transition-colors duration-200"
                                  onClick={() =>
                                    window.open(
                                      `https://www.google.com/search?q=${encodeURIComponent(
                                        suggestion.name
                                      )}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Website
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mx-auto mb-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium">
                        No suggestions available yet.
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Check back later or try another task.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center text-gray-500 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Last updated {new Date().toLocaleDateString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeTaskDetail}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;
