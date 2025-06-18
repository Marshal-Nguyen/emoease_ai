import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const EditProfileForm = () => {
  const profileId = localStorage.getItem("profileId") || "123"; // Lấy profileId từ localStorage, fallback là "123"
  const userId = localStorage.getItem("userId") || "456"; // Lấy userId từ localStorage, fallback là "456"
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("physical");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://via.placeholder.com/150"); // Default avatar
  const fileInputRef = useRef(null);
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
          `http://localhost:3000/api/patient-profiles/${profileId}`,
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
        setLoading(false);
      } catch (err) {
        setError("Error fetching patient data. Please try again.");
        setLoading(false);
        console.error("Error fetching patient data:", err);
      }
    };

    fetchPatientData();
  }, [profileId]);

  // Handle uploading or updating avatar (giả lập vì không có API ảnh)
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setAvatarLoading(true);
      const fakeAvatarUrl = URL.createObjectURL(file); // Giả lập upload ảnh
      setAvatarUrl(fakeAvatarUrl);
      toast.success("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating avatar:", err);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
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
        `http://localhost:3000/api/patient-profiles/${profileId}`,
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
                  className="absolute bottom-2 right-2 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none transform hover:scale-110 transition-transform duration-200"
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
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg, image/png, image/gif"
                className="hidden"
              />
              <p className="mt-4 text-sm text-gray-500 font-medium">
                Click to {avatarUrl ? "change" : "upload"} profile picture
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG (max. 5MB)
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
                <p className="px-3 py-2  mt-1">
                  {formData.Email}
                </p>
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
                  <option value="Agreeableness">Agreeableness</option>
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