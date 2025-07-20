import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"; // Đảm bảo đã cài đặt react-toastify

const HistoryBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho thông tin bác sĩ
  const [doctors, setDoctors] = useState({});
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // State cho việc hủy lịch hẹn
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // State cho modal xác nhận hủy lịch hẹn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // State cho lý do hủy lịch
  const [cancelReason, setCancelReason] = useState("");

  // State cho thông tin hoàn tiền
  const [refundInfo, setRefundInfo] = useState(null);

  // Thông tin phân trang
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Thông tin tìm kiếm và sắp xếp
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Date");
  const [sortOrder, setSortOrder] = useState("asc");

  // ID bệnh nhân cố định (có thể chuyển thành prop nếu cần)
  const patientId = useSelector((state) => state.auth.profileId);
  console.log("Patient ID:", patientId);
  const VITE_API_SCHEDULE_URL = import.meta.env.VITE_API;
  const VITE_API_PROFILE_URL = import.meta.env.VITE_API_PROFILE_URL;
  // Hàm lấy dữ liệu booking
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${VITE_API_SCHEDULE_URL}/bookings`;
      const response = await axios.get(url, {
        params: {
          PageIndex: pageIndex,
          PageSize: pageSize,
          Search: search,
          SortBy: sortBy,
          SortOrder: sortOrder,
          patientId: patientId,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Cập nhật state với dữ liệu trả về
      const bookingsData = response.data.data || [];
      setBookings(bookingsData);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 0);

      // Lấy danh sách doctorId duy nhất để gọi API doctor
      const doctorIds = [
        ...new Set(bookingsData.map((booking) => booking.DoctorId)),
      ];
      fetchDoctorsInfo(doctorIds);
    } catch (err) {
      setError("Đã xảy ra lỗi khi lấy dữ liệu lịch hẹn: " + err.message);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy thông tin bác sĩ
  const fetchDoctorsInfo = async (doctorIds) => {
    if (!doctorIds || doctorIds.length === 0) return;

    setLoadingDoctors(true);

    try {
      // Tạo một đối tượng để lưu trữ thông tin bác sĩ
      const doctorsData = { ...doctors };

      // Lấy thông tin bác sĩ cho mỗi doctorId
      for (const doctorId of doctorIds) {
        // Kiểm tra xem đã có thông tin bác sĩ này chưa
        if (!doctorsData[doctorId]) {
          try {
            const response = await axios.get(
              `${VITE_API_PROFILE_URL}/doctors/${doctorId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            doctorsData[doctorId] = response.data.doctorProfileDto;
          } catch (doctorErr) {
            console.error(
              `Error fetching doctor with ID ${doctorId}:`,
              doctorErr
            );
            // Nếu không lấy được thông tin bác sĩ, đặt một giá trị null để tránh gọi lại
            doctorsData[doctorId] = null;
          }
        }
      }

      setDoctors(doctorsData);
    } catch (err) {
      console.error("Error fetching doctors info:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Kiểm tra thời gian có thể hủy (trước 30 phút)
  const canCancelByTime = (date, time) => {
    // Kết hợp ngày và giờ từ booking
    const appointmentDate = new Date(`${date}T${time}`);

    // Lấy thời gian hiện tại
    const now = new Date();

    // Tính khoảng cách thời gian (milliseconds)
    const timeDiff = appointmentDate.getTime() - now.getTime();

    // Chuyển đổi sang phút (1 phút = 60000 milliseconds)
    const minutesDiff = timeDiff / 60000;

    // Trả về true nếu thời gian đến lịch hẹn còn hơn 30 phút
    return minutesDiff > 24 * 60;
  };

  // Tính toán thông tin hoàn tiền
  const getRefundInfo = (date, time, price) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff >= 1) {
      return {
        willRefund: true,
        message: "Bạn sẽ nhận được tiền hoàn sau 2 ngày (hủy trước 1 ngày)",
        refundAmount: 100000, // Hoặc tính toán dựa trên price
      };
    } else {
      return {
        willRefund: false,
        message: "Do hủy trễ hơn 1 ngày, không hoàn tiền",
        refundAmount: 0,
      };
    }
  };

  // Hàm hủy lịch hẹn
  const cancelBooking = async () => {
    if (!selectedBooking) return;

    // Reset các state thông báo
    setCancelLoading(true);
    setCancelError(null);

    try {
      // Gọi API để hủy lịch hẹn sử dụng endpoint mới
      const response = await axios.post(
        `${VITE_API_SCHEDULE_URL}/cancelBooking/${selectedBooking.Id}`,
        {
          // Có thể gửi thêm reason nếu backend cần
          reason: cancelReason || "User cancelled",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Cập nhật lại danh sách lịch hẹn
      fetchBookings();

      // Lấy message từ response
      const { message, updatedPrice, newAmount } = response.data;

      // Hiển thị thông báo thành công với message từ backend
      toast.success(message, {
        position: "top-right",
        autoClose: 5000, // Tăng thời gian hiển thị cho message dài
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Nếu có thông tin hoàn tiền, hiển thị thêm toast info
      if (updatedPrice && newAmount) {
        setTimeout(() => {
          toast.info(`Số tiền hoàn lại: ${newAmount?.toLocaleString()} VND`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 1000);
      }

      // Đóng modal
      handleCloseModal();
    } catch (err) {
      setCancelError(`Không thể hủy lịch hẹn: ${err.message}`);
      console.error("Error cancelling booking:", err);

      // Hiển thị toast error
      toast.error(
        `Lỗi khi hủy lịch hẹn: ${err.response?.data?.message || err.message}`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // Mở modal xác nhận hủy lịch hẹn
  const openCancelModal = (booking) => {
    // Kiểm tra trạng thái có thể hủy không
    if (booking.Status.toLowerCase() === "Cancelled") {
      toast.warning("Lịch hẹn này đã được hủy trước đó.");
      return;
    }

    // Kiểm tra thời gian có thể hủy không
    if (!canCancelByTime(booking.Date, booking.StartTime)) {
      toast.error(
        "Chỉ có thể hủy lịch hẹn trước thời gian diễn ra ít nhất 1 ngày."
      );
      return;
    }

    // Tính toán thông tin hoàn tiền
    const refundCalculation = getRefundInfo(
      booking.Date,
      booking.StartTime,
      booking.Price
    );
    setRefundInfo(refundCalculation);

    // Đặt booking đã chọn và mở modal
    setSelectedBooking(booking);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // Đóng modal xác nhận hủy
  const handleCloseModal = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelReason("");
    setCancelError(null);
    setRefundInfo(null);
  };

  // Gọi API khi các tham số thay đổi
  useEffect(() => {
    fetchBookings();
  }, [pageIndex, pageSize, search, sortBy, sortOrder]);

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageIndex(newPage);
    }
  };

  // Hàm thay đổi kích thước trang
  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(1); // Reset về trang đầu tiên khi thay đổi kích thước
  };

  // Hàm thay đổi sắp xếp
  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Định dạng ngày giờ
  const formatDateTime = (date, time) => {
    return `${date}, ${time}`;
  };

  // Map trạng thái đến class Tailwind
  const getStatusClass = (status) => {
    switch (status) {
      case "Awaiting Meeting":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "Booking Success":
        return "bg-green-100 text-green-800";
      case "Check In":
        return "bg-blue-100 text-blue-800";
      case "Check Out":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Kiểm tra xem lịch hẹn có thể hủy không (dựa trên trạng thái)
  const canCancelBooking = (status) => {
    const cancelableStatuses = [
      "Awaiting Meeting",
      "confirmed",
      "Booking Success",
      "Pending", // Thêm các trạng thái có thể hủy khác
    ];
    return cancelableStatuses.includes(status);
  };

  // Lấy tên và chuyên môn của bác sĩ
  const getDoctorInfo = (doctorId) => {
    const doctor = doctors[doctorId];
    if (!doctor) {
      return { name: "Đang tải...", specialties: [] };
    }
    return {
      name: doctor.fullName,
      specialties: doctor.specialties || [],
      rating: doctor.rating,
      experience: doctor.yearsOfExperience,
    };
  };

  // Sử dụng doctorName từ API response nếu có
  const getDoctorDisplayName = (booking) => {
    if (booking.doctorName) {
      return booking.doctorName;
    }
    return getDoctorInfo(booking.DoctorId).name;
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Patient Appointments
      </h2>

      {/* Thanh tìm kiếm */}
      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={() => setPageIndex(1)}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>

      {/* Hiển thị thông báo loading hoặc lỗi */}
      {loading && (
        <div className="text-center p-4 my-4 bg-blue-50 text-blue-700 rounded-md">
          Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div className="text-center p-4 my-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Modal xác nhận hủy lịch hẹn */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-[#0000002c] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Appointment Cancellation
              </h3>

              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Are you sure you want to cancel this appointment? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Appointment Details:
                </p>

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm">
                    <span className="font-medium">Booking Code:</span>{" "}
                    {selectedBooking.BookingCode}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Doctor:</span>{" "}
                    {selectedBooking.doctorName ||
                      getDoctorInfo(selectedBooking.DoctorId).name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Date & Time:</span>{" "}
                    {formatDateTime(
                      selectedBooking.Date,
                      selectedBooking.StartTime
                    )}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Duration:</span>{" "}
                    {selectedBooking.Duration} minutes
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Price:</span>{" "}
                    {selectedBooking.Price.toLocaleString()} VND
                  </p>
                </div>
              </div>

              {/* Thông tin hoàn tiền */}
              {refundInfo && (
                <div
                  className={`mb-4 p-4 rounded-lg border-l-4 ${
                    refundInfo.willRefund
                      ? "bg-green-50 border-green-400"
                      : "bg-orange-50 border-orange-400"
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className={`h-5 w-5 ${
                          refundInfo.willRefund
                            ? "text-green-400"
                            : "text-orange-400"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        {refundInfo.willRefund ? (
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4
                        className={`text-sm font-medium ${
                          refundInfo.willRefund
                            ? "text-green-800"
                            : "text-orange-800"
                        }`}
                      >
                        Refund Information
                      </h4>
                      <p
                        className={`text-sm ${
                          refundInfo.willRefund
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {refundInfo.message}
                      </p>
                      {refundInfo.willRefund && refundInfo.refundAmount > 0 && (
                        <p className="text-sm text-green-700 mt-1 font-medium">
                          Estimated refund:{" "}
                          {refundInfo.refundAmount.toLocaleString()} VND
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="cancelReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cancellation Reason (Optional):
                </label>

                <textarea
                  id="cancelReason"
                  rows="3"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation (optional)..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  This information will help us improve our service.
                </p>
              </div>

              {cancelError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{cancelError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={cancelBooking}
                disabled={cancelLoading}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng lịch hẹn */}
      {!loading && !error && (
        <>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1  rounded-lg shadow">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th
                      onClick={() => handleSortChange("BookingCode")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Booking Code{" "}
                      {sortBy === "BookingCode" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th
                      onClick={() => handleSortChange("Date")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Date{" "}
                      {sortBy === "Date" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSortChange("StartTime")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Time{" "}
                      {sortBy === "StartTime" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th
                      onClick={() => handleSortChange("Status")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      State{" "}
                      {sortBy === "Status" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => {
                      const doctorInfo = getDoctorInfo(booking.DoctorId);
                      const canCancel =
                        canCancelBooking(booking.Status) &&
                        canCancelByTime(booking.Date, booking.StartTime);

                      return (
                        <tr
                          key={booking.BookingCode}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.BookingCode}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900">
                                {getDoctorDisplayName(booking)}
                              </div>
                              {/* <div className="text-xs text-gray-500 mt-1">
                                {doctorInfo.specialties
                                  .map((specialty) => specialty.name)
                                  .join(", ")}
                              </div> */}
                              {doctorInfo.rating && (
                                <div className="flex items-center mt-1">
                                  <div className="text-xs text-yellow-500 mr-1">
                                    ★
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {doctorInfo.rating}
                                  </div>
                                  {/* <div className="text-xs text-gray-500 ml-2">
                                    {doctorInfo.experience} năm kinh nghiệm
                                  </div> */}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.Date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.StartTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.Duration} minutes
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.Price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                booking.Status
                              )}`}
                            >
                              {booking.Status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {canCancel ? (
                              <button
                                onClick={() => openCancelModal(booking)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg
                                  className="mr-1 h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancel
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                {/* {booking.Status.toLowerCase() === "cancelled"
                                  ? "Cancelled"
                                  : !canCancelByTime(

                                      booking.Date,
                                      booking.StartTime
                                    )
                                  ? "Cancellation expired (< 30 minutes)"
                                  : "Cannot cancel"} */}
                                {booking.Status.toLowerCase() === "cancelled" &&
                                  "Cancelled"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        Không có lịch hẹn nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Phân trang */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{bookings.length}</span> /{" "}
              <span className="font-medium">{totalCount}</span> lịch hẹn | Trang{" "}
              <span className="font-medium">{pageIndex}</span> /{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pageIndex === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>

              {/* Hiển thị các số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= pageIndex - 1 && p <= pageIndex + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-3 py-1 text-sm text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pageIndex === page
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={pageIndex === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &raquo;
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Số mục mỗi trang:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryBooking;
