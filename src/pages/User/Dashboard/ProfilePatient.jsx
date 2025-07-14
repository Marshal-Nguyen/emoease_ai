import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaUser, FaTrash } from "react-icons/fa";

const EditProfileForm = () => {
  const profileId = localStorage.getItem("profileId") || "123";
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
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
  const [medicalHistory, setMedicalHistory] = useState({
    description: "Cập nhật lịch sử y tế cho bệnh nhân",
    physicalSymptoms: [
      { name: "Đau đầu", description: "Đau đầu nhẹ kéo dài 2 ngày" },
      { name: "Sốt", description: "Sốt nhẹ vào buổi tối" },
    ],
    specificMentalDisorders: [{ name: "Lo âu", description: "Rối loạn lo âu tổng quát" }],
  });
  const [medicalHistoryLoading, setMedicalHistoryLoading] = useState(false);
  const [medicalHistoryError, setMedicalHistoryError] = useState(null);
  const [medicalHistorySaving, setMedicalHistorySaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setMedicalHistoryLoading(true);
        const [profileResponse, avatarResponse, medicalResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API}/patient-profiles/${profileId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get(`${import.meta.env.VITE_API}/profile/${profileId}/image`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get(`http://localhost:3000/api/medical-histories/patient/${profileId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        setFormData({
          FullName: profileResponse.data.FullName || "",
          Gender: profileResponse.data.Gender || "",
          Allergies: profileResponse.data.Allergies || "",
          PersonalityTraits: profileResponse.data.PersonalityTraits || "",
          Address: profileResponse.data.Address || "",
          Email: profileResponse.data.Email || "",
          PhoneNumber: profileResponse.data.PhoneNumber || "",
          recommendedActivities: profileResponse.data.recommendedActivities || [],
        });
        setAvatarUrl(avatarResponse.data.data.publicUrl || null);
        const medicalData = medicalResponse.data[0] || {};
        setMedicalHistory({
          description: medicalData.Description || "Cập nhật lịch sử y tế cho bệnh nhân",
          physicalSymptoms: medicalData.MedicalHistoryPhysicalSymptom?.map((s) => ({
            name: s.PhysicalSymptoms.Name,
            description: s.PhysicalSymptoms.Description,
          })) || [
              { name: "Đau đầu", description: "Đau đầu nhẹ kéo dài 2 ngày" },
              { name: "Sốt", description: "Sốt nhẹ vào buổi tối" },
            ],
          specificMentalDisorders: medicalData.MedicalHistorySpecificMentalDisorder?.map((d) => ({
            name: d.SpecificMentalDisorders.Name,
            description: d.SpecificMentalDisorders.Description,
          })) || [{ name: "Lo âu", description: "Rối loạn lo âu tổng quát" }],
        });
      } catch (err) {
        setError("Error fetching patient data.");
        setMedicalHistoryError("Error fetching medical history.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
        setMedicalHistoryLoading(false);
      }
    };
    fetchData();
  }, [profileId]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) {
      toast.error("Image must be < 5MB");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in!");
      return;
    }

    setAvatarLoading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
      const formData = new FormData();
      formData.append("image", file);
      await axios({
        method: avatarUrl ? "PUT" : "POST",
        url: `${import.meta.env.VITE_API}/profile/${profileId}/${avatarUrl ? "update" : "upload"}?token=${token}`,
        data: formData,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      toast.success(`Profile picture ${avatarUrl ? "updated" : "uploaded"}!`);
    } catch (err) {
      toast.error(`Error ${avatarUrl ? "updating" : "uploading"} picture!`);
      console.error("Avatar error:", err.response?.data || err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Delete picture?")) return;
    setAvatarLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API}/profile/${profileId}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAvatarUrl(null);
      toast.success("Picture deleted!");
    } catch (err) {
      toast.error("Error deleting picture!");
      console.error("Delete error:", err.response?.data || err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMedicalHistoryChange = (e, section, index) => {
    const { name, value } = e.target;
    setMedicalHistory((prev) => {
      if (section === "description") return { ...prev, description: value };
      if (section === "physicalSymptoms") {
        const updatedSymptoms = [...prev.physicalSymptoms];
        updatedSymptoms[index] = { ...updatedSymptoms[index], [name]: value };
        return { ...prev, physicalSymptoms: updatedSymptoms };
      }
      if (section === "specificMentalDisorders") {
        const updatedDisorders = [...prev.specificMentalDisorders];
        updatedDisorders[index] = { ...updatedDisorders[index], [name]: value };
        return { ...prev, specificMentalDisorders: updatedDisorders };
      }
      return prev;
    });
  };

  const handleMedicalHistorySave = async () => {
    setMedicalHistorySaving(true);
    try {
      const payload = {
        description: medicalHistory.description,
        diagnosedAt: "2025-07-13",
        lastModifiedBy: "Nguyễn Như Tài",
        physicalSymptoms: medicalHistory.physicalSymptoms,
        specificMentalDisorders: medicalHistory.specificMentalDisorders,
      };
      await axios.put(
        `http://localhost:3000/api/medical-histories/patient/${profileId}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
      );
      toast.success("Medical history saved!");
    } catch (err) {
      toast.error("Error saving medical history!");
      console.error("Save error:", err.response?.data || err.message);
    } finally {
      setMedicalHistorySaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API}/patient-profiles/${profileId}`,
        {
          FullName: formData.FullName,
          Gender: formData.Gender,
          Allergies: formData.Allergies,
          PersonalityTraits: formData.PersonalityTraits,
          Address: formData.Address,
          Email: formData.Email,
          PhoneNumber: formData.PhoneNumber,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
      );
      toast.success("Profile updated!");
    } catch (err) {
      setError("Error updating profile.");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-10">
      <div className="animate-spin h-10 w-10 border-2 border-purple-500 rounded-full mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading...</p>
    </div>
  );
  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 h-[94vh] bg-[#f6e8ff] rounded-2xl">
      <div className="h-full overflow-y-auto p-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <div
                  className="w-full h-full rounded-full bg-gray-200 border-4 border-purple-200 shadow-lg cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <FaUser className="h-20 w-20" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-transform hover:scale-110"
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
              <p className="mt-4 text-sm text-gray-500">Click to {avatarUrl ? "change" : "upload"} picture</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF (max. 5MB)</p>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="px-3 py-2 mt-1">{formData.Email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="Address"
                  value={formData.Address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Psychology Profile</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personality Traits</label>
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
                  <option value=" Agreeableness"> Agreeableness</option>
                  <option value="Openness">Openness</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
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
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Medical History</h2>
            {medicalHistoryLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading...</p>
              </div>
            ) : medicalHistoryError ? (
              <div className="text-center p-4 text-red-500">{medicalHistoryError}</div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
                  <input
                    type="text"
                    value={medicalHistory.description}
                    onChange={(e) => handleMedicalHistoryChange(e, "description")}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="rounded-lg p-4 shadow-sm border-2 border-blue-200">
                  <h3 className="text-sm font-medium text-blue-700 mb-4">Physical Symptoms</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalHistory.physicalSymptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg shadow-sm"
                        style={{ backgroundColor: `hsl(${170 + index * 10}, 30%, 95%)` }}
                      >
                        <input
                          type="text"
                          name="name"
                          value={symptom.name}
                          onChange={(e) => handleMedicalHistoryChange(e, "physicalSymptoms", index)}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-800 border border-gray-200 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                          placeholder="Symptom name"
                        />
                        <input
                          type="text"
                          name="description"
                          value={symptom.description}
                          onChange={(e) => handleMedicalHistoryChange(e, "physicalSymptoms", index)}
                          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                          placeholder="Symptom description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-4 shadow-sm border-2 border-pink-200">
                  <h3 className="text-sm font-medium text-pink-700 mb-4">Mental Disorders</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalHistory.specificMentalDisorders.map((disorder, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg shadow-sm"
                        style={{ backgroundColor: `hsl(${260 + index * 10}, 30%, 95%)` }}
                      >
                        <input
                          type="text"
                          name="name"
                          value={disorder.name}
                          onChange={(e) => handleMedicalHistoryChange(e, "specificMentalDisorders", index)}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-800 border border-gray-200 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                          placeholder="Disorder name"
                        />
                        <input
                          type="text"
                          name="description"
                          value={disorder.description}
                          onChange={(e) => handleMedicalHistoryChange(e, "specificMentalDisorders", index)}
                          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300"
                          placeholder="Disorder description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleMedicalHistorySave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    disabled={medicalHistorySaving}
                  >
                    {medicalHistorySaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
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