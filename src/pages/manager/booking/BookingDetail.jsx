import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClockIcon, CurrencyDollarIcon, UserIcon, BriefcaseIcon, HeartIcon, PhoneIcon, StarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AiOutlineUser, AiOutlinePhone, AiOutlineStar } from "react-icons/ai";
import { FaBriefcase, FaUserCircle, FaClipboardList } from "react-icons/fa";
import { FaHeart, FaPhone, FaHeartbeat } from "react-icons/fa";
import { GiMedicines } from "react-icons/gi";
import { MdPsychology } from "react-icons/md"
const BookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [patient, setPatient] = useState(null);
    const [doctorImage, setDoctorImage] = useState(null);
    const [patientImage, setPatientImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                // Fetch booking details
                const bookingResponse = await axios.get(
                    `https://anhtn.id.vn/scheduling-service/bookings/${id}`
                );
                const bookingData = bookingResponse.data.booking;
                setBooking(bookingData);

                // Fetch doctor details
                const doctorResponse = await axios.get(
                    `https://anhtn.id.vn/profile-service/doctors/${bookingData.doctorId}`
                );
                const doctorData = doctorResponse.data.doctorProfileDto;
                setDoctor(doctorData);

                // Fetch patient details
                const patientResponse = await axios.get(
                    `https://anhtn.id.vn/profile-service/patients/${bookingData.patientId}`
                );
                const patientData = patientResponse.data.patientProfileDto;
                setPatient(patientData);

                // Fetch doctor image
                const doctorImageResponse = await axios.get(
                    `https://anhtn.id.vn/image-service/image/get?ownerType=User&ownerId=${doctorData.userId}`
                );
                setDoctorImage(doctorImageResponse.data.url);

                // Fetch patient image
                const patientImageResponse = await axios.get(
                    `https://anhtn.id.vn/image-service/image/get?ownerType=User&ownerId=${patientData.userId}`
                );
                setPatientImage(patientImageResponse.data.url);

                setLoading(false);
            } catch (err) {
                setError('Error fetching booking details or images');
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
        </div>
    );
    if (error) return (
        <div className="text-center py-10 text-red-600 font-semibold animate-pulse">{error}</div>
    );

    return (
        <div className="container mx-auto bg-white px-4 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-purple-700">Booking Details</h1>
                <button
                    onClick={() => navigate('/manager/booking')}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Bookings
                </button>
            </div>

            {/* Layout 3 cột */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột 1: Thông tin bác sĩ */}
                {doctor && (
                    <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-blue-500">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-700 flex items-center">
                            <FaBriefcase className="h-6 w-6 mr-2 text-blue-600" /> Doctor Information
                        </h2>
                        {doctorImage && (
                            <div className="flex justify-center mb-6">
                                <img src={doctorImage} alt="Doctor Profile" className="w-24 h-24 rounded-full object-cover" />
                            </div>
                        )}
                        <div className="space-y-4">
                            <InfoItem label="Name" value={doctor.fullName} icon={<AiOutlineUser className="h-5 w-5 text-blue-500" />} />
                            <InfoItem label="Gender" value={doctor.gender} icon={<FaUserCircle className="h-5 w-5 text-purple-500" />} />
                            <InfoItem label="Contact" value={doctor.contactInfo.phoneNumber} icon={<AiOutlinePhone className="h-5 w-5 text-blue-500" />} />
                            <InfoItem label="Specialties" value={doctor.specialties.map(s => s.name).join(', ')} icon={<FaClipboardList className="h-5 w-5 text-green-500" />} />
                            <InfoItem label="Experience" value={`${doctor.yearsOfExperience} years`} />
                            <InfoItem label="Rating" value={`${doctor.rating}/5`} icon={<AiOutlineStar className="h-5 w-5 text-yellow-500" />} />
                        </div>
                    </div>
                )}

                {/* Cột 2: Thông tin đặt lịch */}
                <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-purple-500">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-700 flex items-center">
                        <ClockIcon className="h-6 w-6 mr-2 text-purple-600" /> Booking Information
                    </h2>
                    <div className="space-y-4">
                        <InfoItem label="Booking Code" value={booking.bookingCode} />
                        <div className="flex items-center gap-4">
                            <InfoItem label="Date" value={booking.date} />
                            <InfoItem label="Time" value={`${booking.startTime} (${booking.duration} mins)`} icon={<ClockIcon className="h-5 w-5 text-purple-500" />} />
                        </div>
                        <InfoItem label="Price" value={`${booking.price.toLocaleString()} VND`} icon={<CurrencyDollarIcon className="h-5 w-5 text-green-600" />} />
                        <InfoItem label="Status" value={booking.status} className={`font-semibold ${booking.status === 'Confirmed' ? 'text-green-600' : 'text-orange-600'}`} />
                    </div>
                </div>

                {/* Cột 3: Thông tin bệnh nhân */}
                {patient && (
                    <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-pink-500">
                        <h2 className="text-2xl font-semibold mb-4 text-pink-700 flex items-center">
                            <FaHeart className="h-6 w-6 mr-2 text-pink-600" /> Patient Information
                        </h2>
                        {patientImage && (
                            <div className="flex justify-center mb-6">
                                <img src={patientImage} alt="Patient Profile" className="w-24 h-24 rounded-full object-cover" />
                            </div>
                        )}
                        <div className="space-y-4">
                            <InfoItem label="Name" value={patient.fullName} icon={<AiOutlineUser className="h-5 w-5 text-pink-500" />} />
                            <InfoItem label="Gender" value={patient.gender} icon={<FaUserCircle className="h-5 w-5 text-purple-500" />} />
                            <InfoItem label="Contact" value={patient.contactInfo.phoneNumber} icon={<FaPhone className="h-5 w-5 text-pink-500" />} />
                            <InfoItem label="Allergies" value={patient.allergies || 'None'} icon={<GiMedicines className="h-5 w-5 text-green-500" />} />
                            <InfoItem label="Mental Disorders" value={patient.medicalHistory.specificMentalDisorders.map(d => d.name).join(', ') || 'None'} icon={<MdPsychology className="h-5 w-5 text-blue-500" />} />
                            <InfoItem label="Physical Symptoms" value={patient.medicalHistory.physicalSymptoms.map(s => s.name).join(', ') || 'None'} icon={<FaHeartbeat className="h-5 w-5 text-red-500" />} />
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

// Reusable InfoItem Component
const InfoItem = ({ label, value, icon, className = '' }) => (
    <div className="flex items-start space-x-2">
        {icon && <span>{icon}</span>}
        <div>
            <p className="text-gray-600 text-sm font-medium">{label}:</p>
            <p className={`font-medium text-gray-800 ${className}`}>{value}</p>
        </div>
    </div>
);

export default BookingDetail;