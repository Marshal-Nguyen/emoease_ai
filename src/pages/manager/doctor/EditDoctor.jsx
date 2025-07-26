import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { createClient } from "@supabase/supabase-js";

const ProfileDoctor = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    contactInfo: { address: "", phoneNumber: "", email: "" },
    specialties: [],
    qualifications: "",
    yearsOfExperience: 0,
    bio: "",
    price: 0,
  });

  const VITE_API_PROFILE_URL = import.meta.env.VITE_API;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch avatar
        const avatarResponse = await axios.get(
          `${VITE_API_PROFILE_URL}/profile/${userId}/image`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAvatarUrl(avatarResponse.data.data.publicUrl || null);

        // Fetch doctor profile
        const doctorResponse = await axios.get(
          `${VITE_API_PROFILE_URL}/doctor-profiles/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const doctorProfile = doctorResponse.data;
        setFormData({
          fullName: doctorProfile.FullName || "",
          gender: doctorProfile.Gender || "",
          contactInfo: {
            address: doctorProfile.Address || "",
            phoneNumber: doctorProfile.PhoneNumber || "",
            email: doctorProfile.Email || "",
          },
          specialties: doctorProfile.specialties?.map((s) => s.Id) || [],
          qualifications: doctorProfile.Qualifications || "",
          yearsOfExperience: doctorProfile.YearsOfExperience || 0,
          bio: doctorProfile.Bio || "",
          price: doctorProfile.Price || 0,
        });

        // Fetch specialties
        const specialtiesResponse = await axios.get(
          `${VITE_API_PROFILE_URL}/specialties`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSpecialtiesList(specialtiesResponse.data);
      } catch (err) {
        setError("Error fetching data. Please try again.");
        console.error("Fetch error:", err);
        // Fallback specialties
        setSpecialtiesList([
          {
            Id: "4064c495-80af-4f54-8bd2-151cebf029a6",
            Name: "Addiction Therapy",
          },
          {
            Id: "cac4f120-834f-41f8-859d-dd1de7883609",
            Name: "Child Psychology",
          },
          {
            Id: "8704cf2c-e7ec-4ece-a057-883653578ae6",
            Name: "Behavioral Therapy",
          },
          { Id: "ddf4b47a-65d1-451f-a297-41606caacfe2", Name: "Neurology" },
          {
            Id: "e09aa07d-6313-4e21-919c-f17f3497b6ff",
            Name: "Clinical Psychology",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please log in again!");
      return;
    }

    try {
      setAvatarLoading(true);
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      const formData = new FormData();
      formData.append("image", file);

      const isUpdate = !!avatarUrl;
      await axios({
        method: isUpdate ? "PUT" : "POST",
        url: `${VITE_API_PROFILE_URL}/profile/${userId}/${
          isUpdate ? "update" : "upload"
        }?token=${token}`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Profile picture ${isUpdate ? "updated" : "uploaded"} successfully!`
      );
    } catch (err) {
      toast.error(
        `Error ${avatarUrl ? "updating" : "uploading"} profile picture!`
      );
      console.error("Avatar error:", err.response?.data || err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the profile picture?"))
      return;

    try {
      setAvatarLoading(true);
      await axios.delete(`${VITE_API_PROFILE_URL}/profile/${userId}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAvatarUrl(null);
      toast.success("Profile picture deleted successfully!");
    } catch (err) {
      toast.error("Error deleting profile picture!");
      console.error("Delete avatar error:", err.response?.data || err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      contactInfo: { ...formData.contactInfo, [name]: value },
    });
  };

  const handleSpecialtyChange = (e) => {
    const specialtyId = e.target.value;
    const isChecked = e.target.checked;
    setFormData({
      ...formData,
      specialties: isChecked
        ? [...formData.specialties, specialtyId]
        : formData.specialties.filter((id) => id !== specialtyId),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = {
        FullName: formData.fullName,
        Gender: formData.gender,
        Address: formData.contactInfo.address,
        PhoneNumber: formData.contactInfo.phoneNumber,
        Email: formData.contactInfo.email,
        Qualifications: formData.qualifications,
        YearsOfExperience: parseInt(formData.yearsOfExperience),
        Bio: formData.bio,
        specialties: formData.specialties.map((id) => ({ Id: id })),
        Price: parseFloat(formData.price),
      };

      await axios.put(
        `${VITE_API_PROFILE_URL}/doctor-profiles/${userId}`,
        updatedProfile,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Doctor profile updated successfully!");
    } catch (err) {
      toast.error("Error updating doctor profile!");
      console.error("Update error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-red-600 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-purple-200 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20"
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
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                {/* {avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={handleAvatarDelete}
                                        className="absolute bottom-2 left-2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )} */}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
              <p className="mt-4 text-sm text-gray-500 font-medium">
                Click to {avatarUrl ? "change" : "upload"} profile picture
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, GIF (max. 5MB)
              </p>
            </div>
          </div>

          {/* Two-column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Personal Information */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Qualifications
                    </label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., MD, PhD in Psychology"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      max="70"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Booking fee
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="4"
                      placeholder="Brief description of your experience"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Specialties */}
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
                  {specialtiesList.map((specialty) => (
                    <div key={specialty.Id} className="flex items-center my-1">
                      <input
                        type="checkbox"
                        id={`specialty-${specialty.Id}`}
                        value={specialty.Id}
                        checked={formData.specialties.includes(specialty.Id)}
                        onChange={handleSpecialtyChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`specialty-${specialty.Id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {specialty.Name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      // required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.contactInfo.phoneNumber}
                      onChange={handleContactInfoChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      // required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.contactInfo.address}
                      onChange={handleContactInfoChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      // required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/manager/viewDoctor`)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileDoctor;
