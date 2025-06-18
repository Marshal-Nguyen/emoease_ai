import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillEye } from "react-icons/ai";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import Loader from "../../../components/Web/Loader";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";

const BASE_API_URL = "https://anhtn.id.vn/scheduling-service/bookings";
const PATIENT_API_URL = "https://anhtn.id.vn/profile-service/patients/";
const DOCTOR_API_URL = "https://anhtn.id.vn/profile-service/doctors/";

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("Completed");
    const [hasMoreData, setHasMoreData] = useState(true);
    const navigate = useNavigate();

    const fetchProfileName = async (url, id) => {
        try {
            const response = await axios.get(`${url}${id}`);
            return response.data[Object.keys(response.data)[0]].fullName;
        } catch (error) {
            console.error(`Error fetching profile from ${url}:`, error);
            return "N/A";
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(BASE_API_URL, {
                params: {
                    PageIndex: pageIndex,
                    PageSize: pageSize,
                    Search: searchQuery,
                    SortBy: sortBy,
                    SortOrder: sortOrder,
                    Date: dateFilter || undefined,
                    Status: statusFilter || undefined,
                },
            });

            const bookingData = response.data.bookings.data;

            const enrichedBookings = await Promise.all(
                bookingData.map(async (booking) => {
                    const doctorName = await fetchProfileName(DOCTOR_API_URL, booking.doctorId);
                    const patientName = await fetchProfileName(PATIENT_API_URL, booking.patientId);
                    return {
                        ...booking,
                        doctorName,
                        patientName
                    };
                })
            );

            setBookings(enrichedBookings);
            setHasMoreData(bookingData.length === pageSize);
        } catch (error) {
            setError("Failed to load bookings. Please try again.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [pageIndex, pageSize, sortBy, sortOrder, searchQuery, dateFilter, statusFilter]);

    if (initialLoad) return <Loader />;
    if (error)
        return (
            <p className="text-center text-red-500 text-xl font-semibold">{error}</p>
        );

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "text-green-600";
            case "Awaiting Payment":
                return "text-orange-600";
            case "Payment Failed":
                return "text-red-600";
            case "Awaiting Meeting":
                return "text-blue-600";
            case "Cancelled":
                return "text-gray-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="container mx-auto p-6 mt-2 bg-white min-h-screen">
            <motion.div
                className="flex items-center justify-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <FaUsers className="text-indigo-700 mr-3" size={36} />
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    Bookings List
                </h2>
            </motion.div>

            <motion.div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-1/3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search bookings..."
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm shadow-sm"
                            />
                            <FiSearch
                                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                        </div>
                        <div className="flex gap-4 items-center">
                            <MdFilterList className="text-indigo-600" size={24} />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="AwaitPayment">Awaiting Payment</option>
                                <option value="Completed">Completed</option>
                                <option value="PaymentFailed">Payment Failed</option>
                                <option value="AwaitMeeting">Awaiting Meeting</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-sm">#</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Booking Code</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Doctor</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Patient</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Schedule</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Price</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((booking, index) => (
                                    <motion.tr
                                        key={booking.bookingCode}
                                        className="border-b border-gray-100 hover:bg-indigo-50 transition-all duration-200"
                                        whileHover={{ scale: 1.005 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {(pageIndex - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-semibold">
                                            {booking.bookingCode}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {booking.doctorName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {booking.patientName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-indigo-600" size={18} />
                                                <div>
                                                    <div>{booking.date}</div>
                                                    <div>{booking.startTime} ({booking.duration} mins)</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {booking.price.toLocaleString()} VND
                                        </td>
                                        <td className={`px-6 py-4 font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <motion.button
                                                className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-lg"
                                                title="View Detail"
                                                onClick={() => navigate(`${booking.bookingCode}`)}
                                                whileHover={{ scale: 1.15 }}
                                            >
                                                <AiFillEye size={20} />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        No bookings available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <div className="mt-8 flex justify-center gap-6">
                <motion.button
                    onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                    disabled={pageIndex === 1}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors shadow-lg font-semibold"
                    whileHover={{ scale: pageIndex === 1 ? 1 : 1.05 }}
                >
                    Previous
                </motion.button>
                <span className="py-2 text-gray-800 font-semibold text-lg">
                    Page {pageIndex}
                </span>
                <motion.button
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    disabled={!hasMoreData}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors shadow-lg font-semibold"
                    whileHover={{ scale: !hasMoreData ? 1 : 1.05 }}
                >
                    Next
                </motion.button>
            </div>
        </div>
    );
};

export default BookingList;
