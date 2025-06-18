import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillEye } from "react-icons/ai";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import Loader from "../../../components/Web/Loader";
import { useNavigate } from "react-router-dom";
import { MdFilterList } from "react-icons/md";

const BASE_API_URL = "https://anhtn.id.vn/payment-service/payments";
const PATIENT_API_URL = "https://anhtn.id.vn/profile-service/patients";

// Hàm định dạng ngày giờ
const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    const day = date.getUTCDate();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${month} ${day}, ${year}, ${hours}:${minutes}`;
};

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortOrder, setSortOrder] = useState("desc");
    const [createAtFilter, setCreateAtFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("Completed");
    const [paymentTypeFilter, setPaymentTypeFilter] = useState("");
    const [hasMoreData, setHasMoreData] = useState(true);
    const navigate = useNavigate();

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(BASE_API_URL, {
                params: {
                    PageIndex: pageIndex,
                    PageSize: pageSize,
                    SortOrder: sortOrder,
                    CreatedAt: createAtFilter || undefined,
                    Status: statusFilter || undefined,
                    PaymentType: paymentTypeFilter || undefined,
                },
            });

            const paymentData = response.data.payments.data;

            // Gọi API để lấy thông tin patientProfile cho từng payment
            const updatedPayments = await Promise.all(
                paymentData.map(async (payment) => {
                    if (payment.patientProfileId) { // Giả sử payment có trường patientProfileId
                        try {
                            const patientResponse = await axios.get(
                                `${PATIENT_API_URL}/${payment.patientProfileId}`
                            );
                            const patientData = patientResponse.data.patientProfileDto;
                            return {
                                ...payment,
                                fullName: patientData.fullName,
                                email: patientData.contactInfo.email,
                            };
                        } catch (err) {
                            console.error("Error fetching patient profile:", err);
                            return { ...payment, fullName: "N/A", email: "N/A" };
                        }
                    }
                    return { ...payment, fullName: "N/A", email: "N/A" };
                })
            );

            setPayments(updatedPayments);
            setHasMoreData(paymentData.length === pageSize);
        } catch (error) {
            setError("Failed to load payments. Please try again.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [pageIndex, pageSize, sortOrder, createAtFilter, statusFilter, paymentTypeFilter]);

    if (initialLoad) return <Loader />;
    if (error)
        return (
            <p className="text-center text-red-500 text-xl font-semibold">{error}</p>
        );

    return (
        <div className="container mx-auto p-6 mt-2 bg-white min-h-screen">
            {/* Header */}
            <motion.div
                className="flex items-center justify-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <FaUsers className="text-indigo-700 mr-3" size={36} />
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    Payments List
                </h2>
            </motion.div>

            {/* Filter and Table Wrapper */}
            <motion.div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Filter and Search Controls */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <MdFilterList className="text-indigo-600" size={24} />
                            <input
                                type="date"
                                value={createAtFilter}
                                onChange={(e) => setCreateAtFilter(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                            <select
                                value={paymentTypeFilter}
                                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm"
                            >
                                <option value="">All Types</option>
                                <option value="BuySubscription">Buy Subscription</option>
                                <option value="Booking">Booking</option>
                                <option value="UpgradeSubscription">Upgrade Subscription</option>
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-sm">#</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Full Name</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Email</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Date</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Amount</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Type</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length > 0 ? (
                                payments.map((payment, index) => (
                                    <motion.tr
                                        key={payment.id}
                                        className="border-b border-gray-100 hover:bg-indigo-50 transition-all duration-200"
                                        whileHover={{ scale: 1.005 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {(pageIndex - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {payment.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {payment.email}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-indigo-600" size={18} />
                                                {formatDateTime(payment.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {payment.totalAmount.toLocaleString()} VND
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {payment.paymentType}
                                        </td>
                                        <td
                                            className={`px-6 py-4 font-medium ${payment.status === "Completed"
                                                ? "text-green-600"
                                                : payment.status === "Pending"
                                                    ? "text-orange-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {payment.status}
                                        </td>

                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                        No payments available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
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

export default PaymentList;