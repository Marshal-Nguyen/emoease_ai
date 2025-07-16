import React, { useState, useEffect } from "react";

const PatientMedicalRecord = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient data from APIs
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch medical records
        const medicalRecordsResponse = await fetch(
          `http://localhost:3000/api/medical-records/${patientId}`
        );
        if (!medicalRecordsResponse.ok) {
          throw new Error("Failed to fetch medical records");
        }
        const medicalRecordsData = await medicalRecordsResponse.json();

        // Fetch patient profile
        const patientProfileResponse = await fetch(
          `http://localhost:3000/api/patient-profiles/${patientId}`
        );
        if (!patientProfileResponse.ok) {
          throw new Error("Failed to fetch patient profile");
        }
        const patientProfileData = await patientProfileResponse.json();

        // Map API data to the expected patient structure
        const patientData = {
          id: patientProfileData.Id,
          fullName: patientProfileData.FullName,
          birthDate: patientProfileData.BirthDate, // May be null
          gender: patientProfileData.Gender,
          allergies: patientProfileData.Allergies,
          personalityTraits: patientProfileData.PersonalityTraits,
          contactInfo: {
            email: patientProfileData.Email,
            phone: patientProfileData.PhoneNumber,
            address: patientProfileData.Address,
          },
          emergencyContact: null, // Not provided in API
          careTeam: [], // Not provided in API
          medicalHistory: {
            diagnosedAt: patientProfileData.MedicalHistories?.[0]?.DiagnosedAt,
            physicalSymptoms:
              patientProfileData.MedicalHistories?.[0]?.MedicalHistoryPhysicalSymptom?.map(
                (sym) => ({
                  id: sym.PhysicalSymptoms.Id,
                  name: sym.PhysicalSymptoms.Name,
                  severity: sym.PhysicalSymptoms.Description.includes("High")
                    ? "Severe"
                    : "Mild", // Derive severity based on description
                })
              ) || [],
            psychologicalSymptoms:
              patientProfileData.MedicalHistories?.[0]?.MedicalHistorySpecificMentalDisorder?.map(
                (dis) => ({
                  id: dis.MentalDisorders.Id,
                  name: dis.MentalDisorders.Name,
                  severity: dis.MentalDisorders.Description.includes("Mild")
                    ? "Mild"
                    : "Moderate", // Derive severity based on description
                })
              ) || [],
            symptomTrackingData: [], // Not provided in API
          },
          medicalRecords: medicalRecordsData.map((record) => ({
            id: record.Id,
            status: "Done", // Default status as per hardcoded data
            createdAt: record.CreatedAt,
            updatedAt: record.LastModified,
            notes: record.Description,
            specificMentalDisorders: record.MedicalRecordSpecificMentalDisorder?.map(
              (dis) => ({
                id: dis.SpecificMentalDisordersId,
                name: dis.MentalDisorders.Name,
                description: dis.MentalDisorders.Description,
              })
            ) || [],
            psychologicalAssessment:
              patientProfileData.MedicalHistories?.[0]?.Description ||
              "No psychological assessment available",
            treatments: [], // Not provided in API
          })),
        };

        setPatient(patientData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  // Status badge function
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
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
        return status || "Processing";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading patient information...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  // Render patient not found
  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          **Patient information not found.**
        </p>
      </div>
    );
  }

  // Original rendering logic (unchanged)
  return (
    <div className="w-full h-full bg-[#fff] flex flex-col rounded-2xl overflow-hidden py-2 px-4">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4 text-blue-800 text-xl font-bold">
              {patient.fullName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  {patient.fullName}
                </h1>
                {patient.medicalRecords && patient.medicalRecords.length > 0 && (
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {getStatusBadge(patient.medicalRecords[0]?.status)}
                  </span>
                )}
              </div>
              <p className="text-gray-500">
                {patient.gender || "N/A"} • {calculateAge(patient.birthDate)}{" "}
                Age • ID: {patient.id?.substring(0, 8) || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-200 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Update
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export medical record
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-t border-gray-200 shadow-md">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            className={`px-6 py-4 font-medium text-sm ${activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm ${activeTab === "medical"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
            onClick={() => setActiveTab("medical")}
          >
            Medical Information
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm ${activeTab === "mental"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
            onClick={() => setActiveTab("mental")}
          >
            Mental Health
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm ${activeTab === "symptoms"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
            onClick={() => setActiveTab("symptoms")}
          >
            Symptoms
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm ${activeTab === "contact"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
            onClick={() => setActiveTab("contact")}
          >
            Contact Information
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-b-xl shadow-md p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-2">

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                title="Diagnosis"
                value={formatDate(patient.medicalHistory?.diagnosedAt)}
                description="Diagnosis Date"
              />
              <InfoCard
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                title="Personal Information"
                value={`${patient.gender || "N/A"} • ${calculateAge(
                  patient.birthDate
                )} Age`}
                description="Gender & Age"
              />
              <InfoCard
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                title="Latest Notes"
                value={
                  patient.medicalRecords && patient.medicalRecords.length > 0
                    ? formatDateTime(
                      patient.medicalRecords[0].createdAt ||
                      patient.medicalRecords[0].updatedAt
                    )
                    : "N/A"
                }
                description="Update Date"
              />
            </div>

            {/* Latest Notes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Most Recent Notes
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                  <p className="text-gray-600">
                    {patient.medicalRecords[0]?.notes || "No notes available"}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No notes available</p>
                )}
              </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Physical Symptoms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Physical Symptoms
                </h3>
                <div className="bg-white rounded p-4 border border-gray-200">
                  {patient.medicalHistory?.physicalSymptoms &&
                    patient.medicalHistory.physicalSymptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.medicalHistory.physicalSymptoms.map((symptom) => (
                        <span
                          key={symptom.id}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {symptom.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No physical symptoms</p>
                  )}
                </div>
              </div>

              {/* Mental Disorders */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Mental Disorders
                </h3>
                <div className="bg-white rounded p-4 border border-gray-200">
                  {patient.medicalRecords &&
                    patient.medicalRecords.length > 0 &&
                    patient.medicalRecords[0]?.specificMentalDisorders &&
                    patient.medicalRecords[0].specificMentalDisorders.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.medicalRecords[0].specificMentalDisorders.map(
                        (disorder) => (
                          <span
                            key={disorder.id}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                          >
                            {disorder.name}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No Mental Disorders</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Info Tab */}
        {activeTab === "medical" && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Medical Information
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200 space-y-4">
                <InfoRow
                  label="Diagnosis Date"
                  value={formatDate(patient.medicalHistory?.diagnosedAt)}
                />
                <InfoRow
                  label="Allergies"
                  value={patient.allergies || "No allergies"}
                />
                <InfoRow
                  label="Personality Traits"
                  value={patient.personalityTraits || "No information available"}
                />
                <InfoRow
                  label="Current Condition"
                  value={
                    patient.medicalRecords && patient.medicalRecords.length > 0
                      ? getStatusBadge(patient.medicalRecords[0]?.status)
                      : "No information available"
                  }
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Medical History
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {patient.medicalRecords.map((record, index) => (
                      <div
                        key={record.id || index}
                        className={`${index > 0 ? "border-t pt-4" : ""}`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-800">
                            {formatDate(record.createdAt || record.updatedAt)}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {getStatusBadge(record.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          {record.notes || "No notes available"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No medical history available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mental Health Tab */}
        {activeTab === "mental" && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Mental Disorders
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalRecords &&
                  patient.medicalRecords.length > 0 &&
                  patient.medicalRecords[0]?.specificMentalDisorders &&
                  patient.medicalRecords[0].specificMentalDisorders.length > 0 ? (
                  <div className="space-y-4">
                    {patient.medicalRecords[0].specificMentalDisorders.map(
                      (disorder) => (
                        <div
                          key={disorder.id}
                          className="p-3 bg-red-50 rounded-lg"
                        >
                          <h4 className="font-medium text-red-800">
                            {disorder.name}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {disorder.description ||
                              "No detailed description available"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No mental disorders</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Psychological Assessment
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                <p className="text-gray-600">
                  {patient.medicalRecords &&
                    patient.medicalRecords.length > 0 &&
                    patient.medicalRecords[0]?.psychologicalAssessment
                    ? patient.medicalRecords[0].psychologicalAssessment
                    : "No Psychological Assessment Available"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Psychotherapy</h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalRecords &&
                  patient.medicalRecords.length > 0 &&
                  patient.medicalRecords[0]?.treatments &&
                  patient.medicalRecords[0].treatments.length > 0 ? (
                  <div className="space-y-3">
                    {patient.medicalRecords[0].treatments.map((treatment, index) => (
                      <div
                        key={treatment.id || index}
                        className="p-3 bg-green-50 rounded-lg"
                      >
                        <h4 className="font-medium text-green-800">
                          {treatment.name}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {treatment.description ||
                            "No detailed description available"}
                        </p>
                        {treatment.startDate && (
                          <p className="text-gray-500 text-xs mt-1">
                            Start: {formatDate(treatment.startDate)}
                            {treatment.endDate
                              ? ` - End: ${formatDate(treatment.endDate)}`
                              : ""}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No psychotherapy information available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === "symptoms" && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Physical Symptoms
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalHistory?.physicalSymptoms &&
                  patient.medicalHistory.physicalSymptoms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patient.medicalHistory.physicalSymptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className="flex items-center p-3 border border-blue-100 rounded-lg bg-blue-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-800 text-lg">
                            {symptom.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800">
                            {symptom.name}
                          </h4>
                          <p className="text-gray-600 text-xs">
                            {symptom.severity
                              ? `Severity Level: ${symptom.severity}`
                              : "Unspecified Severity Level"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No physical symptoms</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Mental Symptoms
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalHistory?.psychologicalSymptoms &&
                  patient.medicalHistory.psychologicalSymptoms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patient.medicalHistory.psychologicalSymptoms.map(
                      (symptom) => (
                        <div
                          key={symptom.id}
                          className="flex items-center p-3 border border-purple-100 rounded-lg bg-purple-50"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-purple-800 text-lg">
                              {symptom.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-800">
                              {symptom.name}
                            </h4>
                            <p className="text-gray-600 text-xs">
                              {symptom.severity
                                ? `Severity Level: ${symptom.severity}`
                                : "Unspecified Severity Level"}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No mental symptoms</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Symptom Tracking
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.medicalHistory?.symptomTrackingData &&
                  patient.medicalHistory.symptomTrackingData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symptoms
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Severity Level
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patient.medicalHistory.symptomTrackingData.map(
                          (entry, index) => (
                            <tr key={entry.id || index}>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {formatDate(entry.date)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800">
                                {entry.symptomName}
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div
                                      className={`h-full rounded-full ${(entry.severity || 0) < 4
                                        ? "bg-green-500"
                                        : (entry.severity || 0) < 7
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                        }`}
                                      style={{
                                        width: `${((entry.severity || 0) / 10) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {(entry.severity || 0)}/10
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {entry.notes || "No notes available"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No symptom tracking data available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Contact Information
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200 space-y-4">
                {patient.contactInfo ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">
                          {patient.contactInfo.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-gray-800">
                          {patient.contactInfo.phone ||
                            "No phone number available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            className="h-5 w-5 text-blue-600"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-800">
                          {patient.contactInfo.address ||
                            "No address available"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic">
                    No contact information available
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Emergency Contact
              </h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.emergencyContact ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {patient.emergencyContact.name || "No name available"}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {patient.emergencyContact.relationship ||
                            "Relationship: Unspecified"}
                        </p>
                      </div>
                      {patient.emergencyContact.phone && (
                        <a
                          href={`tel:${patient.emergencyContact.phone}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center text-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Call
                        </a>
                      )}
                    </div>
                    <InfoRow
                      label="Phone Number"
                      value={
                        patient.emergencyContact.phone ||
                        "No phone number available"
                      }
                    />
                    <InfoRow
                      label="Email"
                      value={
                        patient.emergencyContact.email || "No email available"
                      }
                    />
                    <InfoRow
                      label="Address"
                      value={
                        patient.emergencyContact.address ||
                        "No address available"
                      }
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No emergency contact information available
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Care Team</h3>
              <div className="bg-white rounded p-4 border border-gray-200">
                {patient.careTeam && patient.careTeam.length > 0 ? (
                  <div className="space-y-4">
                    {patient.careTeam.map((provider, index) => (
                      <div
                        key={provider.id || index}
                        className={`flex justify-between items-center ${index > 0 ? "border-t pt-4" : ""
                          }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-800 font-medium">
                            {provider.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {provider.name}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {provider.role || "Role: Unspecified"}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                            </a>
                          )}
                          {provider.email && (
                            <a
                              href={`mailto:${provider.email}`}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No care team information available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const InfoCard = ({ icon, title, value, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">
          {icon}
        </div>
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2">
      <span className="text-gray-500 mb-1 sm:mb-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
};

export default PatientMedicalRecord;