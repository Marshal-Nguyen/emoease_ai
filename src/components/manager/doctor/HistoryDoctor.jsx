import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const HistoryBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState({});
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("StartTime");
  const [sortOrder, setSortOrder] = useState("desc");
  const token = localStorage.getItem('token');
  const { id } = useParams();

  // Fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/bookings`, {
        params: {
          pageIndex,
          pageSize,
          Search: search || undefined,
          SortBy: sortBy,
          SortOrder: sortOrder,
          doctorId: id,
        },
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });


      const bookingsData = response.data.data || [];
      setBookings(bookingsData);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 0);

      const patientIds = [
        ...new Set(bookingsData.map((booking) => booking.PatientId)),
      ];
      if (patientIds.length > 0) {
        fetchPatientsInfo(patientIds);
      }
    } catch (err) {
      setError(`Failed to fetch bookings: ${err.message}`);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient information
  const fetchPatientsInfo = async (patientIds) => {
    setLoadingPatients(true);
    try {
      const patientsData = { ...patients };
      for (const patientId of patientIds) {
        if (!patientsData[patientId]) {

          const response = await fetch(
            `${import.meta.env.VITE_API}/patient-profiles/${patientId}`,
            {
              method: "GET", // Assuming GET since no method was specified; change if needed
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            }
          );
          patientsData[patientId] = response.data;
        }
      }
      setPatients(patientsData);
    } catch (err) {
      console.error("Error fetching patients info:", err);
      setError(`Failed to fetch patient profiles: ${err.message}`);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Get patient info for rendering
  const getPatientInfo = (patientId) => {
    const patient = patients[patientId] || {};
    return {
      name: patient.FullName || "Unknown Patient",
      email: patient.Email || "N/A",
    };
  };

  // Trigger search on Enter or button click
  const handleSearch = () => {
    setPageIndex(1);
    fetchBookings();
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageIndex(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(1);
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

  // Map status to Tailwind classes
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "awaiting meeting":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch bookings on mount and when pagination/sorting changes
  useEffect(() => {
    fetchBookings();
  }, [pageIndex, pageSize, sortBy, sortOrder]);

  return (
    <div className="flex flex-col h-full p-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Doctor's Booking History
      </h2>

      {/* Search Bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by Booking Code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>

      {/* Loading and Error Messages */}
      {loading || loadingPatients ? (
        <div className="text-center p-4 bg-blue-50 text-blue-600 rounded-md">
          Loading data...
        </div>
      ) : error ? (
        <div className="text-center p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      ) : (
        <>
          {/* Booking Table */}
          <div className="flex-1 overflow-auto rounded-lg shadow-sm">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    onClick={() => handleSortChange("BookingCode")}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Booking Code{" "}
                    {sortBy === "BookingCode" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Patient
                  </th>
                  <th
                    onClick={() => handleSortChange("Date")}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Date{" "}
                    {sortBy === "Date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSortChange("StartTime")}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Time{" "}
                    {sortBy === "StartTime" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Price (VND)
                  </th>
                  <th
                    onClick={() => handleSortChange("Status")}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                  >
                    Status{" "}
                    {sortBy === "Status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((booking) => {
                    const patientInfo = getPatientInfo(booking.PatientId);
                    return (
                      <tr
                        key={booking.BookingCode}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {booking.BookingCode}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="max-w-md">
                            <div className="font-semibold text-gray-800">
                              {patientInfo.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {patientInfo.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.Date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.StartTime}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.Duration} min
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.Price.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusClass(
                              booking.Status
                            )}`}
                          >
                            {booking.Status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-10 text-center text-sm text-gray-600"
                    >
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{bookings.length}</span> /{" "}
              <span className="font-semibold">{totalCount}</span> bookings |
              Page <span className="font-semibold">{pageIndex}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pageIndex === 1}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {"<"}
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
                      <span className="px-4 py-2 text-sm text-gray-600">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-full text-sm font-semibold ${pageIndex === page
                        ? "bg-blue-100 text-blue-600 border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {">"}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={pageIndex === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
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
