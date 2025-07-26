import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { createClient } from "@supabase/supabase-js";
import { FaUser, FaCamera, FaTrash } from "react-icons/fa";

const ProfileDoctor = () => {
  const id = localStorage.getItem("profileId");
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [formData, setFormData] = useState({
    FullName: "",
    Gender: "",
    contactInfo: { Address: "", PhoneNumber: "", Email: "" },
    specialties: [],
    Qualifications: "",
    YearsOfExperience: 0,
    Bio: "",
    Status: "",
  });

  const VITE_API_PROFILE_URL = import.meta.env.VITE_API;
  const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Fetch data when the page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch profile image
        const avatarResponse = await axios.get(
          `${VITE_API_PROFILE_URL}/profile/${id}/image`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAvatarUrl(avatarResponse.data.data.publicUrl || null);

        // Fetch doctor profile data
        const doctorResponse = await axios.get(
          `${VITE_API_PROFILE_URL}/doctor-profiles/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const doctorProfile = doctorResponse.data;
        setFormData({
          FullName: doctorProfile.FullName || "",
          Gender: doctorProfile.Gender || "",
          contactInfo: {
            Address: doctorProfile.Address || "",
            PhoneNumber: doctorProfile.PhoneNumber || "",
            Email: doctorProfile.Email || "",
          },
          specialties: doctorProfile.specialties?.map((s) => s.Id) || [],
          Qualifications: doctorProfile.Qualifications || "",
          YearsOfExperience: doctorProfile.YearsOfExperience || 0,
          Bio: doctorProfile.Bio || "",
          Status: doctorProfile.Status || "",
        });

        // Fetch specialties list
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
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle contact info changes
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value },
    }));
  };

  // Handle specialty selection
  const handleSpecialtyChange = (e) => {
    const specialtyId = e.target.value;
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      specialties: isChecked
        ? [...prev.specialties, specialtyId]
        : prev.specialties.filter((id) => id !== specialtyId),
    }));
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token not found. Please log in again!");
      return;
    }

    setAvatarLoading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      const formData = new FormData();
      formData.append("image", file);

      const isUpdate = !!avatarUrl;
      const response = await axios({
        method: isUpdate ? "PUT" : "POST",
        url: `${VITE_API_PROFILE_URL}/profile/${id}/${
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
      console.error(
        "Avatar processing error:",
        err.response?.data || err.message || err
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the profile picture?"))
      return;

    setAvatarLoading(true);
    try {
      await axios.delete(`${VITE_API_PROFILE_URL}/profile/${id}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAvatarUrl(null);
      toast.success("Profile picture deleted successfully!");
    } catch (err) {
      toast.error("Error deleting profile picture!");
      console.error(
        "Avatar deletion error:",
        err.response?.data || err.message
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const updatedProfile = {
        FullName: formData.FullName,
        Gender: formData.Gender,
        Address: formData.contactInfo.Address,
        PhoneNumber: formData.contactInfo.PhoneNumber,
        Email: formData.contactInfo.Email,
        Qualifications: formData.Qualifications,
        YearsOfExperience: parseInt(formData.YearsOfExperience),
        Bio: formData.Bio,
        Status: formData.Status,
        specialties: formData.specialties.map((id) => ({ Id: id })),
      };

      await axios.put(
        `${VITE_API_PROFILE_URL}/doctor-profiles/${id}`,
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

  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );

  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl h-[94vh] mx-auto p-6">
      <div className="h-full overflow-y-auto p-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mx-auto">
                <div
                  className="w-full h-full rounded-full bg-gray-200 border-4 border-purple-200 shadow-lg"
                  onClick={() => fileInputRef.current.click()}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile picture"
                      className="w-full h-full object-cover object-center rounded-full cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 rounded-full cursor-pointer">
                      <FaUser className="h-20 w-20" />
                    </div>
                  )}
                </div>

                {/* Delete button outside the circle */}
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  className="absolute bottom-0 right-18 translate-x-1/3 translate-y-1/3 z-50 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-110 transition duration-200"
                >
                  <FaTrash className="h-4 w-4" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                />
              </div>

              <p className="mt-4 text-sm text-gray-500 font-medium">
                Click on the image to {avatarUrl ? "change" : "upload"} profile
                picture
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <span className="px-3 py-2 text-gray-600">
                  {formData.contactInfo.Email}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.contactInfo.PhoneNumber}
                  onChange={handleContactInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="Address"
                  value={formData.contactInfo.Address}
                  onChange={handleContactInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualifications
                </label>
                <input
                  type="text"
                  name="Qualifications"
                  value={formData.Qualifications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., MD, PhD in Psychology"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="YearsOfExperience"
                  value={formData.YearsOfExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biography
                </label>
                <textarea
                  name="Bio"
                  value={formData.Bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  placeholder="Brief description of experience and expertise"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">
              Specialties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specialtiesList.map((specialty) => (
                <div key={specialty.Id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`specialty-${specialty.Id}`}
                    value={specialty.Id}
                    checked={formData.specialties.includes(specialty.Id)}
                    onChange={handleSpecialtyChange}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileDoctor;
