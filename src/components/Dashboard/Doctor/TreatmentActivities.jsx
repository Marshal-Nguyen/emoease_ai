import React, { useState, useEffect } from "react";
import CreateWeeklyPlanner from "./CreateWeeklyPlanner";

export default function TreatmentActivities({ profileId }) {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null);

  // Hardcoded medical records data
  const hardcodedMedicalRecords = [
    {
      id: "rec1",
      patientProfileId: "patient1",
      status: "Processing",
      createdAt: "2025-07-10T09:00:00Z",
      notes: "Patient diagnosed with anxiety, ongoing therapy sessions.",
    },
    {
      id: "rec2",
      patientProfileId: "patient2",
      status: "Processing",
      createdAt: "2025-07-11T14:30:00Z",
      notes: "Patient with depression, prescribed medication and therapy.",
    },
    {
      id: "rec3",
      patientProfileId: "patient3",
      status: "Done",
      createdAt: "2025-07-12T11:15:00Z",
      notes: "Patient completed physical therapy program.",
    },
  ];

  useEffect(() => {
    // Set hardcoded medical records
    const processedRecords = hardcodedMedicalRecords.filter(
      (record) => getStatusBadge(record.status) === "Processing"
    );

    setMedicalRecords(processedRecords);

    // Automatically select the first processing record
    if (processedRecords.length > 0) {
      const firstRecord = processedRecords[0];
      setSelectedPatientId(firstRecord.patientProfileId);
      setActiveRecord(firstRecord.id);
    }
  }, [profileId]);

  const handleViewPatientDetails = (patientId, recordId) => {
    setSelectedPatientId(patientId);
    setActiveRecord(recordId);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
      case "đang điều trị":
        return "Processing";
      case "completed":
      case "hoàn thành":
      case "done":
        return "Done";
      case "pending":
      case "chờ xử lý":
        return "Processing";
      default:
        return status;
    }
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

  const truncateId = (id) => {
    if (!id) return "";
    return id.substring(0, 8) + "...";
  };

  return (
    <div className="w-full h-screen">
      <div className="grid grid-cols-3 h-full gap-2">
        {/* Phần 1: Danh sách hồ sơ y tế */}
        <div className="col-span-1 h-fit overflow-y-auto py-6">
          {medicalRecords.length === 0 ? (
            <div className="p-4">
              No medical records are currently being processed.
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              {medicalRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() =>
                    handleViewPatientDetails(record.patientProfileId, record.id)
                  }
                  className={`border-l-4 cursor-pointer hover:bg-gray-50 ${activeRecord === record.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-transparent"
                    }`}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                    <div className="mb-1">ID: {truncateId(record.id)}</div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {record.notes ||
                        "Patient diagnosed with depression, ongoing therapy."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phần 2: Thông tin chi tiết bệnh nhân */}
        <div className="col-span-2 h-full bg-white rounded-lg shadow overflow-y-auto">
          {selectedPatientId ? (
            <CreateWeeklyPlanner profileId={selectedPatientId} />
          ) : (
            <div className="text-center text-gray-500 p-8">
              Vui lòng chọn một bệnh nhân để xem thông tin chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}