import React, { useState, useEffect } from "react";
import PatientMedicalRecord from "../../../components/Dashboard/Doctor/PatientMedicalRecord";
import { useSelector } from "react-redux";

export default function MedicalHistory({ profileId }) {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const doctorId = useSelector((state) => state.auth.profileId);

  const token =
    useSelector((state) => state.auth.token) || localStorage.getItem("token");

  const pageSize = 10;

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/medical-records/doctor/${doctorId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const medicalData = await response.json();

        // Fetch booking details for each medical record
        const formattedRecords = await Promise.all(
          medicalData.map(async (record) => {
            let bookingDetails = {};
            try {
              const bookingResponse = await fetch(
                `http://localhost:3000/api/bookings?Id=${record.BookingId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const bookingData = await bookingResponse.json();
              bookingDetails = bookingData.data[0] || {};
            } catch (error) {
              console.error(
                `Error fetching booking for ID ${record.BookingId}:`,
                error
              );
            }

            return {
              id: record.Id,
              patientProfileId: record.PatientId,
              status: record.DiagnosedAt ? "Done" : "Processing",
              createdAt: record.CreatedAt,
              notes: record.Description || "No description provided",
              mentalDisorders:
                record.MedicalRecordSpecificMentalDisorder?.map(
                  (m) => m.MentalDisorders.Name
                ).join(", ") || "No disorders specified",
              patientName: bookingDetails.patientName || "Unknown",
              doctorName: bookingDetails.doctorName || "Unknown",
              bookingCode: bookingDetails.BookingCode || "N/A",
            };
          })
        );

        // Filter for completed records
        const completedRecords = formattedRecords;
        // const completedRecords = formattedRecords.filter(
        //   record => getStatusBadge(record.status) === "Done"
        // );

        // Implement pagination
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedRecords = completedRecords.slice(
          startIndex,
          startIndex + pageSize
        );

        setMedicalRecords(paginatedRecords);
        setTotalRecords(completedRecords.length);
        setTotalPages(
          Math.max(1, Math.ceil(completedRecords.length / pageSize))
        );

        // If current page exceeds total pages, reset to page 1
        if (
          currentPage >
          Math.max(1, Math.ceil(completedRecords.length / pageSize))
        ) {
          setCurrentPage(1);
        }

        // Automatically select the first completed record
        if (paginatedRecords.length > 0) {
          const firstRecord = paginatedRecords[0];
          setSelectedPatientId(firstRecord.patientProfileId);
          setActiveRecord(firstRecord.id);
        } else {
          setSelectedPatientId(null);
          setActiveRecord(null);
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
        setMedicalRecords([]);
        setTotalRecords(0);
        setTotalPages(1);
        setSelectedPatientId(null);
        setActiveRecord(null);
      }
    };

    fetchMedicalRecords();
  }, [profileId, currentPage]);

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

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pageButtons = [];
    pageButtons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        «
      </button>
    );

    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    pageButtons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        »
      </button>
    );

    return pageButtons;
  };

  return (
    <div className="w-full h-screen">
      <div className="grid grid-cols-4 grid-rows-1">
        {/* Phần 1: Danh sách hồ sơ y tế đã hoàn thành */}
        <div>
          <div className="h-fit overflow-y-auto py-6">
            {medicalRecords.length === 0 ? (
              <div className="p-4">
                No medical profiles have been completed.
              </div>
            ) : (
              <>
                <div className="overflow-y-auto h-full">
                  {medicalRecords.map((record) => (
                    <div
                      key={record.id}
                      onClick={() =>
                        handleViewPatientDetails(
                          record.patientProfileId,
                          record.id
                        )
                      }
                      className={`border-l-4 cursor-pointer hover:bg-gray-50 ${
                        activeRecord === record.id
                          ? "border-green-600 bg-green-50"
                          : "border border-transparent"
                      }`}
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium text-green-600">
                            {getStatusBadge(record.status)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {formatDate(record.createdAt)}
                          </div>
                        </div>
                        {/* <div className="mb-1">ID: {truncateId(record.id)}</div> */}
                        <div className="text-gray-500 text-xs mt-1 font-bold">
                          {record.bookingCode}
                        </div>

                        <div className="text-gray-700 text-xs mt-1">
                          Patient: {record.patientName}
                        </div>

                        {/* <div className="text-gray-500 text-xs mt-1">
                        Doctor: {record.doctorName}
                      </div> */}

                        {record.mentalDisorders && (
                          <div className="text-gray-500 text-xs mt-1">
                            Disorders: {record.mentalDisorders}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs line-clamp-2">
                          {record.notes}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center p-4 border-t border-gray-200">
                    {renderPagination()}
                  </div>
                )}

                <div className="text-center text-sm text-gray-500 p-2">
                  {totalRecords > 0
                    ? `Displaying ${medicalRecords.length} out of ${totalRecords} completed records`
                    : "No completed records available"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Phần 2: Thông tin chi tiết bệnh nhân */}
        <div className="col-span-3 h-[90%] shadow-sm bg-white rounded-lg overflow-y-auto">
          {selectedPatientId ? (
            <PatientMedicalRecord patientId={selectedPatientId} />
          ) : (
            <div className="text-center text-gray-500 p-8">
              Please select a patient to view detailed information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
