import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HistoryDoctor from "./HistoryDoctor";

// Mock data for fallback
const mockDoctorData = {
  fullName: "Dr. John Doe",
  gender: "Male",
  address: "123 Main St, City",
  phoneNumber: "+1234567890",
  email: "john.doe@example.com",
  specialties: [1, 2],
  qualifications: "MD, PhD",
  yearsOfExperience: 10,
  bio: "Experienced doctor specializing in internal medicine.",
};

const mockSpecialties = [
  { Id: 1, Name: "Internal Medicine" },
  { Id: 2, Name: "Cardiology" },
];

const ProfileDoctor = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    address: "",
    phoneNumber: "",
    email: "",
    specialties: [],
    qualifications: "",
    yearsOfExperience: 0,
    bio: "",
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const API_URL = "https://mental-care-server-nodenet.onrender.com";

  // Helper to get cached data from localStorage
  const getCachedData = (key, defaultData) =>
    JSON.parse(localStorage.getItem(key)) || defaultData;

  // Helper to set cached data to localStorage
  const setCachedData = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

  // Fetch doctor's avatar
  const fetchAvatar = async (doctorId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/profile/${doctorId}/image`
      );
      const url = response.data.data.publicUrl;
      setAvatarUrl(url);
      setCachedData(`avatar_${doctorId}`, url);
    } catch (err) {
      console.error("Error fetching avatar:", err.message);
      setAvatarUrl(getCachedData(`avatar_${doctorId}`, null));
    }
  };

  // Fetch doctor data and specialties
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/doctor-profiles/${userId}`
        );
        const data = response.data;
        const doctorId = data.Id;
        setFormData({
          fullName: data.FullName || mockDoctorData.fullName,
          gender: data.Gender || mockDoctorData.gender,
          address: data.Address || mockDoctorData.address,
          phoneNumber: data.PhoneNumber || mockDoctorData.phoneNumber,
          email: data.Email || mockDoctorData.email,
          specialties:
            data.specialties?.map((s) => s.Id) || mockDoctorData.specialties,
          qualifications: data.Qualifications || mockDoctorData.qualifications,
          yearsOfExperience:
            data.YearsOfExperience || mockDoctorData.yearsOfExperience,
          bio: data.Bio || mockDoctorData.bio,
        });
        setCachedData(`doctor_${userId}`, data);
        await fetchAvatar(doctorId);
      } catch (err) {
        console.error("Error fetching doctor data:", err.message);
        setError("Unable to load doctor information, displaying default data.");
        setFormData(getCachedData(`doctor_${userId}`, mockDoctorData));
        setAvatarUrl(getCachedData(`avatar_${userId}`, null));
      } finally {
        setLoading(false);
      }
    };

    const fetchSpecialties = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/specialties`);
        setSpecialtiesList(response.data);
        setCachedData("specialties", response.data);
      } catch (err) {
        console.error("Error fetching specialties:", err.message);
        toast.error("Unable to load specialties, displaying default data.");
        setSpecialtiesList(getCachedData("specialties", mockSpecialties));
      }
    };

    fetchDoctorData();
    fetchSpecialties();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <p className="text-gray-700">
            Default data is displayed due to API connection error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Avatar Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-purple-200 shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Picture"
                  className="w-full h-full object-cover object-center rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <svg
                    className="h-20 w-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-4 text-lg font-medium text-gray-700">
              {formData.fullName}
            </p>
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Full Name
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.fullName}
                  </p>
                </div>
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Gender
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.gender || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Professional Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Qualifications
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.qualifications}
                  </p>
                </div>
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Years of Experience
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.yearsOfExperience} years
                  </p>
                </div>
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Bio
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Specialties
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {specialtiesList
                  .filter((specialty) =>
                    formData.specialties.includes(specialty.Id)
                  )
                  .map((specialty) => (
                    <p key={specialty.Id} className="text-gray-900">
                      {specialty.Name}
                    </p>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Email
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.email}
                  </p>
                </div>
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Phone Number
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.phoneNumber}
                  </p>
                </div>
                <div className="flex items-center">
                  <label className="text-sm font-semibold text-black">
                    Address
                  </label>
                  <p className="ml-2 text-gray-900 font-normal">
                    : {formData.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <HistoryDoctor userId={userId} />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/manager/viewDoctor")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDoctor;
