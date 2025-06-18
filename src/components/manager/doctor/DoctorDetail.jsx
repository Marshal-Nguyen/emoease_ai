import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileDoctor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specialtiesList, setSpecialtiesList] = useState([]);
    const [bookings, setBookings] = useState([]);
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
    const [selectedStatus, setSelectedStatus] = useState("Completed");
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

    const fetchPatientName = async (patientId) => {
        try {
            const response = await axios.get(
                `https://anhtn.id.vn/profile-service/patients/${patientId}`
            );
            return response.data.patientProfileDto.fullName;
        } catch (err) {
            console.error(`Error fetching patient name for ID ${patientId}:`, err);
            return "Unknown Patient"; // Fallback in case of error
        }
    };

    const fetchBookings = async (doctorId, status) => {
        try {
            let url = `https://anhtn.id.vn/scheduling-service/bookings?PageIndex=1&PageSize=30&DoctorId=${doctorId}`;
            if (status !== "All") {
                url += `&Status=${status}`;
            }
            const response = await axios.get(url);
            const bookingsData = response.data.bookings.data;

            // Fetch patient names for each booking
            const bookingsWithNames = await Promise.all(
                bookingsData.map(async (booking) => {
                    const patientName = await fetchPatientName(booking.patientId);
                    return { ...booking, patientName };
                })
            );
            setBookings(bookingsWithNames);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            toast.error("Failed to load bookings.");
        }
    };

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://anhtn.id.vn/profile-service/doctors/${userId}`
                );
                const { doctorProfileDto } = response.data;
                const doctorId = doctorProfileDto.userId;
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
                await Promise.all([fetchAvatar(doctorId), fetchBookings(userId, selectedStatus)]);
                setLoading(false);
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

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        fetchBookings(userId, newStatus);
    };

    // Function to determine status color
    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "text-green-600";
            case "Awaiting Meeting":
                return "text-yellow-600";
            // Add more statuses and colors as needed
            default:
                return "text-gray-900";
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
                <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex flex-col items-center">
                            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-purple-200 shadow-lg">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full object-cover object-center"
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
                            </div>
                            <p className="mt-4 text-lg font-medium text-gray-700">{formData.fullName}</p>
                        </div>
                    </div>

                    {/* Two-column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Personal Information */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Personal Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Full Name</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.fullName}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Gender</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.gender || "Not specified"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Professional Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Qualifications</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.qualifications}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Years of Experience</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.yearsOfExperience} years</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Bio</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.bio}</p>
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
                                    {specialtiesList
                                        .filter((specialty) => formData.specialties.includes(specialty.id))
                                        .map((specialty) => (
                                            <p key={specialty.id} className="text-gray-900">{specialty.name}</p>
                                        ))}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Contact Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Email</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.contactInfo.email}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Phone Number</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.contactInfo.phoneNumber}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <label className="text-sm font-semibold text-black">Address</label>
                                        <p className="ml-2 text-gray-900 font-normal">: {formData.contactInfo.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bookings Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-indigo-700 flex items-center">
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
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Bookings
                            </h2>
                            <div>
                                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
                                    Filter by Status:
                                </label>
                                <select
                                    id="statusFilter"
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {/* <option value="All">All</option> */}
                                    <option value="Completed">Completed</option>
                                    <option value="AwaitMeeting">Await Meeting</option>
                                </select>
                            </div>
                        </div>
                        {bookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (min)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bookings.map((booking) => (
                                            <tr key={booking.bookingCode}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.bookingCode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.patientName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.startTime}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.duration}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getStatusColor(booking.status)}`}>{booking.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-700">No bookings found for this doctor.</p>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(`/manager/viewDoctor`)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDoctor;
