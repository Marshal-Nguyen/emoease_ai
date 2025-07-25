import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { motion } from "framer-motion";
import Loader from "../../../components/Web/Loader";

// Hàm định dạng ngày giờ
const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
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
  const [statusFilter, setStatusFilter] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem("token");
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API
        }/payment-zalo?pageIndex=${pageIndex}&pageSize=${pageSize}${sortOrder ? `&sortOrder=${sortOrder}` : ""
        }${createAtFilter ? `&createdAt=${createAtFilter}` : ""}${statusFilter ? `&status=${statusFilter}` : ""
        }`,
        {
          method: "GET", // Assuming GET since no method was specified; change if needed
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const { success, data, totalPages } = await response.json();

      if (!success) {
        throw new Error("API returned unsuccessful response");
      }

      // Transform API data to match the expected format
      const transformedData = data.map((payment) => ({
        id: payment.id,
        patientProfileId: payment.bookingId, // Using bookingId as patientProfileId
        fullName: payment.patientName,
        bookingCode: payment.bookingCode,
        email: "", // API doesn't provide email, so leaving empty
        createdAt: payment.createdAt,
        totalAmount: payment.amount,
        paymentType: "Booking", // Assuming all payments are for bookings
        status: payment.status,
      }));

      setPayments(transformedData);
      setTotalPages(totalPages);
      setHasMoreData(pageIndex < totalPages);
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
  }, [pageIndex, pageSize, sortOrder, createAtFilter, statusFilter]);

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
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
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
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Full Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Booking Code
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Date
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Amount
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Type
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Status
                </th>
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
                      {payment.bookingCode}
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
                      className={`px-6 py-4 font-medium ${payment.status === "Success"
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
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
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
          Page {pageIndex} of {totalPages}
        </span>
        <motion.button
          onClick={() => setPageIndex((prev) => prev + 1)}
          disabled={pageIndex >= totalPages}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors shadow-lg font-semibold"
          whileHover={{ scale: pageIndex >= totalPages ? 1 : 1.05 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
};

export default PaymentList;
