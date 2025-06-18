import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillEdit, AiFillEye } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";
import { motion } from "framer-motion";
import Loader from "../../../components/Web/Loader";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = "https://anhtn.id.vn/profile-service/doctors";
const IMAGE_API_URL = "https://anhtn.id.vn/image-service/image/get";

const PsychologistList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState("Rating");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const [hasMoreData, setHasMoreData] = useState(true); // Thêm state kiểm tra còn dữ liệu
    const navigate = useNavigate();

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(BASE_API_URL, {
                params: {
                    PageIndex: pageIndex,
                    PageSize: pageSize,
                    Search: searchQuery,
                    SortBy: sortBy,
                    SortOrder: sortOrder,
                },
            });

            const doctorsWithImages = await Promise.all(
                response.data.doctorProfiles.data.map(async (doctor) => {
                    try {
                        const imageResponse = await axios.get(IMAGE_API_URL, {
                            params: { ownerType: "User", ownerId: doctor.userId },
                        });
                        return {
                            ...doctor,
                            profileImage:
                                imageResponse.data.url ||
                                "https://cdn-healthcare.hellohealthgroup.com/2023/05/1684813854_646c381ea5d030.57844254.jpg?w=1920&q=100",
                        };
                    } catch (imgError) {
                        console.error("Error fetching image for doctor:", doctor.id, imgError);
                        return {
                            ...doctor,
                            profileImage:
                                "https://cdn-healthcare.hellohealthgroup.com/2023/05/1684813854_646c381ea5d030.57844254.jpg?w=1920&q=100",
                        };
                    }
                })
            );
            setDoctors(doctorsWithImages);
            // Kiểm tra nếu số lượng bản ghi nhỏ hơn pageSize, nghĩa là không còn dữ liệu
            setHasMoreData(doctorsWithImages.length === pageSize);
        } catch (error) {
            setError("Failed to load doctors. Please try again.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [pageIndex, pageSize, sortBy, sortOrder, searchQuery]);

    if (initialLoad) return <Loader />;
    if (error) return <p className="text-center text-red-500 text-xl font-semibold">{error}</p>;

    return (
        <div className="container mx-auto p-6 mt-2 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <motion.div
                className="flex items-center justify-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <FaUsers className="text-indigo-700 mr-3" size={36} />
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    Psychologists List
                </h2>
            </motion.div>

            {/* Filter and Table Wrapper */}
            <motion.div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Filter and Search Controls */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-1/3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm shadow-sm transition-all duration-300 hover:shadow-md"
                            />
                            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <div className="flex gap-4 items-center">
                            <MdFilterList className="text-indigo-600" size={24} />
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm transition-all duration-300 hover:shadow-md"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm transition-all duration-300 hover:shadow-md"
                            >
                                <option value="fullName">Sort by Name</option>
                                <option value="Rating">Sort by Rating</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm transition-all duration-300 hover:shadow-md"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-sm">#</th>
                                <th className="px-6 py-4 text-center font-semibold text-sm">Avatar</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Name</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Specialization</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Email</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Rating</th>
                                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.length > 0 ? (
                                doctors.map((doctor, index) => (
                                    <motion.tr
                                        key={doctor.id}
                                        className="border-b border-gray-100 hover:bg-indigo-50 transition-all duration-200"
                                        whileHover={{ scale: 1.005 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {(pageIndex - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="py-4">
                                            <img
                                                src={doctor.profileImage}
                                                alt={doctor.fullName}
                                                className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-indigo-300 shadow-md transition-transform duration-300 hover:scale-110"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-semibold">{doctor.fullName}</td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {doctor.specialties.map((s) => s.name).join(", ")}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{doctor.contactInfo.email}</td>
                                        <td className="px-6 py-4 text-yellow-500 font-semibold">
                                            ⭐ {doctor.rating?.toFixed(1) || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-4">
                                                <motion.button
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                                                    title="Edit"
                                                    onClick={() => navigate(`/manager/ProfileDoctor/${doctor.id}`)}
                                                    whileHover={{ scale: 1.15 }}
                                                >
                                                    <AiFillEdit size={20} />
                                                </motion.button>
                                                <motion.button
                                                    className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-lg"
                                                    title="View Detail"
                                                    onClick={() => navigate(`${doctor.id}`)}
                                                    whileHover={{ scale: 1.15 }}
                                                >
                                                    <AiFillEye size={20} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-6">
                <motion.button
                    onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                    disabled={pageIndex === 1}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors shadow-lg font-semibold"
                    whileHover={{ scale: pageIndex === 1 ? 1 : 1.05 }}
                >
                    Previous
                </motion.button>
                <span className="py-2 text-gray-800 font-semibold text-lg">Page {pageIndex}</span>
                <motion.button
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    disabled={!hasMoreData} // Vô hiệu hóa nút Next nếu không còn dữ liệu
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors shadow-lg font-semibold"
                    whileHover={{ scale: !hasMoreData ? 1 : 1.05 }}
                >
                    Next
                </motion.button>
            </div>
        </div>
    );
};

export default PsychologistList;