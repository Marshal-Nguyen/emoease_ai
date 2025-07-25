import React, { useEffect, useState } from "react";
import { HiOutlineDocumentText, HiOutlineUserCircle, HiOutlineClock } from "react-icons/hi";
import { FaNotesMedical, FaBrain, FaStethoscope } from "react-icons/fa";

const NotionPatient = () => {
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileId = localStorage.getItem("profileId");
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        if (!profileId) {
          throw new Error("Profile ID not found");
        }
        const response = await fetch(`http://localhost:3000/api/medical-records/${profileId}`, {
          method: "GET", // Assuming GET since no method was specified; change if needed
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch medical record");
        }
        const data = await response.json();
        setMedicalRecord(data[0]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicalRecord();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-[300px] bg-white flex items-center justify-center rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <HiOutlineClock className="w-6 h-6 text-blue-500 animate-pulse" />
          <span className="text-blue-600 text-lg font-medium">Loading medical records...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] bg-white flex items-center justify-center rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <HiOutlineUserCircle className="w-6 h-6 text-red-500" />
          <span className="text-red-600 text-lg font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!medicalRecord) {
    return (
      <div className="min-h-[300px] bg-white flex items-center justify-center rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <HiOutlineDocumentText className="w-6 h-6 text-gray-500" />
          <span className="text-gray-600 text-lg font-medium">No medical record found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[300px] bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FaNotesMedical className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-blue-700">Description</h3>
        </div>
        <p className="text-gray-600 text-sm pl-7">
          {medicalRecord.Description || "Khám ban đầu"}
        </p>

        <div className="flex items-center space-x-2">
          <HiOutlineClock className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-green-700">Diagnosed At</h3>
        </div>
        <p className="text-gray-600 text-sm pl-7">
          {medicalRecord.DiagnosedAt
            ? new Date(medicalRecord.DiagnosedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            : "July 21, 2025"}
        </p>

        <div className="flex items-center space-x-2">
          <FaBrain className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-purple-700">Mental Disorders</h3>
        </div>
        {medicalRecord.MedicalRecordSpecificMentalDisorder?.length > 0 ? (
          <ul className="list-none pl-7 space-y-1">
            {medicalRecord.MedicalRecordSpecificMentalDisorder.map((disorder, index) => (
              <li key={index} className="text-gray-600 text-sm flex items-center space-x-2">
                <FaStethoscope className="w-4 h-4 text-gray-400" />
                <span>
                  {disorder.MentalDisorders?.Name || `Unknown Disorder ${index + 1}`} -{" "}
                  {disorder.MentalDisorders?.Description || "No description available"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="pl-7">
            <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-100 p-2 rounded-lg w-fit">
              <FaNotesMedical className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">No mental disorders recorded yet</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotionPatient;