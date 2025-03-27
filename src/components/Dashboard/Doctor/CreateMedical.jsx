import React, { useState, useEffect } from "react";
import { User, FileText, AlertCircle, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateMedical = ({ selectedPatient, patientDetails, profileId }) => {
  const [mentalDisorders, setMentalDisorders] = useState([]);
  const [selectedDisorders, setSelectedDisorders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Processing");
  const fetchMentalDisorders = async (page) => {
    try {
      const response = await axios.get(
        `https://psychologysupport-profile.azurewebsites.net/specific-mental-disorders`,
        {
          params: {
            PageIndex: page,
            PageSize: 10,
          },
        }
      );

      const { data, totalPages } = response.data.specificMentalDisorder;
      setMentalDisorders(data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching mental disorders:", error);
    }
  };
  const toggleDisorderSelection = (disorderId) => {
    setSelectedDisorders((prev) =>
      prev.includes(disorderId)
        ? prev.filter((id) => id !== disorderId)
        : [...prev, disorderId]
    );
  };
  const submitMedicalRecord = async () => {
    if (!selectedPatient) return;
    console.log("Selected Patient:", selectedPatient);
    try {
      const payload = {
        patientProfileId: selectedPatient.patientId, // Assuming the patient object has an id
        doctorId: profileId, // Replace with actual doctor ID
        notes: notes || "No notes provided",
        status: status,
        existingDisorderIds: selectedDisorders,
      };

      await axios.post(
        "https://psychologysupport-profile.azurewebsites.net/patients/medical-record",
        payload
      );
      await axios.put(
        `https://psychologysupport-scheduling.azurewebsites.net/bookings/${selectedPatient.bookingCode}/status`,
        { status: "Completed" }
      );
      toast.success(
        "Medical record created and booking status updated successfully!"
      );
    } catch (error) {
      console.error("Error creating medical record:", error);
      alert("Failed to create medical record");
    }
  };

  // Fetch disorders on component mount and page change
  useEffect(() => {
    fetchMentalDisorders(currentPage);
  }, [currentPage]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Create Medical Record
        </h2>
        {selectedPatient && (
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Code: {selectedPatient.bookingCode}
          </span>
        )}
      </div>

      {patientDetails ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Thông tin bệnh nhân */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">
                  Patient Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={patientDetails.fullName}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={patientDetails.gender}
                      className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={patientDetails.contactInfo.phoneNumber}
                      className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tiền sử bệnh */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">Medical History</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Mental Disorders
                  </label>
                  <div className="mt-1 space-y-2">
                    {patientDetails.medicalHistory.specificMentalDisorders.map(
                      (disorder) => (
                        <span
                          key={disorder.id}
                          className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs mr-2">
                          {disorder.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Physical Symptoms
                  </label>
                  <div className="mt-1 space-y-2">
                    {patientDetails.medicalHistory.physicalSymptoms.map(
                      (symptom) => (
                        <span
                          key={symptom.id}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs mr-2">
                          {symptom.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-700">Diagnosis</h3>
            </div>

            {/* Mental Disorders Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {mentalDisorders.map((disorder) => (
                <div
                  key={disorder.id}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    selectedDisorders.includes(disorder.id)
                      ? "bg-purple-100 border-purple-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleDisorderSelection(disorder.id)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {disorder.mentalDisorderName}
                      </h4>
                      <p className="text-xs text-gray-600">{disorder.name}</p>
                    </div>
                    {selectedDisorders.includes(disorder.id) && (
                      <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50">
                Pre
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50">
                Next
              </button>
            </div>

            {/* Status and Notes */}
            <div className="mt-4">
              <div className="flex items-center space-x-3 mb-2">
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm">
                  <option value="Processing">Processing</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-purple-500"
                placeholder="Add notes and treatment recommendations..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={submitMedicalRecord}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] text-gray-500">
          <FileText className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            Please select a patient from the list
          </p>
          <p className="text-sm mt-2">
            Select a patient to start creating a medical record
          </p>
        </div>
      )}
    </div>
  );
};
export default CreateMedical;
