import React, { useState, useEffect } from "react";
import axios from "axios";

const MedicalProfile = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        // Fetch patient profile data
        const profileResponse = await axios.get(
          `https://mental-care-server-nodenet.onrender.com/api/patient-profiles/${patientId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Fetch avatar image
        const imageResponse = await axios.get(
          `https://mental-care-server-nodenet.onrender.com/api/profile/${patientId}/image`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setPatient(profileResponse.data);
        setAvatarUrl(imageResponse.data.data.publicUrl);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to fetch patient data. Please try again later.");
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white p-4">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <p className="text-gray-500">No patient data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md px-6 py-6 w-full mx-auto">
      <div className="flex items-center relative">
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mr-4 border-2 border-teal-100 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Patient Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-teal-800 text-xl font-bold">
              {getInitials(patient.FullName)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-medium text-gray-800">
            {patient.FullName}
          </h2>
          <p className="text-gray-500 text-sm">{patient.Gender}</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-gray-200 my-4"></div>

      <div className="overflow-y-auto max-h-60">
        <SectionItem
          title="Address"
          content={patient.Address || "No address"}
        />
        <SectionItem title="Email" content={patient.Email || "No email"} />
        <SectionItem
          title="Phone"
          content={patient.PhoneNumber || "No phone"}
        />
        <SectionItem title="Allergies" content={patient.Allergies || "None"} />
        <SectionItem
          title="Personality Traits"
          content={patient.PersonalityTraits || "Not specified"}
        />
      </div>
    </div>
  );
};

const SectionItem = ({ title, content }) => (
  <div className="px-6 py-2 w-full mx-auto">
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    <p className="text-gray-600 text-xs mt-1">{content}</p>
  </div>
);

export default MedicalProfile;