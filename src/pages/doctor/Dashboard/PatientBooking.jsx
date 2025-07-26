import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import CreateMedical from "../../../components/Dashboard/Doctor/CreateMedical";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PatientBooking = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("Date");
  const [sortOrder, setSortOrder] = useState("asc");
  const profileId = useSelector((state) => state.auth.profileId);

  const token = useSelector((state) => state.auth.token);

  const [patientDetailsData, setPatientDetailsData] = useState({});

  const fetchBookings = async (
    pageIndex = 1,
    pageSize = 10,
    search = "",
    sortBy = "Date",
    sortOrder = "asc"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:3000/api/bookings?doctorId=${profileId}&pageIndex=${pageIndex}&pageSize=${pageSize}&Search=${encodeURIComponent(
          search
        )}&SortBy=${sortBy}&SortOrder=${sortOrder}`,
        {
          method: "GET", // Assuming GET since no method was specified; change if needed
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setPatients(data.data || []);
      setPagination({
        pageIndex: data.pageIndex || 1,
        pageSize: data.pageSize || 10,
        totalPages: data.totalPages || 1,
      });
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetch(
        `https://mental-care-server-nodenet.onrender.com/api/patient-profiles/${patientId}`,
        {
          method: "GET", // Assuming GET since no method was specified; change if needed
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch patient details");
      const data = await response.json();

      const patientDetails = {
        id: data.Id,
        fullName: data.FullName || "Unknown",
        gender: data.Gender || "Unknown",
        contactInfo: { phoneNumber: data.PhoneNumber || "Unknown" },
        medicalHistory: {
          mentalDisorders:
            data.MedicalHistories?.[0]?.MedicalHistorySpecificMentalDisorder?.map(
              (disorder) => ({
                id: disorder.MentalDisorders.Id,
                name: disorder.MentalDisorders.Name,
                description: disorder.MentalDisorders.Description,
              })
            ) || [],
          physicalSymptoms:
            data.MedicalHistories?.[0]?.MedicalHistoryPhysicalSymptom?.map(
              (symptom) => ({
                id: symptom.PhysicalSymptoms.Id,
                name: symptom.PhysicalSymptoms.Name,
                description: symptom.PhysicalSymptoms.Description,
              })
            ) || [],
        },
      };

      setPatientDetailsData((prev) => ({
        ...prev,
        [patientId]: patientDetails,
      }));
      setSelectedPatientDetails(patientDetails);
    } catch (err) {
      setError("Failed to fetch patient details");
      setSelectedPatientDetails(null);
    }
  };

  useEffect(() => {
    fetchBookings(
      pagination.pageIndex,
      pagination.pageSize,
      searchTerm,
      sortBy,
      sortOrder
    );
  }, [pagination.pageIndex, pagination.pageSize, sortBy, sortOrder]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.PatientId);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, pageIndex: newPage });
    }
  };

  const handleSearch = () => {
    fetchBookings(1, pagination.pageSize, searchTerm, sortBy, sortOrder);
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/updateStatus/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      toast.success(`${status} successfully!`);

      // Refresh the bookings list
      fetchBookings(
        pagination.pageIndex,
        pagination.pageSize,
        searchTerm,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(`Failed to update booking status to ${status}`);
    }
  };

  const handleCheckIn = (bookingId) => {
    updateBookingStatus(bookingId, "CheckIn");
  };

  const handleCheckOut = (bookingId) => {
    updateBookingStatus(bookingId, "CheckOut");
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    fetchBookings(
      pagination.pageIndex,
      pagination.pageSize,
      searchTerm,
      column,
      sortOrder === "asc" ? "desc" : "asc"
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 py-6 px-2 gap-1">
      <div className="w-1/2 min-w-0">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Waiting For Examination
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by booking code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("Date")}
                        >
                          Date{" "}
                          {sortBy === "Date" &&
                            (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("StartTime")}
                        >
                          Time{" "}
                          {sortBy === "StartTime" &&
                            (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr
                          key={patient.Id}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            selectedPatient?.Id === patient.Id
                              ? "bg-purple-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {patient.BookingCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {patient.Date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {patient.StartTime}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                patient.Status === "CheckIn"
                                  ? "bg-green-100 text-green-800"
                                  : patient.Status === "CheckOut"
                                  ? "bg-blue-100 text-blue-800"
                                  : patient.Status === "Booking Success"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : patient.Status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {patient.Status || "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-col space-y-1">
                              <button
                                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
                                  selectedPatient?.Id === patient.Id
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                }`}
                                onClick={() => handleSelectPatient(patient)}
                              >
                                Select
                              </button>
                              {patient.Status !== "CheckIn" &&
                                patient.Status !== "CheckOut" &&
                                patient.Status !== "Cancelled" && (
                                  <button
                                    className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-150"
                                    onClick={() => handleCheckIn(patient.Id)}
                                  >
                                    Check In
                                  </button>
                                )}
                              {patient.Status === "CheckIn" && (
                                <button
                                  className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-150"
                                  onClick={() => handleCheckOut(patient.Id)}
                                >
                                  Check Out
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center p-4 border-t bg-white flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-4 py-2 flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(pagination.pageIndex - 1)}
                      disabled={pagination.pageIndex === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Pre
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.pageIndex} / {pagination.totalPages}
                    </span>
                    <button
                      className="px-4 py-2 flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(pagination.pageIndex + 1)}
                      disabled={pagination.pageIndex === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/2 min-w-0">
        <CreateMedical
          selectedPatient={selectedPatient}
          patientDetails={selectedPatientDetails}
          profileId={profileId}
        />
      </div>
    </div>
  );
};

export default PatientBooking;
