import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
  const VITE_API_SCHEDULE_URL = import.meta.env.VITE_API;
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // State cho form tạo lịch
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    daysOfWeek: [1, 2, 3, 4, 5], // Mặc định từ T2 đến T6
    slotsPerDay: 8,
    slotDuration: 60,
    month: today.getMonth() + 1, // Tháng hiện tại (1-12)
    year: today.getFullYear(),
  });
  const [createScheduleMessage, setCreateScheduleMessage] = useState({
    type: "",
    text: "",
  });
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);

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
      const { timeSlots, message } = response.data;
      // Chuyển đổi dữ liệu từ API về định dạng frontend
      const formattedSlots = timeSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status
          ? slot.occupiedInfo
            ? "Booked"
            : "Available"
          : "Unavailable",
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
      const formattedDate = selectedDate
        .toLocaleDateString("en-CA")
        .split("T")[0]; // Format: YYYY-MM-DD
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
      const formattedDate = selectedDate
        .toLocaleDateString("en-CA")
        .split("T")[0]; // Format: YYYY-MM-DD
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
    if (slot.status !== "Available" || !isDateEligibleForUpdate(selectedDate))
      return;
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

  // Hàm tạo lịch mới
  const createSchedule = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Kiểm tra tháng và năm hợp lệ (hiện tại hoặc tương lai)
    if (
      scheduleForm.year < currentYear ||
      (scheduleForm.year === currentYear && scheduleForm.month < currentMonth)
    ) {
      setCreateScheduleMessage({
        type: "error",
        text: "Chỉ có thể tạo lịch cho tháng hiện tại hoặc trong tương lai.",
      });
      return;
    }

    setIsCreatingSchedule(true);
    setCreateScheduleMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `${VITE_API_SCHEDULE_URL}/doctors/${doctorId}/schedule`,
        {
          daysOfWeek: scheduleForm.daysOfWeek,
          slotsPerDay: scheduleForm.slotsPerDay,
          slotDuration: scheduleForm.slotDuration,
          month: scheduleForm.month,
          year: scheduleForm.year,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setCreateScheduleMessage({
          type: "success",
          text: `Đã tạo lịch làm việc cho tháng ${scheduleForm.month}/${scheduleForm.year} thành công.`,
        });
        // Cập nhật lại lịch nếu đang xem tháng hiện tại
        if (
          scheduleForm.month - 1 === currentMonthIndex &&
          scheduleForm.year === currentYear
        ) {
          fetchSchedule(selectedDate);
        }
        setIsModalOpen(false); // Đóng modal sau khi thành công
        toast.success(createScheduleMessage.text);
      } else {
        setCreateScheduleMessage({
          type: "error",
          text: "Không thể tạo lịch. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo lịch:", error);
      setCreateScheduleMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi tạo lịch làm việc.",
      });
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  useEffect(() => {
    if (!selectedDate || !doctorId) return;
    fetchSchedule(selectedDate);
  }, [selectedDate, doctorId]);

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-purple-200 overflow-hidden h-full">
      {/* Header lịch */}

      <div className="flex items-center justify-between  bg-gradient-to-br from-[#8047db] to-[#c2a6ee] text-white p-4 rounded-t-xl shadow-md">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon size={18} />
          Doctor Schedule
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-indigo-600  px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-indigo-100 transition duration-200"
        >
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            />
          </svg>
          Create Schedule
        </button>
      </div>

      {/* Calendar */}
      <div className="p-4 bg-white overflow-y-auto">
        {/* Chọn tháng */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
            onClick={() => changeMonth(-1)}
          >
            <ArrowLeft size={18} className="text-purple-600" />
          </button>
          <h4 className="font-medium text-lg text-purple-800">
            {currentMonth}
          </h4>
          <button
            className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
            onClick={() => changeMonth(1)}
          >
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
              className="text-center font-medium text-purple-800 py-2"
            >
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
                  ${
                    isSelectedDate ? "bg-purple-600 text-white font-medium" : ""
                  }
                  ${
                    isTodayDate && !isSelectedDate
                      ? "border border-purple-500 font-medium"
                      : ""
                  }
                  ${
                    currentDate < todayDate && !isSelectedDate
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-purple-100"
                  }
                  
                `}
                onClick={() => handleDateClick(day)}
              >
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
                    ${
                      slot.status === "Unavailable"
                        ? "bg-red-50 border-red-200"
                        : slot.status === "Booked"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-green-50 border-green-200"
                    }
                  `}
                  onClick={() => handleSlotSelection(slot)}
                >
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-600" />
                    <span className="font-medium">
                      {`${slot.startTime} - ${slot.endTime}`}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        slot.status === "Unavailable"
                          ? "bg-red-100 text-red-800"
                          : slot.status === "Booked"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }
                    `}
                  >
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
              disabled={isBusyLoading}
            >
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
        {isDateEligibleForUpdate(selectedDate) &&
          scheduledSlots.length <= 0 && (
            <div className="mt-4 ">
              <button
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                onClick={markDoctorAvailable}
                disabled={isBusyLoading}
              >
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
              {
                scheduledSlots.filter((slot) => slot.status === "Available")
                  .length
              }
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Unavailable slots:</span>
            <span className="font-bold text-red-600">
              {
                scheduledSlots.filter((slot) => slot.status === "Unavailable")
                  .length
              }
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
      {/* Modal tạo lịch */}
      {isModalOpen && (
        <div className="fixed inset-0  bg-[#4e4d4dbb] bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white bg-opacity-95 rounded-xl p-8 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-gradient-to-br from-[#8047db] to-[#c2a6ee] text-white p-4 rounded-lg flex items-center space-x-2">
                <h4 className="text-xl font-bold flex items-center">
                  Create New Schedule
                </h4>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <XCircle
                  size={24}
                  className="hover:scale-110 transition-transform duration-200"
                />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Days of Week:
                </label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {daysOfWeek.map((day, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={scheduleForm.daysOfWeek.includes(index)}
                        onChange={() => {
                          setScheduleForm((prev) => ({
                            ...prev,
                            daysOfWeek: prev.daysOfWeek.includes(index)
                              ? prev.daysOfWeek.filter((d) => d !== index)
                              : [...prev.daysOfWeek, index],
                          }));
                        }}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-colors duration-200"
                      />
                      <span className="text-gray-700 text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Month:
                </label>
                <select
                  value={scheduleForm.month}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      month: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 p-2 rounded-lg text-gray-800 border border-gray-300 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option
                      key={month}
                      value={month}
                      disabled={
                        scheduleForm.year === today.getFullYear() &&
                        month < today.getMonth() + 1
                      }
                      className={`${
                        scheduleForm.year === today.getFullYear() &&
                        month < today.getMonth() + 1
                          ? "text-gray-400"
                          : "text-gray-800"
                      } bg-white hover:bg-indigo-50 transition-colors duration-200`}
                    >
                      Month {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Year:
                </label>
                <select
                  value={scheduleForm.year}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 p-2 rounded-lg text-gray-800 border border-gray-300 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => today.getFullYear() + i
                  ).map((year) => (
                    <option
                      key={year}
                      value={year}
                      className="text-gray-800 bg-white hover:bg-indigo-50 transition-colors duration-200"
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={createSchedule}
                disabled={isCreatingSchedule}
                className={`mt-6 p-3 rounded-lg font-medium text-white flex items-center justify-center w-full transition-all duration-200 ${
                  isCreatingSchedule
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                }`}
              >
                {isCreatingSchedule ? (
                  <span>Creating...</span>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    Create Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
