import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaHistory,
  FaAllergies,
  FaBrain,
  FaNotesMedical,
  FaCalendarAlt,
} from "react-icons/fa";
import Loader from "../../Web/Loader";
import HistoryPatient from "./HistoryPatient";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);

        const profileResponse = await fetch(
          `${import.meta.env.VITE_API}/patient-profiles/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch patient profile");
        }
        const profileData = await profileResponse.json();

        const imageResponse = await fetch(
          `${import.meta.env.VITE_API}/profile/${id}/image`
        );
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch profile image");
        }
        const imageData = await imageResponse.json();

        const medicalHistoryResponse = await fetch(
          `https://mental-care-server-nodenet.onrender.com/api/medical-histories/patient/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!medicalHistoryResponse.ok) {
          throw new Error("Failed to fetch medical history");
        }
        const medicalHistoryData = await medicalHistoryResponse.json();

        const medicalRecordsResponse = await fetch(
          `https://mental-care-server-nodenet.onrender.com/api/medical-records/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!medicalRecordsResponse.ok) {
          throw new Error("Failed to fetch medical records");
        }
        const medicalRecordsData = await medicalRecordsResponse.json();

        const mappedCustomer = {
          fullName: profileData.FullName || "Unknown Name",
          gender: profileData.Gender || "Other",
          userId: profileData.UserId || "N/A",
          contactInfo: {
            phoneNumber: profileData.PhoneNumber || "N/A",
            email: profileData.Email || "N/A",
            address: profileData.Address || "N/A",
          },
          medicalHistory: medicalHistoryData.length > 0
            ? {
              diagnosedAt:
                medicalHistoryData[0].DiagnosedAt ||
                medicalHistoryData[0].CreatedAt ||
                "N/A",
              specificMentalDisorders:
                medicalHistoryData[0].MedicalHistorySpecificMentalDisorder?.map(
                  (disorder, index) => ({
                    id: index + 1,
                    name: disorder.MentalDisorders.Name,
                    description: disorder.MentalDisorders.Description,
                  })
                ) || [],
              physicalSymptoms:
                medicalHistoryData[0].MedicalHistoryPhysicalSymptom?.map(
                  (symptom, index) => ({
                    id: index + 1,
                    name: symptom.PhysicalSymptoms.Name,
                    description: symptom.PhysicalSymptoms.Description,
                  })
                ) || [],
              allergies: profileData.Allergies || "N/A",
            }
            : {
              diagnosedAt: "N/A",
              specificMentalDisorders: [],
              physicalSymptoms: [],
              allergies: profileData.Allergies || "N/A",
            },
          medicalRecords: medicalRecordsData.map((record, index) => ({
            id: index + 1,
            notes: record.Description || "No notes available",
            status: record.LastModified ? "Completed" : "Processing",
            createdAt: record.CreatedAt || "N/A",
            specificMentalDisorders:
              record.MedicalRecordSpecificMentalDisorder?.map((disorder, index) => ({
                id: index + 1,
                name: disorder.MentalDisorders.Name,
                description: disorder.MentalDisorders.Description,
              })) || [],
          })),
        };

        setCustomer(mappedCustomer);
        setProfileImage(
          imageData.data.publicUrl ||
          "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
        );
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-2xl font-semibold bg-red-50">
        Error: {error}
      </div>
    );
  if (!customer)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-2xl font-semibold bg-gray-50">
        Customer not found
      </div>
    );

  const genderStyles = {
    Male: {
      bg: "bg-[#e4c1f9]",
      border: "border-[#e4c1f9]/50",
      text: "text-[#6a4c93]",
      gradient: "from-[#e4c1f9] to-[#6a4c93]",
    },
    Female: {
      bg: "bg-[#faf3e0]",
      border: "border-[#faf3e0]/50",
      text: "text-[#6a4c93]",
      gradient: "from-[#faf3e0] to-[#e4c1f9]",
    },
    Other: {
      bg: "bg-[#6a4c93]",
      border: "border-[#6a4c93]/50",
      text: "text-[#faf3e0]",
      gradient: "from-[#6a4c93] to-[#e4c1f9]",
    },
  };
  const genderStyle = genderStyles[customer.gender] || genderStyles.Other;

  return (
    <motion.div
      className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#e4c1f9]/20"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`relative h-40 bg-gradient-to-br ${genderStyle.gradient}`}
            >
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="white" opacity="0.2" />
                  <path
                    d="M20 80 Q50 20 80 80"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              </div>
              <motion.img
                src={profileImage}
                alt={customer.fullName}
                className="w-32 h-32 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 border-4 border-white shadow-md object-cover"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <div className="pt-20 pb-6 px-4 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 bg-gradient-to-r from-[#6a4c93] to-[#e4c1f9] bg-clip-text text-transparent">
                {customer.fullName}
              </h2>

              <motion.div
                className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium shadow-sm border ${customer.gender === "Male"
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : customer.gender === "Female"
                    ? "bg-pink-50 text-pink-800 border-pink-300"
                    : "text-blue-800 border-blue-300 animate-gender-other"
                  }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                {customer.gender}
              </motion.div>

              <div className="mt-5 space-y-3">
                {[
                  { icon: FaPhone, color: "text-green-500", text: customer.contactInfo?.phoneNumber || "N/A" },
                  { icon: FaEnvelope, color: "text-red-500", text: customer.contactInfo?.email || "N/A" },
                  { icon: FaMapMarkerAlt, color: "text-orange-500", text: customer.contactInfo?.address || "N/A" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-center gap-2 text-gray-700"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    <item.icon className={`${item.color} text-base`} />
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex justify-center gap-3">
                <motion.button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${activeTab === "profile"
                    ? "bg-[#6a4c93] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Profile
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${activeTab === "history"
                    ? "bg-[#6a4c93] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  History
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-3 space-y-6">
            {activeTab === "profile" ? (
              <>
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-5 border border-[#e4c1f9]/20"
                  whileHover={{ scale: 1.01, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}
                >
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-[#6a4c93] to-[#e4c1f9] bg-clip-text text-red-500 flex items-center gap-2 mb-4">
                    <FaHeartbeat className="text-red-500" /> Medical History
                  </h3>
                  {customer.medicalHistory ? (
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-blue-800  p-3 rounded-lg">
                        <FaCalendarAlt className="text-blue-800" />
                        <span className="font-medium">
                          Diagnosed:{" "
                          }{customer.medicalHistory.diagnosedAt !== "N/A"
                            ? new Date(customer.medicalHistory.diagnosedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </p>
                      <div className="grid gap-3">
                        <div className="bg-[#e4c1f9]/20 p-4 rounded-lg">
                          <p className="font-medium text-red-500 mb-2">
                            Mental Disorders:
                          </p>
                          {customer.medicalHistory.specificMentalDisorders?.length > 0 ? (
                            customer.medicalHistory.specificMentalDisorders.map((disorder) => (
                              <motion.div
                                key={disorder.id}
                                className="flex items-start gap-2 mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaBrain className="text-red-500 mt-1" />
                                <span className="">
                                  <strong>{disorder.name}:</strong> {disorder.description}
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <p className="text-gray-600">No mental disorders recorded.</p>
                          )}
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="font-medium text-blue-600 mb-2">
                            Physical Symptoms:
                          </p>
                          {customer.medicalHistory.physicalSymptoms?.length > 0 ? (
                            customer.medicalHistory.physicalSymptoms.map((symptom) => (
                              <motion.div
                                key={symptom.id}
                                className="flex items-start gap-2 mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaHeartbeat className="text-blue-600 mt-1" />
                                <span className="">
                                  <strong>{symptom.name}:</strong> {symptom.description}
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <p className="text-gray-600">No physical symptoms recorded.</p>
                          )}
                        </div>

                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No medical history available.</p>
                  )}
                </motion.div>

                <motion.div
                  className="bg-white rounded-xl shadow-lg p-6 border border-[#e4c1f9]/20"
                  whileHover={{ scale: 1.01, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}
                >
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-[#6a4c93] to-[#e4c1f9] bg-clip-text text-blue-500 flex items-center gap-2 mb-4">
                    <FaHistory className="text-blue-500" /> Medical Records
                  </h3>
                  <div className="space-y-4">
                    {customer.medicalRecords?.length > 0 ? (
                      customer.medicalRecords.map((record) => (
                        <motion.div
                          key={record.id}
                          className="bg-[#faf3e0]/20 p-4 rounded-lg border border-[#e4c1f9]/10"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="flex items-center gap-2 text-gray-800 mb-2">
                            <FaNotesMedical className="text-[#6a4c93]" />
                            <span className="font-medium">
                              <strong>Notes:</strong> {record.notes}
                            </span>
                          </p>
                          <p className="flex items-center gap-2 text-gray-800 mb-2">
                            <FaHeartbeat
                              className={`text-${record.status === "Processing" ? "#e4c1f9" : "#6a4c93"}`}
                            />
                            <span className="font-medium">
                              <strong>Status: </strong>
                              <span
                                className={`text-${record.status === "Processing" ? "#e4c1f9" : "#6a4c93"}`}
                              >
                                {record.status}
                              </span>
                            </span>
                          </p>
                          <p className="flex items-center gap-2 text-gray-800">
                            <FaCalendarAlt className="text-[#6a4c93]" />
                            <span className="font-medium">
                              Created:{" "
                              }{record.createdAt !== "N/A"
                                ? new Date(record.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </p>
                          {record.specificMentalDisorders?.length > 0 && (
                            <div className="mt-3 bg-[#e4c1f9]/20 p-3 rounded-lg">
                              <p className="font-medium text-red-500 mb-1">
                                Disorders:
                              </p>
                              {record.specificMentalDisorders.map((disorder) => (
                                <div key={disorder.id} className="flex items-start gap-2 mb-1">
                                  <FaBrain className="text-red-500 mt-0.5" />
                                  <span className="text-red-600">
                                    <strong>{disorder.name}:</strong> {disorder.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-600">No medical records available.</p>
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 border border-[#e4c1f9]/20"
                whileHover={{ scale: 1.01, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}
              >
                <h3 className="text-xl font-semibold bg-gradient-to-r from-[#6a4c93] to-[#e4c1f9] bg-clip-text text-transparent flex items-center gap-2 mb-4">
                  <FaHistory className="text-[#6a4c93]" /> Patient History
                </h3>
                <HistoryPatient />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerDetail;