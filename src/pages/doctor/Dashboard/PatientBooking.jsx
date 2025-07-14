import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import CreateMedical from "../../../components/Dashboard/Doctor/CreateMedical";
const PatientBooking = () => {
  // Hardcoded patient data
  const [patients] = useState([
    {
      bookingCode: "BOOK-001",
      patientId: "1",
      date: "2025-07-12",
      startTime: "09:00 AM",
    },
    {
      bookingCode: "BOOK-002",
      patientId: "2",
      date: "2025-07-12",
      startTime: "10:00 AM",
    },
    {
      bookingCode: "BOOK-003",
      patientId: "3",
      date: "2025-07-13",
      startTime: "11:00 AM",
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1, // Only one page for hardcoded data
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);
  const [error] = useState(null);
  const profileId = "DOC123"; // Hardcoded doctor profile ID

  // Hardcoded patient details
  const patientDetailsData = {
    1: {
      fullName: "John Doe",
      gender: "Male",
      contactInfo: { phoneNumber: "123-456-7890" },
      medicalHistory: {
        specificMentalDisorders: [
          { id: "1", name: "Anxiety Disorder" },
          { id: "2", name: "Depression" },
        ],
        physicalSymptoms: [
          { id: "1", name: "Fatigue" },
          { id: "2", name: "Headache" },
        ],
      },
    },
    2: {
      fullName: "Jane Smith",
      gender: "Female",
      contactInfo: { phoneNumber: "987-654-3210" },
      medicalHistory: {
        specificMentalDisorders: [{ id: "3", name: "PTSD" }],
        physicalSymptoms: [{ id: "3", name: "Insomnia" }],
      },
    },
    3: {
      fullName: "Alex Johnson",
      gender: "Non-binary",
      contactInfo: { phoneNumber: "555-123-4567" },
      medicalHistory: {
        specificMentalDisorders: [{ id: "4", name: "Bipolar Disorder" }],
        physicalSymptoms: [{ id: "4", name: "Nausea" }],
      },
    },
  };

  // Simulate fetching patient details
  const fetchPatientDetails = (patientId) => {
    setSelectedPatientDetails(patientDetailsData[patientId] || null);
  };

  // Handle patient selection
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.patientId);
  };

  // Handle page change (not fully functional with hardcoded data)
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, pageIndex: newPage });
    }
  };

  // Filter patients by search term
  const filteredPatients = patients.filter((patient) =>
    patient.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 py-6 px-2 gap-1">
      {/* Patient List Section */}
      <div className="w-1/3">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Waiting For Examination
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient.bookingCode}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${selectedPatient?.bookingCode === patient.bookingCode
                          ? "bg-purple-50"
                          : ""
                          }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {patient.bookingCode?.split("-")[1]}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {patient.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {patient.startTime}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${selectedPatient?.bookingCode ===
                              patient.bookingCode
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

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
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
            </>
          )}
        </div>
      </div>

      {/* Medical Record Creation Section */}
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