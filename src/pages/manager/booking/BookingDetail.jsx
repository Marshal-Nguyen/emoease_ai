import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ClockIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { AiOutlineUser, AiOutlinePhone, AiOutlineStar } from "react-icons/ai";
import { FaBriefcase, FaUserCircle, FaClipboardList } from "react-icons/fa";
import { FaHeart, FaPhone, FaHeartbeat } from "react-icons/fa";
import { GiMedicines } from "react-icons/gi";
import { MdPsychology } from "react-icons/md";

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
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingResponse = await axios.get(
          `${import.meta.env.VITE_API}/bookings?Id=${id}`
        );
        const bookingData = bookingResponse.data.data[0];
        setBooking(bookingData);

        const doctorResponse = await axios.get(
          `${import.meta.env.VITE_API}/doctor-profiles/${bookingData.DoctorId}`
        );
        const doctorData = doctorResponse.data;
        setDoctor(doctorData);


        const patientResponse = await fetch(
          `${import.meta.env.VITE_API}/patient-profiles/${bookingData.PatientId
          }`,
          {
            method: "GET", // Assuming GET since no method was specified; change if needed
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );
        const patientData = patientResponse.data;
        setPatient(patientData);

        const doctorImageResponse = await axios.get(
          `${import.meta.env.VITE_API}/profile/${bookingData.DoctorId}/image`
        );
        setDoctorImage(doctorImageResponse.data.data.publicUrl);

        const patientImageResponse = await axios.get(
          `${import.meta.env.VITE_API}/profile/${bookingData.PatientId}/image`
        );
        setPatientImage(patientImageResponse.data.data.publicUrl);

        setLoading(false);
      } catch (err) {
        setError("Error fetching booking details or images");
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-12 text-rose-500 font-medium text-lg bg-gray-50 min-h-screen">
        {error}
      </div>
    );

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-gray-100 pt-12 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-extrabold text-blue-400 tracking-tight sm:text-4xl">
            Booking Details
          </h1>
          <button
            onClick={() => navigate("/manager/booking")}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Bookings
          </button>
        </div>

        {/* Layout 3 cột */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột 1: Thông tin bác sĩ */}
          {doctor && (
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl border-l-4 border-indigo-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaBriefcase className="h-5 w-5 mr-2 text-indigo-600" />
                Doctor Information
              </h2>
              {doctorImage && (
                <div className="flex justify-center mb-6">
                  <img
                    src={doctorImage}
                    alt="Doctor Profile"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-200"
                  />
                </div>
              )}
              <div className="space-y-3">
                <InfoItem
                  label="Name"
                  value={doctor.FullName}
                  icon={<AiOutlineUser className="h-5 w-5 text-indigo-500" />}
                />
                <InfoItem
                  label="Gender"
                  value={doctor.Gender}
                  icon={<FaUserCircle className="h-5 w-5 text-indigo-400" />}
                />
                <InfoItem
                  label="Contact"
                  value={doctor.PhoneNumber}
                  icon={<AiOutlinePhone className="h-5 w-5 text-indigo-500" />}
                />
                <InfoItem
                  label="Specialties"
                  value={doctor.specialties.map((s) => s.Name).join(", ")}
                  icon={<FaClipboardList className="h-5 w-5 text-green-500" />}
                />
                <InfoItem
                  label="Experience"
                  value={`${doctor.YearsOfExperience} years`}
                />
                <InfoItem
                  label="Rating"
                  value={doctor.Rating ? `${doctor.Rating}/5` : "No rating"}
                  icon={<AiOutlineStar className="h-5 w-5 text-yellow-400" />}
                />
              </div>
            </div>
          )}

          {/* Cột 2: Thông tin đặt lịch */}
          {booking && (
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-purple-600" />
                Booking Information
              </h2>
              <div className="space-y-4">
                <InfoItem label="Booking Code" value={booking.BookingCode} />
                <div className="flex items-center gap-4">
                  <InfoItem label="Date" value={booking.Date} />
                  <InfoItem
                    label="Time"
                    value={`${booking.StartTime} (${booking.Duration} mins)`}
                    icon={<ClockIcon className="h-5 w-5 text-purple-500" />}
                  />
                </div>
                <InfoItem
                  label="Price"
                  value={`${booking.Price.toLocaleString()} VND`}
                  icon={
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  }
                />
                <InfoItem
                  label="Status"
                  value={booking.Status}
                  className={`font-semibold ${booking.Status === "Confirmed"
                    ? "text-green-600"
                    : "text-orange-500"
                    }`}
                />
              </div>
            </div>
          )}

          {/* Cột 3: Thông tin bệnh nhân */}
          {patient && (
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl border-l-4 border-rose-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaHeart className="h-5 w-5 mr-2 text-rose-600" />
                Patient Information
              </h2>
              {patientImage && (
                <div className="flex justify-center mb-6">
                  <img
                    src={patientImage}
                    alt="Patient Profile"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-rose-200"
                  />
                </div>
              )}
              <div className="space-y-3">
                <InfoItem
                  label="Name"
                  value={patient.FullName}
                  icon={<AiOutlineUser className="h-5 w-5 text-rose-500" />}
                />
                <InfoItem
                  label="Gender"
                  value={patient.Gender}
                  icon={<FaUserCircle className="h-5 w-5 text-rose-400" />}
                />
                <InfoItem
                  label="Contact"
                  value={patient.PhoneNumber}
                  icon={<FaPhone className="h-5 w-5 text-rose-500" />}
                />
                <InfoItem
                  label="Allergies"
                  value={patient.Allergies || "None"}
                  icon={<GiMedicines className="h-5 w-5 text-green-500" />}
                />
                <InfoItem
                  label="Mental Disorders"
                  value={patient.PersonalityTraits || "None"}
                  icon={<MdPsychology className="h-5 w-5 text-indigo-500" />}
                />
                <InfoItem
                  label="Physical Symptoms"
                  value={patient.MedicalHistoryId ? "Available" : "None"}
                  icon={<FaHeartbeat className="h-5 w-5 text-rose-500" />}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable InfoItem Component
const InfoItem = ({ label, value, icon, className = "" }) => (
  <div className="flex items-start space-x-3 group">
    {icon && (
      <span className="mt-1 text-gray-500 group-hover:text-gray-700 transition-colors">
        {icon}
      </span>
    )}
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-base font-medium text-gray-900 ${className}`}>
        {value}
      </p>
    </div>
  </div>
);

export default BookingDetail;
