import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaUser, FaTrash } from "react-icons/fa";

const EditProfileForm = () => {
  const profileId = localStorage.getItem("profileId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [state, setState] = useState({
    loading: true,
    error: null,
    avatarLoading: false,
    avatarUrl: null,
    medicalHistoryLoading: false,
    medicalHistoryError: null,
    medicalHistorySaving: false,
    formData: {
      FullName: "",
      Gender: "",
      BirthDate: "",
      Allergies: "",
      PersonalityTraits: "",
      Address: "",
      Email: "",
      PhoneNumber: "",
    },
    medicalHistory: {
      description: "",
      physicalSymptoms: [],
      mentalDisorders: [],
    },
  });

  const genderOptions = ["Male", "Female", "Other"];
  const personalityOptions = [
    "Introversion",
    "Extroversion",
    "Ambiversion",
    "Neuroticism",
    "Conscientiousness",
    "Agreeableness",
    "Openness",
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!profileId || !token) {
        setState((prev) => ({
          ...prev,
          error: "Please log in to access your profile.",
          loading: false,
        }));
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          medicalHistoryLoading: true,
        }));

        const [profileResponse, avatarResponse, medicalResponse] =
          await Promise.all([
            axios.get(
              `${import.meta.env.VITE_API}/patient-profiles/${profileId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios
              .get(`${import.meta.env.VITE_API}/profile/${profileId}/image`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: { publicUrl: null } })),
            axios
              .get(
                `https://mental-care-server-nodenet.onrender.com/api/medical-histories/patient/${profileId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              .catch(() => ({ data: [] })),
          ]);

        setState((prev) => ({
          ...prev,
          formData: {
            FullName: profileResponse.data.FullName || "",
            Gender: profileResponse.data.Gender || "",
            BirthDate: profileResponse.data.BirthDate || "",
            Allergies: profileResponse.data.Allergies || "",
            PersonalityTraits: profileResponse.data.PersonalityTraits || "",
            Address: profileResponse.data.Address || "",
            Email: profileResponse.data.Email || "",
            PhoneNumber: profileResponse.data.PhoneNumber || "",
          },
          avatarUrl: avatarResponse.data.data.publicUrl || null,
          medicalHistory: {
            description: medicalResponse.data[0]?.Description || "",
            physicalSymptoms:
              medicalResponse.data[0]?.MedicalHistoryPhysicalSymptom?.map(
                (s) => ({
                  name: s.PhysicalSymptoms?.Name || "",
                  description: s.PhysicalSymptoms?.Description || "",
                })
              ) || [],
            mentalDisorders:
              medicalResponse.data[0]?.MedicalHistorySpecificMentalDisorder?.map(
                (d) => ({
                  name: d.MentalDisorders?.Name || "",
                  description: d.MentalDisorders?.Description || "",
                })
              ) || [],
          },
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: "Error fetching profile data.",
          medicalHistoryError: "Error fetching medical history.",
        }));
        console.error("Fetch error:", err);
      } finally {
        setState((prev) => ({
          ...prev,
          loading: false,
          medicalHistoryLoading: false,
        }));
      }
    };

    fetchData();
  }, [profileId, token]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!token) {
      toast.error("Please log in!");
      return;
    }

    setState((prev) => ({ ...prev, avatarLoading: true }));
    try {
      const previewUrl = URL.createObjectURL(file);
      setState((prev) => ({ ...prev, avatarUrl: previewUrl }));

      const formData = new FormData();
      formData.append("image", file);
      await axios({
        method: state.avatarUrl ? "PUT" : "POST",
        url: `${import.meta.env.VITE_API}/profile/${profileId}/${state.avatarUrl ? "update" : "upload"
          }`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(
        `Profile picture ${state.avatarUrl ? "updated" : "uploaded"}!`
      );
    } catch (err) {
      toast.error(
        `Error ${state.avatarUrl ? "updating" : "uploading"} picture!`
      );
      console.error("Avatar error:", err.response?.data || err.message);
    } finally {
      setState((prev) => ({ ...prev, avatarLoading: false }));
    }
  };

  const handleAvatarDelete = async () => {
    if (
      !window.confirm("Are you sure you want to delete your profile picture?")
    )
      return;
    setState((prev) => ({ ...prev, avatarLoading: true }));
    try {
      await axios.delete(
        `${import.meta.env.VITE_API}/profile/${profileId}/delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setState((prev) => ({ ...prev, avatarUrl: null }));
      toast.success("Profile picture deleted!");
    } catch (err) {
      toast.error("Error deleting picture!");
      console.error("Delete error:", err.response?.data || err.message);
    } finally {
      setState((prev) => ({ ...prev, avatarLoading: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  const handleMedicalHistoryChange = (e, section, index) => {
    const { name, value } = e.target;
    setState((prev) => {
      if (section === "description") {
        return {
          ...prev,
          medicalHistory: { ...prev.medicalHistory, description: value },
        };
      }
      if (section === "physicalSymptoms" || section === "mentalDisorders") {
        const updatedItems = [...prev.medicalHistory[section]];
        updatedItems[index] = { ...updatedItems[index], [name]: value };
        return {
          ...prev,
          medicalHistory: { ...prev.medicalHistory, [section]: updatedItems },
        };
      }
      return prev;
    });
  };

  const addMedicalItem = (section) => {
    setState((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [section]: [
          ...prev.medicalHistory[section],
          { name: "", description: "" },
        ],
      },
    }));
  };

  const removeMedicalItem = (section, index) => {
    setState((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [section]: prev.medicalHistory[section].filter((_, i) => i !== index),
      },
    }));
  };

  const handleMedicalHistorySave = async () => {
    setState((prev) => ({ ...prev, medicalHistorySaving: true }));
    try {
      const updatedMedicalHistory = {
        ...state.medicalHistory,
        diagnosedAt: new Date().toISOString(),
      };
      await axios.put(
        `https://mental-care-server-nodenet.onrender.com/api/medical-histories/patient/${profileId}`,
        updatedMedicalHistory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Medical history saved successfully!");
    } catch (err) {
      toast.error("Error saving medical history!");
      console.error("Save error:", err.response?.data || err.message);
    } finally {
      setState((prev) => ({ ...prev, medicalHistorySaving: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await axios.put(
        `${import.meta.env.VITE_API}/patient-profiles/${profileId}`,
        state.formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      toast.success("Profile updated successfully!");
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Error updating profile." }));
      console.error("Update error:", err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const { loading, error, avatarLoading, avatarUrl, medicalHistoryLoading, medicalHistoryError, medicalHistorySaving, formData, medicalHistory } = state;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin h-10 w-10 border-4 border-t-purple-500 border-gray-200 rounded-full"></div>
      <p className="mt-2 text-gray-600">Loading profile...</p>
    </div>
  );

  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white min-h-screen py-6 px-4 rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <div
                className="w-full h-full rounded-full bg-gray-200 border-4 border-purple-200 shadow-lg cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <FaUser className="h-16 w-16" />
                  </div>
                )}
              </div>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-transform hover:scale-110"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Click to {avatarUrl ? "change" : "upload"} profile picture
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF (max. 5MB)</p>
            {avatarLoading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              >
                <option value="">Select Gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input
                type="date"
                name="BirthDate"
                value={formData.BirthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              />
            </div>
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="px-3 py-2 text-gray-600">{formData.Email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                rows="3"
                required
              />
            </div>
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Psychology Profile</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personality Traits</label>
              <select
                name="PersonalityTraits"
                value={formData.PersonalityTraits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Select Personality Trait</option>
                {personalityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <input
                type="text"
                name="Allergies"
                value={formData.Allergies}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="List any allergies or enter 'None'"
              />
            </div>
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Medical History</h2>
          {medicalHistoryLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-t-indigo-600 border-gray-200 rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading medical history...</p>
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
                  placeholder="Enter medical history description"
                />
              </div>

              <div className="rounded-lg p-4 shadow-sm border-2 border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-blue-700">Physical Symptoms</h3>
                  <button
                    type="button"
                    onClick={() => addMedicalItem("physicalSymptoms")}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Symptom
                  </button>
                </div>
                {medicalHistory.physicalSymptoms.length === 0 ? (
                  <p className="text-gray-500">No physical symptoms recorded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalHistory.physicalSymptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg shadow-sm relative"
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
                        <button
                          type="button"
                          onClick={() => removeMedicalItem("physicalSymptoms", index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg p-4 shadow-sm border-2 border-pink-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-pink-700">Mental Disorders</h3>
                  <button
                    type="button"
                    onClick={() => addMedicalItem("mentalDisorders")}
                    className="px-3 py-1 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                  >
                    Add Disorder
                  </button>
                </div>
                {medicalHistory.mentalDisorders.length === 0 ? (
                  <p className="text-gray-500">No mental disorders recorded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medicalHistory.mentalDisorders.map((disorder, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg shadow-sm relative"
                        style={{ backgroundColor: `hsl(${260 + index * 10}, 30%, 95%)` }}
                      >
                        <input
                          type="text"
                          name="name"
                          value={disorder.name}
                          onChange={(e) => handleMedicalHistoryChange(e, "mentalDisorders", index)}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-800 border border-gray-200 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
                          placeholder="Disorder name"
                        />
                        <input
                          type="text"
                          name="description"
                          value={disorder.description}
                          onChange={(e) => handleMedicalHistoryChange(e, "mentalDisorders", index)}
                          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300"
                          placeholder="Disorder description"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedicalItem("mentalDisorders", index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleMedicalHistorySave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-indigo-400"
                  disabled={medicalHistorySaving}
                >
                  {medicalHistorySaving ? "Saving..." : "Save Medical History"}
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;