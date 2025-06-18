import React, { useState } from 'react';
import axios from 'axios';
import { FaBox, FaPen, FaMoneyBillWave, FaClock, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { motion } from "framer-motion";

const ServicePackageForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationDays: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'https://anhtn.id.vn/subscription-service/service-packages',
                {
                    servicePackage: {
                        name: formData.name,
                        description: formData.description,
                        price: Number(formData.price),
                        durationDays: Number(formData.durationDays)
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                alert('Service package added successfully!');
                setFormData({ name: '', description: '', price: '', durationDays: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while adding the service package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
            <motion.div
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8"> */}
                {/* Title outside the grid */}
                <h2 className="text-3xl font-bold text-indigo-700 mb-8 flex items-center justify-center gap-2">
                    <FaBox className="text-indigo-500" /> Add Service Package
                </h2>

                {/* Two-column grid */}
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div className="transform transition-all flex flex-col">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 w-full">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 w-full">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FaPen className="text-indigo-500" /> Package Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Basic Package"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition-all duration-300"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FaPen className="text-indigo-500" /> Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the service package"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition-all duration-300 resize-y"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-indigo-500" /> Price (VND)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g., 500000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition-all duration-300"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FaClock className="text-indigo-500" /> Duration (days)
                                </label>
                                <input
                                    type="number"
                                    name="durationDays"
                                    value={formData.durationDays}
                                    onChange={handleChange}
                                    placeholder="e.g., 30"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition-all duration-300"
                                    min="1"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
                                    }`}
                            >
                                {loading ? (
                                    <FaSpinner className="text-white" />
                                ) : (
                                    <FaCheckCircle className="text-white" />
                                )}
                                {loading ? 'Processing...' : 'Add Service Package'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h3 className="text-sm font-semibold text-indigo-600 mb-3">Preview:</h3>
                        <div className="text-sm text-gray-700 space-y-2">
                            <p><span className="font-medium text-indigo-600">Name:</span> {formData.name || 'Basic Package'}</p>
                            <p><span className="font-medium text-indigo-600">Description:</span> {formData.description || 'Basic psychological support'}</p>
                            <p><span className="font-medium text-indigo-600">Price:</span> {formData.price ? `${Number(formData.price).toLocaleString()} VND` : '500,000 VND'}</p>
                            <p><span className="font-medium text-indigo-600">Duration:</span> {formData.durationDays || '30'} days</p>
                        </div>
                    </div>
                </div>
                {/* </div> */}
            </motion.div>
        </div>
    );
};

export default ServicePackageForm;