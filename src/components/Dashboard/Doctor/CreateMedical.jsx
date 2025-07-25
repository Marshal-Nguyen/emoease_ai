import React, { useState, useEffect } from "react";
import { User, FileText, Search } from "lucide-react";
import { toast } from "react-toastify";

const CreateMedical = ({ selectedPatient, patientDetails, profileId }) => {
  const [mentalDisorders, setMentalDisorders] = useState([]);
  const [selectedDisorders, setSelectedDisorders] = useState([]);
  const [currentPage] = useState(1);
  const [totalPages] = useState(1);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Processing");
  const [newDisorders, setNewDisorders] = useState([{ Name: "", Description: "" }]);
  const token = localStorage.getItem('token');
  // Fetch mental disorders from API
  useEffect(() => {
    fetch("https://mental-care-server-nodenet.onrender.com/special-disorders")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMentalDisorders(data.data);
        } else {
          toast.error("Failed to fetch mental disorders");
        }
      })
      .catch((error) => {
        console.error("Error fetching disorders:", error);
        toast.error("Error fetching mental disorders");
      });
  }, []);

  const toggleDisorderSelection = (disorderId) => {
    setSelectedDisorders((prev) =>
      prev.includes(disorderId)
        ? prev.filter((id) => id !== disorderId)
        : [...prev, disorderId]
    );
  };

  const handleNewDisorderChange = (index, e) => {
    const { name, value } = e.target;
    setNewDisorders((prev) =>
      prev.map((disorder, i) =>
        i === index ? { ...disorder, [name]: value } : disorder
      )
    );
  };

  const addNewDisorderField = () => {
    setNewDisorders((prev) => [...prev, { Name: "", Description: "" }]);
  };

  const removeNewDisorderField = (index) => {
    setNewDisorders((prev) => prev.filter((_, i) => i !== index));
  };

  const submitMedicalRecord = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient!");
      return;
    }

    // Prepare mental disorders array combining selected disorders and new disorders
    const selectedMentalDisorders = mentalDisorders
      .filter((disorder) => selectedDisorders.includes(disorder.Id))
      .map((disorder) => ({
        name: disorder.Name,
        description: disorder.Description || "No description",
      }));

    const newMentalDisorders = newDisorders
      .filter((disorder) => disorder.Name.trim() !== "")
      .map((disorder) => ({
        name: disorder.Name,
        description: disorder.Description || "No description",
      }));

    const payload = {
      patientId: patientDetails.id,
      doctorId: profileId,
      bookingId: selectedPatient.Id,
      description: notes || "Bệnh án không có mô tả",
      diagnosedAt: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
      mentalDisorders: [...selectedMentalDisorders, ...newMentalDisorders],
    };

    try {
      const response = await fetch("http://localhost:3000/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      toast.success("Medical record created and booking status updated successfully!");

    } catch (error) {
      console.error("Error submitting medical record:", error);
      toast.error("Error submitting medical record");
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
            Code: {selectedPatient.BookingCode}
          </span>
        )}
      </div>

      {patientDetails ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Patient Information */}
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

            {/* Medical History */}
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
                    {patientDetails.medicalHistory.mentalDisorders.map(
                      (disorder) => (
                        <div
                          key={disorder.id}
                          className="inline-block px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs mr-2"
                        >
                          <div className="text-sm font-semibold">
                            {disorder.name}
                          </div>
                          <div className="text-xs">
                            {disorder.description || "No description"}
                          </div>
                        </div>
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
                        <div
                          key={symptom.id}
                          className="inline-block px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs mr-2"
                        >
                          <div className="text-sm font-semibold">
                            {symptom.name}
                          </div>
                          <div className="text-xs mt-1">
                            {symptom.description || "No description"}
                          </div>
                        </div>
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
                  key={disorder.Id}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${selectedDisorders.includes(disorder.Id)
                    ? "bg-purple-100 border-purple-500"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  onClick={() => toggleDisorderSelection(disorder.Id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {disorder.Name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {disorder.Description}
                      </p>
                    </div>
                    {selectedDisorders.includes(disorder.Id) && (
                      <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* New Disorder Input */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Add New Disorder
              </h4>
              {newDisorders.map((disorder, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 mb-2 relative"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <input
                      type="text"
                      name="Name"
                      value={disorder.Name}
                      onChange={(e) => handleNewDisorderChange(index, e)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-purple-500"
                      placeholder="Enter disorder name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Description
                    </label>
                    <input
                      type="text"
                      name="Description"
                      value={disorder.Description}
                      onChange={(e) => handleNewDisorderChange(index, e)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-purple-500"
                      placeholder="Enter disorder description"
                    />
                  </div>
                  {newDisorders.length > 1 && (
                    <button
                      onClick={() => removeNewDisorderField(index)}
                      className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addNewDisorderField}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
              >
                <span className="mr-2">+</span> Add
              </button>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
              >
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
                  className="px-3 py-2 border rounded-md text-sm"
                >
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
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
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