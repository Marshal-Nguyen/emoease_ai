import React, { useState, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import axios from "axios";

const PatientMedicalRecord = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const token = localStorage.getItem('token');

  const getInitials = (fullName) => {
    if (!fullName) return "??";

    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0).toUpperCase() +
      names[names.length - 1].charAt(0).toUpperCase()
    );
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);

      try {
        const medicalRecordsResponse = await fetch(`http://localhost:3000/api/medical-records/${patientId}`, {
          method: "GET", // Assuming GET since no method was specified; change if needed
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!medicalRecordsResponse.ok) {
          throw new Error("Failed to fetch medical records");
        }
        const medicalRecordsData = await medicalRecordsResponse.json();


        const patientProfileResponse = await fetch(`https://mental-care-server-nodenet.onrender.com/api/patient-profiles/${patientId}`, {
          method: "GET", // Assuming GET since no method was specified; change if needed
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!patientProfileResponse.ok) {
          throw new Error("Failed to fetch patient profile");
        }
        const patientProfileData = await patientProfileResponse.json();
        const imageResponse = await axios.get(
          `https://mental-care-server-nodenet.onrender.com/api/profile/${patientId}/image`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAvatarUrl(imageResponse.data.data.publicUrl);

        const patientData = {
          id: patientProfileData.Id,
          fullName: patientProfileData.FullName,
          birthDate: patientProfileData.BirthDate,
          gender: patientProfileData.Gender,
          allergies: patientProfileData.Allergies,
          personalityTraits: patientProfileData.PersonalityTraits,
          contactInfo: {
            email: patientProfileData.Email,
            phone: patientProfileData.PhoneNumber,
            address: patientProfileData.Address,
          },
          medicalHistory: {
            diagnosedAt: patientProfileData.MedicalHistories?.[0]?.DiagnosedAt,
            physicalSymptoms:
              patientProfileData.MedicalHistories?.[0]?.MedicalHistoryPhysicalSymptom?.map(
                (sym) => ({
                  id: sym.PhysicalSymptoms.Id,
                  name: sym.PhysicalSymptoms.Name,
                  description: sym.PhysicalSymptoms.Description,
                  severity: sym.PhysicalSymptoms.Description.includes("High")
                    ? "Severe"
                    : "Mild",
                })
              ) || [],
            psychologicalSymptoms:
              patientProfileData.MedicalHistories?.[0]?.MedicalHistorySpecificMentalDisorder?.map(
                (dis) => ({
                  id: dis.MentalDisorders.Id,
                  name: dis.MentalDisorders.Name,
                  description: dis.MentalDisorders.Description,
                  severity: dis.MentalDisorders.Description.includes("Mild")
                    ? "Mild"
                    : "Moderate",
                })
              ) || [],
          },
          medicalRecords: medicalRecordsData.map((record) => ({
            id: record.Id,
            createdAt: record.CreatedAt,
            updatedAt: record.LastModified,
            notes: record.Description,
            specificMentalDisorders:
              record.MedicalRecordSpecificMentalDisorder?.map((dis) => ({
                id: dis.SpecificMentalDisordersId,
                name: dis.MentalDisorders.Name,
                description: dis.MentalDisorders.Description,
              })) || [],
            psychologicalAssessment:
              patientProfileData.MedicalHistories?.[0]?.Description,
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const exportMedicalRecord = async () => {
    if (!patient) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Medical Record for ${patient.fullName}`,
              heading: HeadingLevel.HEADING_1,
              alignment: "center",
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Patient ID: ", bold: true }),
                new TextRun(patient.id),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Full Name: ", bold: true }),
                new TextRun(patient.fullName),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Gender: ", bold: true }),
                new TextRun(patient.gender || "N/A"),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Age: ", bold: true }),
                new TextRun(calculateAge(patient.birthDate).toString()),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "Contact Information",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            ...(patient.contactInfo.email
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Email: ", bold: true }),
                      new TextRun(patient.contactInfo.email),
                    ],
                    spacing: { after: 100 },
                  }),
                ]
              : []),
            ...(patient.contactInfo.phone
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Phone: ", bold: true }),
                      new TextRun(patient.contactInfo.phone),
                    ],
                    spacing: { after: 100 },
                  }),
                ]
              : []),
            ...(patient.contactInfo.address
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Address: ", bold: true }),
                      new TextRun(patient.contactInfo.address),
                    ],
                    spacing: { after: 200 },
                  }),
                ]
              : []),
            new Paragraph({
              text: "Medical History",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            ...(patient.medicalHistory.diagnosedAt
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Diagnosis Date: ", bold: true }),
                      new TextRun(
                        formatDate(patient.medicalHistory.diagnosedAt)
                      ),
                    ],
                    spacing: { after: 100 },
                  }),
                ]
              : []),
            ...(patient.allergies
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Allergies: ", bold: true }),
                      new TextRun(patient.allergies),
                    ],
                    spacing: { after: 100 },
                  }),
                ]
              : []),
            ...(patient.personalityTraits
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Personality Traits: ", bold: true }),
                      new TextRun(patient.personalityTraits),
                    ],
                    spacing: { after: 100 },
                  }),
                ]
              : []),
            ...(patient.medicalHistory.physicalSymptoms.length > 0
              ? [
                  new Paragraph({
                    text: "Physical Symptoms",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...patient.medicalHistory.physicalSymptoms.flatMap(
                    (symptom) => [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `• ${symptom.name}: `,
                            bold: true,
                          }),
                          new TextRun(
                            `${symptom.description} (Severity: ${symptom.severity})`
                          ),
                        ],
                        spacing: { after: 100 },
                      }),
                    ]
                  ),
                ]
              : []),
            ...(patient.medicalHistory.psychologicalSymptoms.length > 0
              ? [
                  new Paragraph({
                    text: "Psychological Symptoms",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...patient.medicalHistory.psychologicalSymptoms.flatMap(
                    (symptom) => [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `• ${symptom.name}: `,
                            bold: true,
                          }),
                          new TextRun(
                            `${symptom.description} (Severity: ${symptom.severity})`
                          ),
                        ],
                        spacing: { after: 100 },
                      }),
                    ]
                  ),
                ]
              : []),
            ...(patient.medicalRecords.length > 0
              ? [
                  new Paragraph({
                    text: "Medical Records",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...patient.medicalRecords.flatMap((record) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Record Date: ${formatDate(
                            record.createdAt || record.updatedAt
                          )}`,
                          bold: true,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Notes: ", bold: true }),
                        new TextRun(record.notes),
                      ],
                      spacing: { after: 100 },
                    }),
                    ...(record.specificMentalDisorders.length > 0
                      ? [
                          new Paragraph({
                            text: "Mental Disorders",
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 100, after: 100 },
                          }),
                          ...record.specificMentalDisorders.flatMap(
                            (disorder) => [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `• ${disorder.name}: `,
                                    bold: true,
                                  }),
                                  new TextRun(disorder.description),
                                ],
                                spacing: { after: 100 },
                              }),
                            ]
                          ),
                        ]
                      : []),
                    ...(record.psychologicalAssessment
                      ? [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Psychological Assessment: ",
                                bold: true,
                              }),
                              new TextRun(record.psychologicalAssessment),
                            ],
                            spacing: { after: 100 },
                          }),
                        ]
                      : []),
                  ]),
                ]
              : []),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `patient_${patient.fullName}_medical_record.docx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg shadow-md">
          <p className="text-red-600 text-lg font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-lg font-medium">
            Patient information not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen  p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mr-4 border-2 border-teal-100 overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Patient Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-teal-800 text-xl font-bold">
                    {getInitials(patient.fullName)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {patient.fullName}
                </h1>
                <p className="text-gray-600 mt-1">
                  {patient.gender || "N/A"} • {calculateAge(patient.birthDate)}{" "}
                  Age • ID: {patient.id?.substring(0, 8) || "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={exportMedicalRecord}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2 shadow-md"
            >
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
              Export to DOC
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white">
          <div className="flex border-b border-gray-200">
            {["overview", "medical", "mental", "symptoms", "contact"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() +
                    tab.slice(1).replace("mental", "Mental Health")}
                </button>
              )
            )}
          </div>
        </div>

        <div className="p-8 max-h-[calc(100vh-250px)] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {(patient.medicalHistory?.diagnosedAt ||
                patient.gender ||
                patient.birthDate ||
                patient.medicalRecords?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {patient.medicalHistory?.diagnosedAt && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Diagnosis
                      </h3>
                      <p className="text-gray-600">
                        {formatDate(patient.medicalHistory.diagnosedAt)}
                      </p>
                    </div>
                  )}
                  {(patient.gender || patient.birthDate) && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Personal Information
                      </h3>
                      <p className="text-gray-600">
                        {patient.gender || "N/A"} •{" "}
                        {calculateAge(patient.birthDate)} Age
                      </p>
                    </div>
                  )}
                  {patient.medicalRecords?.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Latest Update
                      </h3>
                      <p className="text-gray-600">
                        {formatDateTime(
                          patient.medicalRecords[0].createdAt ||
                            patient.medicalRecords[0].updatedAt
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {patient.medicalRecords?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Medical Records
                  </h3>
                  {patient.medicalRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className={`pb-4 ${index > 0 ? "border-t pt-4" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-medium text-gray-800">
                          {formatDate(record.createdAt || record.updatedAt)}
                        </h4>
                      </div>
                      <p className="text-gray-600 mt-2">{record.notes}</p>
                      {record.specificMentalDisorders?.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700">
                            Mental Disorders
                          </h5>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {record.specificMentalDisorders.map((disorder) => (
                              <div
                                key={disorder.id}
                                className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                              >
                                {disorder.name}: {disorder.description}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(patient.medicalHistory?.physicalSymptoms?.length > 0 ||
                patient.medicalHistory?.psychologicalSymptoms?.length > 0) && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Medical History
                  </h3>
                  {patient.medicalHistory?.physicalSymptoms?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-base font-medium text-gray-800 mb-2">
                        Physical Symptoms
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patient.medicalHistory.physicalSymptoms.map(
                          (symptom) => (
                            <div
                              key={symptom.id}
                              className="p-4 bg-blue-50 rounded-lg"
                            >
                              <h5 className="font-medium text-blue-800">
                                {symptom.name}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {symptom.description} (Severity:{" "}
                                {symptom.severity})
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {patient.medicalHistory?.psychologicalSymptoms?.length >
                    0 && (
                    <div>
                      <h4 className="text-base font-medium text-gray-800 mb-2">
                        Psychological Symptoms
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patient.medicalHistory.psychologicalSymptoms.map(
                          (symptom) => (
                            <div
                              key={symptom.id}
                              className="p-4 bg-purple-50 rounded-lg"
                            >
                              <h5 className="font-medium text-purple-800">
                                {symptom.name}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {symptom.description} (Severity:{" "}
                                {symptom.severity})
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "medical" && (
            <div className="space-y-8">
              {(patient.medicalHistory?.diagnosedAt ||
                patient.allergies ||
                patient.personalityTraits) && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    General Information
                  </h3>
                  <div className="space-y-4">
                    {patient.medicalHistory?.diagnosedAt && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">
                          Diagnosis Date
                        </span>
                        <span className="text-gray-800">
                          {formatDate(patient.medicalHistory.diagnosedAt)}
                        </span>
                      </div>
                    )}
                    {patient.allergies && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">
                          Allergies
                        </span>
                        <span className="text-gray-800">
                          {patient.allergies}
                        </span>
                      </div>
                    )}
                    {patient.personalityTraits && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">
                          Personality Traits
                        </span>
                        <span className="text-gray-800">
                          {patient.personalityTraits}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {patient.medicalRecords?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Medical History
                  </h3>
                  <div className="space-y-4">
                    {patient.medicalRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className={`pb-4 ${index > 0 ? "border-t pt-4" : ""}`}
                      >
                        <h4 className="text-base font-medium text-gray-800">
                          {formatDate(record.createdAt || record.updatedAt)}
                        </h4>
                        <p className="text-gray-600 mt-2">{record.notes}</p>
                        {record.specificMentalDisorders?.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700">
                              Mental Disorders
                            </h5>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {record.specificMentalDisorders.map(
                                (disorder) => (
                                  <div
                                    key={disorder.id}
                                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                                  >
                                    {disorder.name}: {disorder.description}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "mental" && (
            <div className="space-y-8">
              {patient.medicalRecords?.[0]?.specificMentalDisorders?.length >
                0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Mental Disorders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.medicalRecords[0].specificMentalDisorders.map(
                      (disorder) => (
                        <div
                          key={disorder.id}
                          className="p-4 bg-red-50 rounded-lg"
                        >
                          <h4 className="font-medium text-red-800">
                            {disorder.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {disorder.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {patient.medicalRecords?.[0]?.psychologicalAssessment && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Psychological Assessment
                  </h3>
                  <p className="text-gray-600">
                    {patient.medicalRecords[0].psychologicalAssessment}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "symptoms" && (
            <div className="space-y-8">
              {patient.medicalHistory?.physicalSymptoms?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Physical Symptoms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patient.medicalHistory.physicalSymptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className="p-4 bg-blue-50 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-800 text-lg font-medium">
                              {symptom.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-800">
                              {symptom.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {symptom.description} (Severity:{" "}
                              {symptom.severity})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {patient.medicalHistory?.psychologicalSymptoms?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Psychological Symptoms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patient.medicalHistory.psychologicalSymptoms.map(
                      (symptom) => (
                        <div
                          key={symptom.id}
                          className="p-4 bg-purple-50 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-800 text-lg font-medium">
                                {symptom.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800">
                                {symptom.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {symptom.description} (Severity:{" "}
                                {symptom.severity})
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-8">
              {patient.contactInfo && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {patient.contactInfo.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                          <p className="text-sm text-gray-600 font-medium">
                            Email
                          </p>
                          <p className="text-gray-800">
                            {patient.contactInfo.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {patient.contactInfo.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                          <p className="text-sm text-gray-600 font-medium">
                            Phone
                          </p>
                          <p className="text-gray-800">
                            {patient.contactInfo.phone}
                          </p>
                        </div>
                      </div>
                    )}
                    {patient.contactInfo.address && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">
                            Address
                          </p>
                          <p className="text-gray-800">
                            {patient.contactInfo.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalRecord;
