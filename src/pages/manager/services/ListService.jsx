import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillEye, AiFillEdit } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";
import { motion } from "framer-motion";
import Loader from "../../../components/Web/Loader";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = "https://anhtn.id.vn/subscription-service/service-packages";

const ServicePackageList = () => {
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        name: "",
        description: "",
        price: "",
        durationDays: "",
        isActive: false
    });
    const [hasMoreData, setHasMoreData] = useState(true); // Thêm state kiểm tra còn dữ liệu
    const navigate = useNavigate();

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const params = {
                PageIndex: pageIndex,
                PageSize: pageSize,
            };

            // Chỉ thêm Status vào params nếu statusFilter không phải "all"
            if (statusFilter !== "all") {
                params.Status = statusFilter === "active" ? true : false;
            }

            const response = await axios.get(BASE_API_URL, { params });

            const packagesWithImages = response.data.servicePackages.data.map(pkg => ({
                ...pkg,
                imageUrl: "https://via.placeholder.com/150?text=No+Image"
            }));

            setPackages(packagesWithImages);
            applySearchFilter(packagesWithImages);
            // Kiểm tra nếu số lượng bản ghi nhỏ hơn pageSize, nghĩa là không còn dữ liệu
            setHasMoreData(packagesWithImages.length === pageSize);
        } catch (error) {
            setError("Failed to load service packages. Please try again.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    // Hàm áp dụng bộ lọc tìm kiếm theo tên
    const applySearchFilter = (data) => {
        if (searchQuery.trim() === "") {
            setFilteredPackages(data);
        } else {
            const filtered = data.filter((pkg) =>
                pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPackages(filtered);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [pageIndex, pageSize, statusFilter]); // Thêm statusFilter vào dependency

    useEffect(() => {
        applySearchFilter(packages);
    }, [searchQuery]);

    const countActivePackages = () => {
        return packages.filter(pkg => pkg.isActive).length;
    };

    const handleUpdateClick = (pkg) => {
        setSelectedPackage(pkg);
        setUpdateForm({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            durationDays: pkg.durationDays,
            isActive: pkg.isActive
        });
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const activeCount = countActivePackages();
        if (!updateForm.isActive && selectedPackage.isActive) {
            // Cho phép chuyển từ Active sang Inactive
        } else if (updateForm.isActive && !selectedPackage.isActive && activeCount >= 3) {
            alert("Cannot activate more than 3 packages!");
            return;
        }

        try {
            const response = await axios.put(
                `${BASE_API_URL}/${selectedPackage.id}`,
                {
                    name: updateForm.name,
                    description: updateForm.description,
                    price: parseFloat(updateForm.price),
                    durationDays: parseInt(updateForm.durationDays),
                    isActive: updateForm.isActive
                }
            );
            const updatedPackages = packages.map(p =>
                p.id === selectedPackage.id ? { ...p, ...updateForm } : p
            );
            setPackages(updatedPackages);
            applySearchFilter(updatedPackages);
            setShowUpdateModal(false);
        } catch (error) {
            console.error("Error updating package:", error);
            alert("Failed to update package. Please try again.");
        }
    };

    if (initialLoad) return <Loader />;
    if (error) return <p className="text-center text-red-500 text-xl font-semibold">{error}</p>;

    const startIndex = (pageIndex - 1) * pageSize;

    return (
        <div className="container mx-auto p-6 mt-2 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <motion.div
                className="flex items-center justify-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <FaUsers className="text-indigo-700 mr-3" size={36} />
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    Service Packages
                </h2>
            </motion.div>

            <motion.div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
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
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm transition-all duration-300 hover:shadow-md"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-sm">#</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Name</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Description</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Price (VND)</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Duration (Days)</th>
                                <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                                <th className="px-6 py-4 text-center font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPackages.length > 0 ? (
                                filteredPackages.map((pkg, index) => (
                                    <motion.tr
                                        key={pkg.id}
                                        className="border-b border-gray-100 hover:bg-indigo-50 transition-all duration-200"
                                        whileHover={{ scale: 1.005 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-semibold">{pkg.name}</td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{pkg.description}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">
                                            {pkg.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{pkg.durationDays}</td>
                                        <td className="px-6 py-4 font-medium">
                                            <span
                                                className={
                                                    pkg.isActive ? "text-green-600" : "text-red-600"
                                                }
                                            >
                                                {pkg.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-4">
                                                <motion.button
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                                                    title="Update Package"
                                                    onClick={() => handleUpdateClick(pkg)}
                                                    whileHover={{ scale: 1.15 }}
                                                >
                                                    <AiFillEdit size={20} />
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

            {showUpdateModal && (
                <motion.div
                    className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-999"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <h3 className="text-2xl font-bold mb-4 text-indigo-600">Update Service Package</h3>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={updateForm.name}
                                    onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={updateForm.description}
                                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Price (VND)</label>
                                <input
                                    type="number"
                                    value={updateForm.price}
                                    onChange={(e) => setUpdateForm({ ...updateForm, price: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Duration (Days)</label>
                                <input
                                    type="number"
                                    value={updateForm.durationDays}
                                    onChange={(e) => setUpdateForm({ ...updateForm, durationDays: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            {(countActivePackages() < 3 || selectedPackage.isActive) && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Status</label>
                                    <select
                                        value={updateForm.isActive}
                                        onChange={(e) => setUpdateForm({ ...updateForm, isActive: e.target.value === 'true' })}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            )}
                            {countActivePackages() >= 3 && !selectedPackage.isActive && (
                                <div className="mb-4 text-gray-600">
                                    Status: Inactive (Maximum 3 active packages allowed)
                                </div>
                            )}
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

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

export default ServicePackageList;