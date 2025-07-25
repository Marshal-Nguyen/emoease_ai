import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiFillEye } from "react-icons/ai";
import { FaMars, FaVenus, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = `${import.meta.env.VITE_API}/patient-profiles`;
const SEARCH_API_URL = `${import.meta.env.VITE_API}/patient-profiles/search`;
const IMAGE_API_URL = `${import.meta.env.VITE_API}/profile`;

const PsychologistList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("Fullname");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMoreData, setHasMoreData] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        searchQuery ? SEARCH_API_URL : BASE_API_URL,
        {
          params: searchQuery
            ? { fullName: searchQuery, pageIndex, pageSize, sortBy, sortOrder }
            : { pageIndex, pageSize, sortBy, sortOrder },
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const customersWithImagesAndPackages = await Promise.all(
        response.data.data.map(async (customer) => {
          // Fetch profile image
          let profileImage;
          try {
            const imageResponse = await axios.get(
              `${IMAGE_API_URL}/${customer.Id}/image`
            );
            profileImage =
              imageResponse.data.data.publicUrl ||
              "https://via.placeholder.com/150?text=No+Image"; // Placeholder for no image
          } catch (imgError) {
            profileImage =
              "https://cdn-healthcare.hellohealthgroup.com/2023/05/1684813854_646c381ea5d030.57844254.jpg?w=1920&q=100"; // Default for API failure
          }

          // Simulate purchased package since subscription API is not provided
          let purchasedPackageName = null;

          return {
            ...customer,
            id: customer.Id,
            userId: customer.UserId,
            fullName: customer.FullName,
            gender: customer.Gender,
            phoneNumber: customer.PhoneNumber,
            personalityTraits: customer.PersonalityTraits,
            profileImage,
            purchasedPackageName,
          };
        })
      );

      setCustomers(customersWithImagesAndPackages);
      setHasMoreData(
        customersWithImagesAndPackages.length === pageSize &&
        response.data.pageIndex < response.data.totalPages
      );
    } catch (error) {
      setError("Failed to load customers. Please try again.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pageIndex, pageSize, sortBy, sortOrder]);

  const handleSearch = () => {
    setPageIndex(1); // Reset to first page on new search
    fetchCustomers();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (initialLoad) return <div>Loading...</div>;
  if (error)
    return (
      <p className="text-center text-red-500 text-xl font-semibold">{error}</p>
    );

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
          Users List
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
                onKeyDown={handleKeyDown}
                placeholder="Search by name..."
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm shadow-sm transition-all duration-300 hover:shadow-md"
              />
              <FiSearch
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                size={20}
                onClick={handleSearch}
              />
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
                <option value="Fullname">Sort by Name</option>
                <option value="Gender">Sort by Gender</option>
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sm">#</th>
                <th className="px-6 py-4 text-center font-semibold text-sm">
                  Avatar
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Gender
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Personality Traits
                </th>
                <th className="px-6 py-4 text-center font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
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
                        src={customer.profileImage}
                        alt={customer.fullName}
                        className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-indigo-300 shadow-md transition-transform duration-300 hover:scale-110"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">
                      {customer.fullName}
                    </td>
                    <td className="px-6 py-7 flex items-center gap-2 text-gray-600">
                      {customer.gender === "Male" ||
                        customer.gender === "male" ? (
                        <FaMars className="text-blue-600" size={18} />
                      ) : customer.gender === "female" ||
                        customer.gender === "Female" ? (
                        <FaVenus className="text-pink-600" size={18} />
                      ) : (
                        <span>-</span>
                      )}
                      <span className="font-medium">
                        {customer.gender || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {customer.phoneNumber || "N/A"}
                    </td>
                    <td
                      className={`px-6 py-4 italic ${customer.personalityTraits === "Introversion"
                        ? "text-blue-600"
                        : customer.personalityTraits === "Extroversion"
                          ? "text-red-600"
                          : "text-gray-600"
                        }`}
                    >
                      {customer.personalityTraits || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-4">
                        <motion.button
                          className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-lg"
                          title="View Detail"
                          onClick={() => navigate(`${customer.id}`)}
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
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="mt-8 flex justify-center gap-6">
        <motion.button
          onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
          disabled={pageIndex === 1}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors shadow-lg font-semibold"
          whileHover={{ scale: pageIndex === 1 ? 1 : 1.05 }}
        >
          Previous
        </motion.button>
        <span className="py-2 text-gray-800 font-semibold text-lg">
          Page {pageIndex}
        </span>
        <motion.button
          onClick={() => setPageIndex((prev) => prev + 1)}
          disabled={!hasMoreData}
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
