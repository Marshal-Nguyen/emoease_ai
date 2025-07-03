import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";

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

const mockBookings = [
    {
        bookingCode: "B001",
        patientName: "Jane Smith",
        patientAvatar: null,
        date: "2025-07-01",
        startTime: "10:00",
        duration: 30,
        status: "Completed",
    },
    {
        bookingCode: "B002",
        patientName: "Bob Johnson",
        patientAvatar: null,
        date: "2025-07-02",
        startTime: "14:00",
        duration: 45,
        status: "Awaiting Meeting",
    },
];

// Doctor Profile Component
const ProfileDoctor = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specialtiesList, setSpecialtiesList] = useState([]);
    const [bookings, setBookings] = useState([]);
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
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [committedSearchQuery, setCommittedSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    const API_URL = "http://localhost:3000";

    // Helper to get cached data from localStorage
    const getCachedData = (key, defaultData) =>
        JSON.parse(localStorage.getItem(key)) || defaultData;

    // Helper to set cached data to localStorage
    const setCachedData = (key, data) =>
        localStorage.setItem(key, JSON.stringify(data));

    // Fetch doctor's avatar
    const fetchAvatar = async (doctorId) => {
        try {
            const response = await axios.get(`${API_URL}/api/profile/${doctorId}/image`);
            const url = response.data.data.publicUrl;
            setAvatarUrl(url);
            setCachedData(`avatar_${doctorId}`, url);
        } catch (err) {
            console.error("Error fetching avatar:", err.message);
            setAvatarUrl(getCachedData(`avatar_${doctorId}`, null));
        }
    };

    // Fetch patient name
    const fetchPatientName = async (patientId) => {
        try {
            const response = await axios.get(`${API_URL}/profile-service/patients/${patientId}`);
            const name = response.data.patientProfileDto.fullName;
            setCachedData(`patient_${patientId}`, name);
            return name;
        } catch (err) {
            console.error(`Error fetching patient name ID ${patientId}:`, err.message);
            return getCachedData(`patient_${patientId}`, "Unknown Patient");
        }
    };

    // Fetch patient avatar
    const fetchPatientAvatar = async (patientId) => {
        try {
            const response = await axios.get(`${API_URL}/api/profile/${patientId}/image`);
            const url = response.data.data.publicUrl;
            setCachedData(`patient_avatar_${patientId}`, url);
            return url;
        } catch (err) {
            console.error(`Error fetching patient avatar ID ${patientId}:`, err.message);
            return getCachedData(`patient_avatar_${patientId}`, null);
        }
    };

    // Fetch bookings list
    const fetchBookings = async (doctorId, status, search, date, sort) => {
        try {
            const url = new URL(`${API_URL}/api/bookings`);
            url.searchParams.append("doctorId", doctorId);
            if (status !== "All") {
                url.searchParams.append("Status", status);
            }
            if (search) url.searchParams.append("Search", search);
            if (date) url.searchParams.append("StartDate", date);
            url.searchParams.append("SortBy", "Date");
            url.searchParams.append("SortOrder", sort);

            const response = await axios.get(url.toString());
            const bookingsData = response.data; // Adjusted to expect array directly

            const bookingsWithDetails = await Promise.all(
                bookingsData.map(async (booking) => ({
                    bookingCode: booking.BookingCode,
                    patientName: await fetchPatientName(booking.PatientId),
                    patientAvatar: await fetchPatientAvatar(booking.PatientId),
                    date: booking.Date,
                    startTime: booking.StartTime.slice(0, 5),
                    duration: booking.Duration,
                    status: booking.Status,
                }))
            );
            setBookings(bookingsWithDetails);
            setCachedData(`bookings_${doctorId}_${status}_${search}_${date}_${sort}`, bookingsWithDetails);
        } catch (err) {
            console.error("Error fetching bookings:", err.message);
            toast.error("Unable to load bookings, displaying default data.");
            setBookings(getCachedData(`bookings_${doctorId}_${status}_${search}_${date}_${sort}`, mockBookings));
        }
    };

    // Fetch doctor data and specialties
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/doctor-profiles/${userId}`);
                const data = response.data;
                const doctorId = data.Id;
                setFormData({
                    fullName: data.FullName || mockDoctorData.fullName,
                    gender: data.Gender || mockDoctorData.gender,
                    address: data.Address || mockDoctorData.address,
                    phoneNumber: data.PhoneNumber || mockDoctorData.phoneNumber,
                    email: data.Email || mockDoctorData.email,
                    specialties: data.specialties?.map((s) => s.Id) || mockDoctorData.specialties,
                    qualifications: data.Qualifications || mockDoctorData.qualifications,
                    yearsOfExperience: data.YearsOfExperience || mockDoctorData.yearsOfExperience,
                    bio: data.Bio || mockDoctorData.bio,
                });
                setCachedData(`doctor_${userId}`, data);
                await Promise.all([fetchAvatar(doctorId), fetchBookings(userId, selectedStatus, committedSearchQuery, selectedDate, sortOrder)]);
            } catch (err) {
                console.error("Error fetching doctor data:", err.message);
                setError("Unable to load doctor information, displaying default data.");
                setFormData(getCachedData(`doctor_${userId}`, mockDoctorData));
                setBookings(getCachedData(`bookings_${userId}_${selectedStatus}_${committedSearchQuery}_${selectedDate}_${sortOrder}`, mockBookings));
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
    }, [userId, selectedStatus, committedSearchQuery, selectedDate, sortOrder]);

    // Handle input changes
    const handleStatusChange = (e) => setSelectedStatus(e.target.value);
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleDateChange = (e) => setSelectedDate(e.target.value);
    const handleSortOrderChange = (e) => setSortOrder(e.target.value);

    // Handle search trigger (Enter key or icon click)
    const handleSearch = () => setCommittedSearchQuery(searchQuery);
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Apply color to booking status
    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "text-green-600";
            case "Awaiting Payment":
                return "text-orange-600";
            case "Payment Failed":
                return "text-red-600";
            case "Awaiting Meeting":
                return "text-blue-600";
            case "Cancelled":
                return "text-gray-600";
            case "Confirmed":
                return "text-purple-600";
            default:
                return "text-gray-600";
        }
    };

    // Memoized bookings table
    const bookingsTable = useMemo(() => (
        bookings.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (minutes)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking.bookingCode}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {booking.patientAvatar ? (
                                        <img
                                            src={booking.patientAvatar}
                                            alt={`${booking.patientName}'s avatar`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-gray-500"
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
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.bookingCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.patientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.startTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.duration}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-gray-700">No bookings found.</p>
        )
    ), [bookings]);

    // Display loading (only for initial fetch)
    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen bg-gray-100">
    //             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
    //             <p className="ml-4 text-lg text-gray-700">Loading...</p>
    //         </div>
    //     );
    // }

    // Display error with fallback UI
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <p className="text-gray-700">Default data is displayed due to API connection error.</p>
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
                        <p className="mt-4 text-lg font-medium text-gray-700">{formData.fullName}</p>
                    </div>
                </div>

                {/* Two-column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Full Name</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.fullName}</p>
                                </div>
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Gender</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.gender || "Not specified"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Professional Information
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Qualifications</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.qualifications}</p>
                                </div>
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Years of Experience</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.yearsOfExperience} years</p>
                                </div>
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Bio</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.bio}</p>
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
                                    .filter((specialty) => formData.specialties.includes(specialty.Id))
                                    .map((specialty) => (
                                        <p key={specialty.Id} className="text-gray-900">{specialty.Name}</p>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Contact Information
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Email</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.email}</p>
                                </div>
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Phone Number</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.phoneNumber}</p>
                                </div>
                                <div className="flex items-center">
                                    <label className="text-sm font-semibold text-black">Address</label>
                                    <p className="ml-2 text-gray-900 font-normal">: {formData.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <input
                                    id="searchQuery"
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search by patient name"
                                    className="p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
                                />
                                <FiSearch
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                    onClick={handleSearch}
                                />
                            </div>
                            <input
                                id="dateFilter"
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-40"
                            />
                            <select
                                id="statusFilter"
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-32"
                            >
                                <option value="All">All</option>
                                <option value="Completed">Completed</option>
                                <option value="Awaiting">Awaiting Payment</option>
                                <option value=" Failed">Payment Failed</option>
                                <option value="Awaiting Meeting">Awaiting Meeting</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Confirmed">Confirmed</option>
                            </select>
                            <select
                                id="sortOrder"
                                value={sortOrder}
                                onChange={handleSortOrderChange}
                                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-32"
                            >
                                <option value="asc">Date Ascending</option>
                                <option value="desc">Date Descending</option>
                            </select>
                        </div>
                    </div>
                    {bookingsTable}
                </div>

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