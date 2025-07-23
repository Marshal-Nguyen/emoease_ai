import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import CreateMedical from "../../../components/Dashboard/Doctor/CreateMedical";

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
  const profileId = "26205c9d-c1d0-4ba2-bd90-edcfe2ce7b52";

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
        `https://mental-care-server-nodenet.onrender.com/api/bookings?doctorId=${profileId}&pageIndex=${pageIndex}&pageSize=${pageSize}&Search=${encodeURIComponent(
          search
        )}&SortBy=${sortBy}&SortOrder=${sortOrder}`
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
        `https://mental-care-server-nodenet.onrender.com/api/patient-profiles/${patientId}`
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
    fetchBookings(pagination.pageIndex, pagination.pageSize, searchTerm, sortBy, sortOrder);
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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    fetchBookings(pagination.pageIndex, pagination.pageSize, searchTerm, column, sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex h-screen bg-gray-50 py-6 px-2 gap-1">
      <div className="w-1/3">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("Date")}
                      >
                        Date {sortBy === "Date" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("StartTime")}
                      >
                        Time {sortBy === "StartTime" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr
                        key={patient.Id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${selectedPatient?.Id === patient.Id ? "bg-purple-50" : ""
                          }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {patient.BookingCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {patient.Date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {patient.StartTime}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${selectedPatient?.Id === patient.Id
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              }`}
                            onClick={() => handleSelectPatient(patient)}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center my-2 mx-2">
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

      <div className="w-2/3">
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