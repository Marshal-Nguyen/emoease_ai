import { useState, useEffect } from "react";
import axios from "axios";
import {
  CalendarIcon,
  Clock,
  ArrowLeft,
  Users,
  XCircle,
  CheckCircle,
  BusIcon,
} from "lucide-react";

export default function DoctorScheduleViewer({ doctorId }) {
  console.log("thang bac si", doctorId);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    today.toLocaleString("en-US", { month: "long", year: "numeric" })
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduledSlots, setScheduledSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  const [isBusyLoading, setIsBusyLoading] = useState(false);
  const [busyMessage, setBusyMessage] = useState({ type: "", text: "" });
  const VITE_API_SCHEDULE_URL = "http://localhost:3000/api";
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Kiểm tra xem ngày đã chọn có sau ngày hiện tại 7 ngày không
  const isDateEligibleForUpdate = (date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const eligibleDate = new Date(currentDate);
    eligibleDate.setDate(currentDate.getDate() + 7);

    return date >= eligibleDate;
  };

  // Hàm lấy số ngày trong tháng
  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);

  // Xử lý khi chọn ngày
  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonthIndex, day);
    setSelectedDate(newDate);
    setSelectedSlots([]);
    setUpdateMessage({ type: "", text: "" });
  };

  // Xử lý khi thay đổi tháng
  const changeMonth = (step) => {
    let newMonth = currentMonthIndex + step;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setCurrentMonthIndex(newMonth);
    setCurrentYear(newYear);
    setCurrentMonth(
      new Date(newYear, newMonth, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    );
    setSelectedSlots([]);
    setUpdateMessage({ type: "", text: "" });
  };

  // Lấy lịch đã đặt khi thay đổi ngày
  const fetchSchedule = async (date) => {
    setIsLoading(true);
    try {
      const formattedDate = date.toLocaleDateString("en-CA").split("T")[0]; // Format: YYYY-MM-DD
      const response = await axios.get(
        `${VITE_API_SCHEDULE_URL}/doctors/${doctorId}/${formattedDate}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const { slots, message } = response.data;
      // Chuyển đổi dữ liệu từ API về định dạng frontend
      const formattedSlots = slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.isAvailable ? (slot.isBooked ? "Booked" : "Available") : "Unavailable",
      }));
      setScheduledSlots(formattedSlots || []);
      setUpdateMessage({ type: "", text: message });
    } catch (error) {
      console.error("Lỗi khi lấy lịch trình:", error);
      setScheduledSlots([]);
      setUpdateMessage({ type: "error", text: "Failed to fetch schedule." });
    } finally {
      setIsLoading(false);
    }
  };

  // Đặt ngày bận
  const markDoctorBusy = async () => {
    if (!selectedDate) {
      setBusyMessage({
        type: "warning",
        text: "Please select a date to mark as busy.",
      });
      return;
    }

    if (!isDateEligibleForUpdate(selectedDate)) {
      setBusyMessage({
        type: "error",
        text: "Only dates at least 7 days in the future can be marked as busy.",
      });
      return;
    }

    setIsBusyLoading(true);
    setBusyMessage({ type: "", text: "" });

    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA").split("T")[0]; // Format: YYYY-MM-DD
      const response = await axios.put(
        `${VITE_API_SCHEDULE_URL}/doctors/${doctorId}/${formattedDate}`,
        {
          isAvailable: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setBusyMessage({
          type: "success",
          text: `Successfully marked ${selectedDate.toLocaleDateString()} as a busy day.`,
        });
        fetchSchedule(selectedDate); // Cập nhật lại lịch sau khi đặt bận
      } else {
        setBusyMessage({
          type: "error",
          text: "Failed to mark the day as busy. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error marking day as busy:", error);
      setBusyMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An error occurred while marking the day as busy.",
      });
    } finally {
      setIsBusyLoading(false);
    }
  };

  // Đặt ngày làm việc
  const markDoctorAvailable = async () => {
    if (!selectedDate) {
      setBusyMessage({
        type: "warning",
        text: "Please select a date to mark as available.",
      });
      return;
    }

    if (!isDateEligibleForUpdate(selectedDate)) {
      setBusyMessage({
        type: "error",
        text: "Only dates at least 7 days in the future can be marked as available.",
      });
      return;
    }

    setIsBusyLoading(true);
    setBusyMessage({ type: "", text: "" });

    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA").split("T")[0]; // Format: YYYY-MM-DD
      const response = await axios.put(
        `${VITE_API_SCHEDULE_URL}/doctors/${doctorId}/${formattedDate}`,
        {
          isAvailable: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setBusyMessage({
          type: "success",
          text: `Successfully marked ${selectedDate.toLocaleDateString()} as a working day.`,
        });
        fetchSchedule(selectedDate); // Cập nhật lại lịch sau khi đặt làm việc
      } else {
        setBusyMessage({
          type: "error",
          text: "Failed to mark the day as available. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error marking day as available:", error);
      setBusyMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An error occurred while marking the day as available.",
      });
    } finally {
      setIsBusyLoading(false);
    }
  };

  // Xử lý khi chọn slot (không cần thiết nữa vì backend đã xử lý trạng thái)
  const handleSlotSelection = (slot) => {
    if (slot.status !== "Available" || !isDateEligibleForUpdate(selectedDate)) return;
    setUpdateMessage({
      type: "warning",
      text: "Slot selection is disabled. Use the backend to manage availability.",
    });
  };

  // Loại bỏ chức năng cập nhật slot vì backend đã xử lý
  const updateSlotAvailability = () => {
    setUpdateMessage({
      type: "warning",
      text: "Slot updates are managed via backend API. Use PUT to set availability.",
    });
  };

  useEffect(() => {
    if (!selectedDate || !doctorId) return;
    fetchSchedule(selectedDate);
  }, [selectedDate, doctorId]);

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-purple-200 overflow-hidden h-full">
      {/* Header lịch */}
      <div className="bg-gradient-to-br from-[#8047db] to-[#c2a6ee] text-white p-4">
        <h3 className="text-xl font-bold flex items-center">
          <CalendarIcon size={20} className="mr-2" />
          Consultation Schedule
        </h3>
        <p className="text-purple-100 text-sm mt-1">
          View and update your appointment availability
        </p>
      </div>

      {/* Calendar */}
      <div className="p-4 bg-white overflow-y-auto">
        {/* Chọn tháng */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
            onClick={() => changeMonth(-1)}>
            <ArrowLeft size={18} className="text-purple-600" />
          </button>
          <h4 className="font-medium text-lg text-purple-800">
            {currentMonth}
          </h4>
          <button
            className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
            onClick={() => changeMonth(1)}>
            <ArrowLeft
              size={18}
              className="text-purple-600 transform rotate-180"
            />
          </button>
        </div>

        {/* Ngày trong tuần */}
        <div className="grid grid-cols-7 text-sm mb-2">
          {daysOfWeek.map((day, idx) => (
            <span
              key={idx}
              className="text-center font-medium text-purple-800 py-2">
              {day}
            </span>
          ))}
        </div>

        {/* Lịch ngày */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysInMonth.map((day, idx) => {
            if (!day) return <div key={idx} className="h-10"></div>;

            const currentDate = new Date(currentYear, currentMonthIndex, day);
            const todayDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const isSelectedDate =
              selectedDate &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonthIndex &&
              selectedDate.getFullYear() === currentYear;
            const isTodayDate =
              currentDate.getDate() === todayDate.getDate() &&
              currentDate.getMonth() === todayDate.getMonth() &&
              currentDate.getFullYear() === todayDate.getFullYear();

            const isEligible = isDateEligibleForUpdate(currentDate);

            return (
              <div
                key={idx}
                className={`flex justify-center items-center h-10 rounded-full
                  cursor-pointer transition-colors duration-200
                  ${isEligible ? "hover:bg-purple-100" : "opacity-70"}
                  ${isSelectedDate ? "bg-purple-600 text-white font-medium" : ""
                  }
                  ${isTodayDate && !isSelectedDate
                    ? "border border-purple-500 font-medium"
                    : ""
                  }
                  ${currentDate < todayDate && !isSelectedDate
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-purple-100"
                  }
                  
                `}
                onClick={() => handleDateClick(day)}>
                {day}
              </div>
            );
          })}
        </div>

        {/* Hiển thị lịch hẹn */}
        <div>
          <h4 className="font-medium text-purple-800 flex items-center mb-3">
            <Users size={18} className="mr-2" />
            Scheduled Appointments for {selectedDate.toLocaleDateString()}
          </h4>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            </div>
          ) : scheduledSlots.length > 0 ? (
            <div className="space-y-2">
              {scheduledSlots.map((slot, i) => (
                <div
                  key={i}
                  className={`p-3 border rounded-lg flex justify-between items-center
                    ${slot.status === "Unavailable"
                      ? "bg-red-50 border-red-200"
                      : slot.status === "Booked"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-green-50 border-green-200"
                    }
                  `}
                  onClick={() => handleSlotSelection(slot)}>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-600" />
                    <span className="font-medium">
                      {`${slot.startTime} - ${slot.endTime}`}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${slot.status === "Unavailable"
                        ? "bg-red-100 text-red-800"
                        : slot.status === "Booked"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }
                    `}>
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-700">
                No appointments scheduled for this date.
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Select another date to view appointments
              </p>
            </div>
          )}
        </div>
        {isDateEligibleForUpdate(selectedDate) && scheduledSlots.length > 0 && (
          <div className="mt-4">
            <button
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              onClick={markDoctorBusy}
              disabled={isBusyLoading}>
              {isBusyLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                  Marking as Busy...
                </>
              ) : (
                <>
                  <BusIcon size={18} className="mr-2" />
                  Mark {selectedDate.toLocaleDateString()} as Busy
                </>
              )}
            </button>
          </div>
        )}
        {/* Nút đặt ngày bận và ngày làm việc */}
        {isDateEligibleForUpdate(selectedDate) && scheduledSlots.length <= 0 && (
          <div className="mt-4 ">

            <button
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              onClick={markDoctorAvailable}
              disabled={isBusyLoading}>
              {isBusyLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                  Marking as Available...
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Mark {selectedDate.toLocaleDateString()} as Available
                </>
              )}
            </button>
          </div>
        )}



        {/* Thống kê */}
        <div className="mt-6 bg-purple-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-purple-800">Schedule Summary</h4>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Booked appointments:</span>
            <span className="font-bold text-blue-600">
              {scheduledSlots.filter((slot) => slot.status === "Booked").length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Available slots:</span>
            <span className="font-bold text-green-600">
              {scheduledSlots.filter((slot) => slot.status === "Available").length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Unavailable slots:</span>
            <span className="font-bold text-red-600">
              {scheduledSlots.filter((slot) => slot.status === "Unavailable").length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total time slots:</span>
            <span className="font-bold text-purple-800">
              {scheduledSlots.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}