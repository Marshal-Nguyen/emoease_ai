import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileDoctor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specialtiesList, setSpecialtiesList] = useState([]);
    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        contactInfo: { address: "", phoneNumber: "", email: "" },
        specialties: [],
        qualifications: "",
        yearsOfExperience: 0,
        bio: "",
    });
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [id, setId] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const fileInputRef = useRef(null);
    const { userId } = useParams();

    const fetchAvatar = async (doctorId) => {
        try {
            const avatarResponse = await axios.get(
                `https://anhtn.id.vn/image-service/image/get?ownerType=User&ownerId=${doctorId}`
            );
            setAvatarUrl(avatarResponse.data.url);
        } catch (err) {
            console.log("No avatar found or error fetching avatar:", err);
        }
    };

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
            const formDataImg = new FormData();
            formDataImg.append("file", file);
            formDataImg.append("ownerType", "User");
            formDataImg.append("ownerId", id);

            const endpoint = avatarUrl
                ? "https://anhtn.id.vn/image-service/image/update"
                : "https://anhtn.id.vn/image-service/image/upload";

            const method = avatarUrl ? axios.put : axios.post;
            await method(endpoint, formDataImg, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchAvatar(id);
            toast.success("Profile picture updated successfully!");
        } catch (err) {
            console.error("Error updating avatar:", err);
            toast.error("Failed to update profile picture. Please try again.");
        } finally {
            setAvatarLoading(false);
        }
    };

    const triggerFileInput = () => fileInputRef.current.click();

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://anhtn.id.vn/profile-service/doctors/${userId}`
                );
                const { doctorProfileDto } = response.data;
                const doctorId = doctorProfileDto.userId;
                setId(doctorId);
                setFormData({
                    fullName: doctorProfileDto.fullName,
                    gender: doctorProfileDto.gender,
                    contactInfo: {
                        address: doctorProfileDto.contactInfo.address,
                        phoneNumber: doctorProfileDto.contactInfo.phoneNumber,
                        email: doctorProfileDto.contactInfo.email,
                    },
                    specialties: doctorProfileDto.specialties.map((s) => s.id),
                    qualifications: doctorProfileDto.qualifications,
                    yearsOfExperience: doctorProfileDto.yearsOfExperience,
                    bio: doctorProfileDto.bio,
                });
                setLoading(false);
                await fetchAvatar(doctorId);
            } catch (err) {
                setError("Error fetching doctor data. Please try again.");
                setLoading(false);
                console.error("Error fetching doctor data:", err);
            }
        };

        const fetchSpecialties = async () => {
            try {
                const response = await axios.get(
                    "https://anhtn.id.vn/profile-service/specialties?PageIndex=1&PageSize=10"
                );
                setSpecialtiesList(response.data.specialties);
            } catch (err) {
                console.error("Error fetching specialties:", err);
                setSpecialtiesList([
                    { id: "8704cf2c-e7ec-4ece-a057-883653578ae6", name: "Behavioral Therapy" },
                    { id: "ddf4b47a-65d1-451f-a297-41606caacfe2", name: "Neurology" },
                    { id: "3", name: "Cognitive Psychology" },
                    { id: "4", name: "Child Psychology" },
                    { id: "5", name: "Clinical Psychology" },
                ]);
            }
        };

        fetchDoctorData();
        fetchSpecialties();
    }, [userId]);

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
                doctorProfileUpdate: {
                    fullName: formData.fullName,
                    gender: formData.gender,
                    contactInfo: formData.contactInfo,
                    specialtyIds: formData.specialties,
                    qualifications: formData.qualifications,
                    yearsOfExperience: parseInt(formData.yearsOfExperience),
                    bio: formData.bio,
                },
            };
            await axios.put(
                `https://anhtn.id.vn/profile-service/doctors/${userId}`,
                updatedProfile
            );
            setLoading(false);
            toast.success("Doctor profile updated successfully!");
        } catch (err) {
            toast.error("Error updating doctor profile");
            setLoading(false);
            console.error("Error updating profile:", err);
        }
    };

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
                                                stroke="currentColor">
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
                                    className="absolute bottom-2 right-2 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor">
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
                                Supported formats: JPEG, PNG, GIF (max. 5MB)
                            </p>
                        </div>
                    </div>
                    {/* <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-indigo-200 shadow-md">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <svg
                                            className="w-20 h-20 text-gray-400 mx-auto mt-10"
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
                                    )}
                                    {avatarLoading && (
                                        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-full">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors duration-200"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/jpeg, image/png"
                                className="hidden"
                            />
                            <p className="mt-3 text-sm font-medium text-gray-600">
                                {avatarUrl ? "Change" : "Upload"} Profile Picture
                            </p>
                            <p className="text-xs text-gray-400">JPEG, PNG (max 5MB)</p>
                        </div>
                    </div> */}

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
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
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
                                            <option value="Prefer not to say">Prefer not to say</option>
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
                                        <label className="block text-sm font-medium text-gray-700">Qualifications</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Bio</label>
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
                                        <div key={specialty.id} className="flex items-center my-1">
                                            <input
                                                type="checkbox"
                                                id={`specialty-${specialty.id}`}
                                                value={specialty.id}
                                                checked={formData.specialties.includes(specialty.id)}
                                                onChange={handleSpecialtyChange}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor={`specialty-${specialty.id}`}
                                                className="ml-2 text-sm text-gray-700"
                                            >
                                                {specialty.name}
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
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.contactInfo.email}
                                            onChange={handleContactInfoChange}
                                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.contactInfo.phoneNumber}
                                            onChange={handleContactInfoChange}
                                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.contactInfo.address}
                                            onChange={handleContactInfoChange}
                                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            rows="3"
                                            required
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