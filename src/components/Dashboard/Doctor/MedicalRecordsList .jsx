import React, { useState, useEffect } from "react";
import axios from "axios";
import MedicalProfile from "../Patient/MedicalProfile";

export default function MedicalRecordsList({ profileId }) {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://mental-care-server-nodenet.onrender.com/api/medical-records/doctor/${profileId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("response", response.data);

        // Filter records to simulate "Processing" status (e.g., DiagnosedAt within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const processedRecords = response.data.filter(
          (record) => new Date(record.DiagnosedAt) >= thirtyDaysAgo
        );

        setMedicalRecords(processedRecords);

        // If there are records, automatically select the first one
        if (processedRecords.length > 0) {
          const firstRecord = processedRecords[0];
          setSelectedPatientId(firstRecord.PatientId);
          setActiveRecord(firstRecord.Id);
        }

        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu hồ sơ y tế");
        setLoading(false);
        console.error("Error fetching medical records:", err);
      }
    };

    fetchMedicalRecords();
  }, [profileId]);

  const handleViewPatientDetails = (patientId, recordId) => {
    console.log("patientId", patientId);
    console.log("recordId", recordId);

    setSelectedPatientId(patientId);
    setActiveRecord(recordId);
  };

  const getStatusBadge = (diagnosedAt) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(diagnosedAt) >= thirtyDaysAgo ? "Processing" : "Done";
  };

  const formatDate = (dateString) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleString("en-GB", options);
  };

  // Truncate ID to first 8 characters
  const truncateId = (id) => {
    if (!id) return "";
    return id.substring(0, 8) + "...";
  };

  if (loading) {
    return <div className="p-4">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Phần 1: Danh sách hồ sơ y tế */}
        <div className="border-r border-gray-200">
          <h2 className="px-4 py-2 text-lg font-medium border-b border-gray-200">
            Ongoing Treatment Records
          </h2>

          {medicalRecords.length === 0 ? (
            <div className="p-4">
              No medical records are currently being processed.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[460px]">
              {medicalRecords.map((record) => (
                <div
                  key={record.Id}
                  onClick={() =>
                    handleViewPatientDetails(record.PatientId, record.Id)
                  }
                  className={`border-l-4 cursor-pointer hover:bg-gray-50 ${activeRecord === record.Id
                      ? "border-blue-600 bg-blue-50"
                      : "border-transparent"
                    }`}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {getStatusBadge(record.DiagnosedAt)}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {formatDate(record.CreatedAt)}
                      </div>
                    </div>
                    <div className="mb-1">ID: {truncateId(record.Id)}</div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {record.Description ||
                        "Patient diagnosed with depression, ongoing therapy."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phần 2: Thông tin chi tiết bệnh nhân */}
        <div className="px-2">
          {selectedPatientId ? (
            <MedicalProfile patientId={selectedPatientId} />
          ) : (
            <div className="text-center text-gray-500 p-8">
              Please select a patient to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}