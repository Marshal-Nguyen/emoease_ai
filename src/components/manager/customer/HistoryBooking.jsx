import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"; // Ensure react-toastify is installed
import { useParams } from "react-router-dom";

const HistoryBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for doctor information
    const [doctors, setDoctors] = useState({});
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    // State for canceling an appointment
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState(null);

    // State for cancel confirmation modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // State for cancellation reason
    const [cancelReason, setCancelReason] = useState("");

    // Pagination information
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Search and sorting information
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");

    // Fixed patient ID (can be passed as a prop if needed)
    const id = useParams();

    // Function to fetch booking data
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `https://anhtn.id.vn/scheduling-service/bookings`;
            const response = await axios.get(url, {
                params: {
                    PageIndex: pageIndex,
                    PageSize: pageSize,
                    Search: search,
                    SortBy: sortBy,
                    SortOrder: sortOrder,
                    PatientId: id.id,
                },
            });

            // Update state with returned data
            const bookingsData = response.data.bookings.data || [];
            setBookings(bookingsData);
            setTotalCount(response.data.bookings.totalCount || 0);
            setTotalPages(response.data.bookings.totalPages || 0);

            // Get unique doctorIds to fetch doctor info
            const doctorIds = [
                ...new Set(bookingsData.map((booking) => booking.doctorId)),
            ];
            fetchDoctorsInfo(doctorIds);
        } catch (err) {
            setError("An error occurred while fetching booking data: " + err.message);
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch doctor information
    const fetchDoctorsInfo = async (doctorIds) => {
        if (!doctorIds || doctorIds.length === 0) return;

        setLoadingDoctors(true);

        try {
            const doctorsData = { ...doctors };

            for (const doctorId of doctorIds) {
                if (!doctorsData[doctorId]) {
                    try {
                        const response = await axios.get(
                            `https://anhtn.id.vn/profile-service/doctors/${doctorId}`
                        );
                        doctorsData[doctorId] = response.data.doctorProfileDto;
                    } catch (doctorErr) {
                        console.error(
                            `Error fetching doctor with ID ${doctorId}:`,
                            doctorErr
                        );
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

    // Function to check if cancellation is allowed (at least 30 minutes before)
    const canCancelByTime = (date, time) => {
        const appointmentDate = new Date(`${date}T${time}`);
        const now = new Date();
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const minutesDiff = timeDiff / 60000;
        return minutesDiff > 30;
    };

    // Function to cancel a booking
    const cancelBooking = async () => {
        if (!selectedBooking) return;

        setCancelLoading(true);
        setCancelError(null);

        try {
            await axios.put(
                `https://anhtn.id.vn/scheduling-service/bookings/${selectedBooking.bookingCode}/status`,
                {
                    status: "Cancelled",
                }
            );

            fetchBookings();

            toast.success(
                `Successfully canceled booking ${selectedBooking.bookingCode}`,
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );

            handleCloseModal();
        } catch (err) {
            setCancelError(`Unable to cancel booking: ${err.message}`);
            console.error("Error cancelling booking:", err);
        } finally {
            setCancelLoading(false);
        }
    };

    // Open cancel confirmation modal
    const openCancelModal = (booking) => {
        if (booking.status.toLowerCase() === "cancelled") {
            toast.warning("This booking has already been canceled.");
            return;
        }

        if (booking.status.toLowerCase() === "completed") {
            toast.warning("Cannot cancel a completed booking.");
            return;
        }

        if (!canCancelByTime(booking.date, booking.startTime)) {
            toast.error(
                "Bookings can only be canceled at least 30 minutes before the scheduled time."
            );
            return;
        }

        setSelectedBooking(booking);
        setCancelReason("");
        setShowCancelModal(true);
    };

    // Close cancel confirmation modal
    const handleCloseModal = () => {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason("");
        setCancelError(null);
    };

    // Fetch data when parameters change
    useEffect(() => {
        fetchBookings();
    }, [pageIndex, pageSize, search, sortBy, sortOrder]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageIndex(newPage);
        }
    };

    // Handle page size change
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPageIndex(1); // Reset to first page when size changes
    };

    // Handle sort change
    const handleSortChange = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    // Format date and time
    const formatDateTime = (date, time) => {
        return `${date}, ${time}`;
    };

    // Map status to Tailwind classes
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
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Check if booking can be canceled (based on status)
    const canCancelBooking = (status) => {
        const lowerStatus = status;
        return lowerStatus === "Awaiting Meeting" || lowerStatus === "confirmed";
    };

    // Get doctor name and specialties
    const getDoctorInfo = (doctorId) => {
        const doctor = doctors[doctorId];
        if (!doctor) {
            return { name: "Loading...", specialties: [] };
        }
        return {
            name: doctor.fullName,
            specialties: doctor.specialties || [],
            rating: doctor.rating,
            experience: doctor.yearsOfExperience,
        };
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Patient's Booking History
            </h2>

            {/* Search bar */}
            <div className="flex mb-2">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    onClick={() => setPageIndex(1)}
                    className="px-4 py-2 bg-blue-500 text-white font-medium rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Search
                </button>
            </div>

            {/* Display loading or error messages */}
            {loading && (
                <div className="text-center p-4 my-4 bg-blue-50 text-blue-700 rounded-md">
                    Loading data...
                </div>
            )}

            {error && (
                <div className="text-center p-4 my-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {/* Cancel confirmation modal */}
            {showCancelModal && selectedBooking && (
                <div className="fixed inset-0 bg-[#0000002c] bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Confirm Booking Cancellation
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
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
                                            fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Are you sure you want to cancel this booking? This action
                                            cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Booking Details:
                                </p>
                                <div className="bg-gray-50 rounded p-3">
                                    <p className="text-sm">
                                        <span className="font-medium">Booking Code:</span>{" "}
                                        {selectedBooking.bookingCode}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Doctor:</span>{" "}
                                        {getDoctorInfo(selectedBooking.doctorId).name}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Date & Time:</span>{" "}
                                        {formatDateTime(
                                            selectedBooking.date,
                                            selectedBooking.startTime
                                        )}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Duration:</span>{" "}
                                        {selectedBooking.duration} minutes
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="cancelReason"
                                    className="block text-sm font-medium text-gray-700 mb-1">
                                    Cancellation Reason (optional):
                                </label>
                                <textarea
                                    id="cancelReason"
                                    rows="3"
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Please let us know why you are canceling this booking..."></textarea>
                            </div>

                            {cancelError && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-red-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor">
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
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={cancelBooking}
                                disabled={cancelLoading}
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {cancelLoading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    "Confirm Cancellation"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking table */}
            {!loading && !error && (
                <>
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="overflow-y-auto flex-1 rounded-lg shadow">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th
                                            onClick={() => handleSortChange("bookingCode")}
                                            className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                            Booking Code{" "}
                                            {sortBy === "bookingCode" &&
                                                (sortOrder === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Doctor
                                        </th>
                                        <th
                                            onClick={() => handleSortChange("date")}
                                            className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                            Date{" "}
                                            {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th
                                            onClick={() => handleSortChange("startTime")}
                                            className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                            Time{" "}
                                            {sortBy === "startTime" &&
                                                (sortOrder === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Price (VND)
                                        </th>
                                        <th
                                            onClick={() => handleSortChange("status")}
                                            className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                            Status{" "}
                                            {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {bookings.length > 0 ? (
                                        bookings.map((booking) => {
                                            const doctorInfo = getDoctorInfo(booking.doctorId);
                                            const canCancel =
                                                canCancelBooking(booking.status) &&
                                                canCancelByTime(booking.date, booking.startTime);

                                            return (
                                                <tr
                                                    key={booking.bookingCode}
                                                    className="hover:bg-gray-50">
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {booking.bookingCode}
                                                    </td>
                                                    <td className="px-2 py-4 text-sm text-gray-500">
                                                        <div className="max-w-xs">
                                                            <div className="font-medium text-gray-900">
                                                                {doctorInfo.name}
                                                            </div>
                                                            {doctorInfo.rating && (
                                                                <div className="flex items-center mt-1">
                                                                    <div className="text-xs text-yellow-500 mr-1">
                                                                        ★
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        {doctorInfo.rating}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.date}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.startTime}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.duration} minutes
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.price.toLocaleString()}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                                                booking.status
                                                            )}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {canCancel ? (
                                                            <button
                                                                onClick={() => openCancelModal(booking)}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                                                <svg
                                                                    className="mr-1 h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor">
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
                                                                {booking.status.toLowerCase() === "cancelled"
                                                                    ? "Canceled"
                                                                    : !canCancelByTime(
                                                                        booking.date,
                                                                        booking.startTime
                                                                    )
                                                                        ? "Past cancellation time (< 30 minutes)"
                                                                        : "Cannot cancel"}
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
                                                className="px-6 py-10 text-center text-sm text-gray-500">
                                                No bookings found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Pagination */}
                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{bookings.length}</span> /{" "}
                            <span className="font-medium">{totalCount}</span> bookings | Page{" "}
                            <span className="font-medium">{pageIndex}</span> /{" "}
                            <span className="font-medium">{totalPages}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={pageIndex === 1}
                                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                «
                            </button>
                            <button
                                onClick={() => handlePageChange(pageIndex - 1)}
                                disabled={pageIndex === 1}
                                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                &lt;
                            </button>

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
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${pageIndex === page
                                                ? "bg-blue-500 text-white"
                                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                }`}
                                            onClick={() => handlePageChange(page)}>
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))}

                            <button
                                onClick={() => handlePageChange(pageIndex + 1)}
                                disabled={pageIndex === totalPages}
                                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                &gt;
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={pageIndex === totalPages}
                                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                »
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-700">Items per page:</label>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
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