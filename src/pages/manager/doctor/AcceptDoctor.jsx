// DoctorManagement.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUserMd, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaInfoCircle, FaPlus } from 'react-icons/fa';

const DoctorManagement = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'Male',
        address: '',
        phoneNumber: '',
        email: '',
        // specialtyName: '',
        qualifications: '',
        yearsOfExperience: '',
        bio: ''
    });
    // {
    //     "doctorProfile": {
    //         "fullName": "string",
    //             "gender": "Male",
    //                 "contactInfo": {
    //             "address": "string",
    //                 "phoneNumber": "string",
    //                     "email": "string"
    //         },
    //         "qualifications": "string",
    //             "yearsOfExperience": 0,
    //                 "bio": "string"
    //     }
    // }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const doctorProfile = {
                doctorProfile: {
                    fullName: formData.fullName,
                    gender: formData.gender,
                    contactInfo: {
                        address: formData.address,
                        phoneNumber: formData.phoneNumber,
                        email: formData.email
                    },
                    // specialties: formData.specialtyName ? [{ name: formData.specialtyName }] : [],
                    qualifications: formData.qualifications,
                    yearsOfExperience: parseInt(formData.yearsOfExperience),
                    bio: formData.bio
                }
            };

            const response = await axios.post(
                'https://anhtn.id.vn/profile-service/doctor-profiles',
                doctorProfile
            );

            setSuccess('Doctor and specialty added successfully!');
            setFormData({
                fullName: '',
                gender: 'Male',
                address: '',
                phoneNumber: '',
                email: '',
                // specialtyName: '',
                qualifications: '',
                yearsOfExperience: '',
                bio: ''
            });
        } catch (err) {
            setError(err.message || 'Error adding doctor and specialty');
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const inputVariants = {
        focus: { scale: 1.02, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-white p-6 flex items-center justify-center">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-6xl"
            >
                <h1 className="text-4xl font-bold text-purple-800 text-center mb-10 flex items-center justify-center gap-2">
                    <FaUserMd /> Doctor Management
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Doctor Information */}
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-purple-500"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <h2 className="text-2xl font-semibold text-purple-700 mb-6 flex items-center gap-2">
                            <FaUserMd /> Doctor Information
                        </h2>
                        <form className="space-y-5">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <motion.div variants={inputVariants} whileFocus="focus">
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="e.g., Dr. John Doe"
                                        required
                                    />
                                    <FaUserMd className="absolute left-3 top-9 text-purple-500" />
                                </motion.div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Else">Other</option>
                                </select>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <motion.div variants={inputVariants} whileFocus="focus">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="e.g., 123 Main St, City, Country"
                                        required
                                    />
                                    <FaMapMarkerAlt className="absolute left-3 top-9 text-purple-500" />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <motion.div variants={inputVariants} whileFocus="focus">
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="e.g., +1 123-456-7890"
                                            required
                                        />
                                        <FaPhone className="absolute left-3 top-9 text-purple-500" />
                                    </motion.div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <motion.div variants={inputVariants} whileFocus="focus">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="e.g., doctor@example.com"
                                            required
                                        />
                                        <FaEnvelope className="absolute left-3 top-9 text-purple-500" />
                                    </motion.div>
                                </div>
                            </div>
                        </form>
                    </motion.div>

                    {/* Specialty and Additional Info */}
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-pink-500"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <h2 className="text-2xl font-semibold text-pink-700 mb-6 flex items-center gap-2">
                            <FaBriefcase /> Specialty & Details
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Specialty Name</label>
                                <motion.div variants={inputVariants} whileFocus="focus">
                                    <input
                                        type="text"
                                        name="specialtyName"
                                        value={formData.specialtyName}
                                        onChange={handleChange}
                                        className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="e.g., Child Psychology"
                                    />
                                    <FaBriefcase className="absolute left-3 top-9 text-pink-500" />
                                </motion.div>
                            </div> */}

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                                <motion.div variants={inputVariants} whileFocus="focus">
                                    <input
                                        type="text"
                                        name="qualifications"
                                        value={formData.qualifications}
                                        onChange={handleChange}
                                        className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="e.g., MD, PhD in Psychology"
                                        required
                                    />
                                    <FaGraduationCap className="absolute left-3 top-9 text-pink-500" />
                                </motion.div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                <motion.div variants={inputVariants} whileFocus="focus">
                                    <input
                                        type="number"
                                        name="yearsOfExperience"
                                        value={formData.yearsOfExperience}
                                        onChange={handleChange}
                                        className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="e.g., 5"
                                        required
                                        min="0"
                                    />
                                    <FaBriefcase className="absolute left-3 top-9 text-pink-500" />
                                </motion.div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <motion.div variants={inputVariants} whileFocus="focus">
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="mt-1 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="e.g., Experienced psychologist specializing in cognitive therapy..."
                                        rows="3"
                                    />
                                    <FaInfoCircle className="absolute left-3 top-9 text-pink-500" />
                                </motion.div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {loading ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <FaPlus /> Add
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                {/* Status Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-red-600 text-center font-medium bg-red-100 py-2 px-4 rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-green-600 text-center font-medium bg-green-100 py-2 px-4 rounded-lg"
                    >
                        {success}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default DoctorManagement;