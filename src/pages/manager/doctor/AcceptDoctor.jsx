import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaUserMd, FaEnvelope, FaPlus } from "react-icons/fa";

const AcceptDoctor = ({ onClose }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem("token");

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
        full_name: formData.full_name,
        email: formData.email,
      };

      const response = await axios.post(
        "https://mental-care-server-nodenet.onrender.com/api/invite-doctor",
        doctorProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Doctor added successfully!");
      setFormData({
        full_name: "",
        email: "",
      });
      if (onClose) onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || "Error adding doctor");
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <motion.div variants={inputVariants} whileFocus="focus">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 placeholder-gray-400 transition-all duration-200"
              placeholder="e.g., Dr. John Doe"
              required
            />
            <FaUserMd className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
          </motion.div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <motion.div variants={inputVariants} whileFocus="focus">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 placeholder-gray-400 transition-all duration-200"
              placeholder="e.g., doctor@example.com"
              required
            />
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
          </motion.div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 text-lg font-semibold shadow-md transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <FaPlus /> Add Doctor
            </>
          )}
        </motion.button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-red-600 text-center font-medium bg-red-100/80 backdrop-blur-sm py-3 px-6 rounded-xl"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-green-600 text-center font-medium bg-green-100/80 backdrop-blur-sm py-3 px-6 rounded-xl"
        >
          {success}
        </motion.div>
      )}
    </div>
  );
};

export default AcceptDoctor;