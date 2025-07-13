import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaUser, FaCamera, FaTrash } from "react-icons/fa";

const EditProfileForm = () => {
  const profileId = localStorage.getItem("profileId") || "123"; // Lấy profileId từ localStorage, fallback là "123"
  const userId = localStorage.getItem("userId") || "456"; // Lấy userId từ localStorage, fallback là "456"
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null); // Default avatar
  const [formData, setFormData] = useState({
    FullName: "",
    Gender: "",
    Allergies: "",
    PersonalityTraits: "",
    Address: "",
    Email: "",
    PhoneNumber: "",
    recommendedActivities: [],
  });

  // Fetch patient data from API
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API}/patient-profiles/${profileId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const patientProfileDto = response.data;

        // Set form data with patient information
        setFormData({
          FullName: patientProfileDto.FullName || "",
          Gender: patientProfileDto.Gender || "",
          Allergies: patientProfileDto.Allergies || "",
          PersonalityTraits: patientProfileDto.PersonalityTraits || "",
          Address: patientProfileDto.Address || "",
          Email: patientProfileDto.Email || "",
          PhoneNumber: patientProfileDto.PhoneNumber || "",
          recommendedActivities: patientProfileDto.recommendedActivities || [],
        });

        // Fetch avatar
        const avatarResponse = await axios.get(
          `${import.meta.env.VITE_API}/profile/${profileId}/image`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAvatarUrl(avatarResponse.data.data.publicUrl || null);

        setLoading(false);
      } catch (err) {
        setError("Error fetching patient data. Please try again.");
        setLoading(false);
        console.error("Error fetching patient data:", err);
      }
    };

    fetchPatientData();
  }, [profileId]);

  // Handle uploading or updating avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
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
        url: `${import.meta.env.VITE_API}/profile/${profileId}/${
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
        "Error updating avatar:",
        err.response?.data || err.message || err
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle deleting avatar
  const handleAvatarDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the profile picture?"))
      return;

    setAvatarLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API}/profile/${profileId}/delete`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAvatarUrl(null);
      toast.success("Profile picture deleted successfully!");
    } catch (err) {
      toast.error("Error deleting profile picture!");
      console.error(
        "Error deleting avatar:",
        err.response?.data || err.message
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission to update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create the payload to match the expected API structure
      const updatedProfile = {
        FullName: formData.FullName,
        Gender: formData.Gender,
        Allergies: formData.Allergies,
        PersonalityTraits: formData.PersonalityTraits,
        Address: formData.Address,
        Email: formData.Email,
        PhoneNumber: formData.PhoneNumber,
      };

      await axios.put(
        `${import.meta.env.VITE_API}/patient-profiles/${profileId}`,
        updatedProfile,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setLoading(false);
      toast.success("Patient profile updated successfully!");
    } catch (err) {
      setError("Error updating patient data. Please try again.");
      setLoading(false);
      console.error("Error updating patient data:", err);
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
    <div className="max-w-7xl mx-auto p-8 h-[94vh] bg-[#f6e8ff] rounded-2xl">
      <div className="h-full overflow-y-auto p-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
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
                      alt="Profile"
                      className="w-full h-full object-cover object-center rounded-full cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 rounded-full cursor-pointer">
                      <FaUser className="h-20 w-20" />
                    </div>
                  )}
                </div>
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
                Click to {avatarUrl ? "change" : "upload"} profile picture
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, GIF (max. 5MB)
              </p>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email:
                </label>
                <p className="px-3 py-2 mt-1">{formData.Email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number:
                </label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address:
                </label>
                <textarea
                  name="Address"
                  value={formData.Address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Psychology Profile</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personality Traits
                </label>
                <select
                  name="PersonalityTraits"
                  value={formData.PersonalityTraits}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Personality Trait</option>
                  <option value="Introversion">Introversion</option>
                  <option value="Extroversion">Extroversion</option>
                  <option value="Ambiversion">Ambiversion</option>
                  <option value="Neuroticism">Neuroticism</option>
                  <option value="Conscientiousness">Conscientiousness</option>
                  <option value="Agreeableness"> Agreeableness</option>
                  <option value="Openness">Openness</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  name="Allergies"
                  value={formData.Allergies}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="List any Allergies or enter 'None'"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#9284e0] to-[#5849b1] text-white rounded-md hover:bg-blue-700"
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

export default EditProfileForm;
