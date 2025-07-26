import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify"; // Import toast for error notifications
import { debounce } from "lodash"; // Import lodash for debouncing

const DoctorList = () => {
  const navigate = useNavigate();
  const isFetched = useRef(false);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("rating");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const specialtyScrollRef = useRef(null);
  const filterScrollRef = useRef(null);
  const YOUR_TOKEN = localStorage.getItem("token");
  const API_PROFILE = import.meta.env.VITE_API;

  // Animation variants for staggered card rendering
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Debounced fetchDoctors to prevent excessive API calls
  const debouncedFetchDoctors = debounce(async (params = {}) => {
    const loadingTimeout = setTimeout(() => setLoading(true), 500);

    try {
      const defaultParams = {
        PageIndex: 1,
        PageSize: 10,
        SortBy: "Rating",
        SortOrder: "desc",
      };

      const mergedParams = { ...defaultParams, ...params };

      if (startDate && startTime && endDate && endTime) {
        const formattedStartDate = `${startDate} ${startTime}`;
        const formattedEndDate = `${endDate} ${endTime}`;
        mergedParams.StartDate = formattedStartDate;
        mergedParams.EndDate = formattedEndDate;
      }

      const doctorsResponse = await axios.get(
        `${API_PROFILE}/doctor-profiles`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${YOUR_TOKEN}`,
          },
          params: mergedParams,
        }
      );

      // Fetch images for each doctor
      const doctorsWithImages = await Promise.all(
        doctorsResponse.data.data.map(async (doctor) => {
          try {
            const imageResponse = await axios.get(
              `${API_PROFILE}/profile/${doctor.Id}/image`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${YOUR_TOKEN}`,
                },
              }
            );
            return { ...doctor, image: imageResponse.data.data.publicUrl };
          } catch (error) {
            console.error(`Error fetching image for doctor ${doctor.Id}:`, error);
            return { ...doctor, image: null };
          }
        })
      );

      setDoctors(doctorsWithImages || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors. Please try again later.");
    } finally {
      clearTimeout(loadingTimeout);
      setLoading(false);
    }
  }, 300);

  // Initial fetch for specialties and doctors
  useEffect(() => {
    // if (!YOUR_TOKEN) {
    //   navigate("/login");
    //   return;
    // }
    if (isFetched.current) return;
    isFetched.current = true;

    const fetchInitialData = async () => {
      try {
        const specialtiesResponse = await axios.get(
          `${API_PROFILE}/specialties`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${YOUR_TOKEN}`,
            },
            params: {
              PageIndex: 1,
              PageSize: 10,
            },
          }
        );

        setSpecialties(specialtiesResponse.data || []);
        debouncedFetchDoctors();
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data. Please try again.");
      }
    };

    fetchInitialData();
  }, [navigate]);

  // Handle specialty selection
  const handleSpecialtyilélect = (specialtyId) => {
    setSelectedSpecialty(specialtyId);
    debouncedFetchDoctors({ Specialties: specialtyId });
  };

  // Handle date and time filtering with validation
  const handleDateTimeFilter = () => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      if (start >= end) {
        toast.error("Start date/time must be before end date/time.");
        return;
      }
    }

    const params = {};
    if (selectedSpecialty) {
      params.Specialties = selectedSpecialty;
    }
    if (startDate && startTime && endDate && endTime) {
      params.StartDate = `${startDate} ${startTime}`;
      params.EndDate = `${endDate} ${endTime}`;
    }

    debouncedFetchDoctors(params).then(() => {
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
    });
  };

  // Handle filter change (rating/specialties)
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    debouncedFetchDoctors({ SortBy: filter === "rating" ? "Rating" : "Specialty" });
  };

  // Scroll specialties horizontally
  const scrollSpecialties = (direction) => {
    if (specialtyScrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      specialtyScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Scroll filter buttons horizontally
  const scrollFilter = (direction) => {
    if (filterScrollRef.current) {
      const scrollAmount = direction === "left" ? -150 : 150;
      filterScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Specialty scroller component
  const SpecialtyScroller = ({ specialties = [] }) => {
    if (!specialties || specialties.length === 0) {
      return (
        <div className="h-8 flex items-center justify-center">
          <span className="text-xs text-gray-500">No specialty</span>
        </div>
      );
    }

    return (
      <div className="relative group">
        <div
          ref={specialtyScrollRef}
          className="flex overflow-x-auto pb-2 hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex space-x-1 px-1">
            {specialties.map((spec, idx) => (
              <span
                key={idx}
                className="text-xs whitespace-nowrap bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full flex-shrink-0"
              >
                {spec.Name}
              </span>
            ))}
          </div>
        </div>

        {specialties.length > 2 && (
          <>
            <button
              onClick={() => scrollSpecialties("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll specialties left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => scrollSpecialties("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll specialties right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}
      </div>
    );
  };

  // Doctor card component
  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <img
            src={
              doctor.image ||
              "https://cdn-healthcare.hellohealthgroup.com/2023/09/1695616991_65110fdf078417.49245494.jpg?w=1920&q=100"
            }
            alt={doctor.FullName}
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>

      <div className="pt-10 pb-6 px-6 flex-1 flex flex-col">
        <div className="flex justify-center items-center mb-2">
          <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
            <Star
              className="w-4 h-4 text-yellow-500 mr-1"
              fill="currentColor"
            />
            <span className="text-sm font-semibold">
              {doctor.Rating || "N/A"}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-center text-gray-800 mb-1 line-clamp-1">
          {doctor.FullName}
        </h3>

        <div className="mb-3 mt-1 h-8">
          <SpecialtyScroller specialties={doctor.specialties} />
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">{doctor.PhoneNumber}</span>
          </div>

          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">{doctor.Email}</span>
          </div>

          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 text-blue-500 mt-1 flex-shrink-0" />
            <span className="text-xs line-clamp-2">
              {doctor.Address || "Không có địa chỉ"}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => navigate(`/EMO/booking/${doctor.Id}`)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center"
            aria-label={`Book appointment with ${doctor.FullName}`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book now
          </button>
        </div>
      </div>
    </div>
  );

  // Specialty filter component
  const SpecialtyFilter = () => (
    <div className="relative mt-4 group">
      <div
        ref={filterScrollRef}
        className="flex overflow-x-auto py-1 hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex space-x-2 px-1">
          <button
            onClick={() => {
              setSelectedSpecialty("");
              debouncedFetchDoctors();
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${!selectedSpecialty
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            aria-label="Show all specialties"
          >
            Tất cả
          </button>
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => handleSpecialtySelect(specialty.Id)}
              className={`px-3 py-1 rounded-full text-sm flex-shrink-0 ${selectedSpecialty === specialty.Id
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              aria-label={`Filter by ${specialty.Name}`}
            >
              {specialty.Name}
            </button>
          ))}
        </div>
      </div>

      {specialties.length > 6 && (
        <>
          <button
            onClick={() => scrollFilter("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll filter left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => scrollFilter("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll filter right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </>
      )}
    </div>
  );

  // Filter section component
  const FilterSection = () => (
    <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-100">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange("rating")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${selectedFilter === "rating"
                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              aria-label="Sort by rating"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>Top Rated</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange("specialties")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${selectedFilter === "specialties"
                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              aria-label="Sort by specialty"
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Specialty</span>
              </div>
            </motion.button>
          </div>
        </div>

        {selectedFilter === "specialties" && <SpecialtyFilter />}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DateTimeInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <DateTimeInput
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <DateTimeInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <DateTimeInput
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDateTimeFilter}
          className="w-[200px] bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Apply date and time filters"
        >
          Apply Filters
        </motion.button>
      </div>
    </div>
  );

  // Date/time input component
  const DateTimeInput = ({ label, type, value, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
        aria-label={label}
      />
    </div>
  );

  // Loading skeleton cards
  const LoadingCards = () => {
    const cardCount = window.innerWidth < 640 ? 4 : 8; // Fewer cards on mobile
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(cardCount)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 animate-pulse"
          >
            <div className="relative">
              <div className="h-32 bg-gray-200"></div>
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white"></div>
              </div>
            </div>
            <div className="pt-16 pb-6 px-6">
              <div className="flex justify-center mb-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-6 w-3/4 mx-auto bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2 mt-1"></div>
                  <div className="h-8 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mt-6">
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-violet-50 via-white to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 px-4 bg-gradient-to-r from-[#4A2580] to-[#804ac2] rounded-2xl py-15 flex flex-col justify-center items-center text-white"
      >
        <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          Psychology Experts by Your Side
        </h1>
        <p className="opacity-80 max-w-2xl mx-auto text-[#ffffff]">
          We

          listen, understand, and accompany you on your journey to mental
          health care. <br />
          Every story matters, and every emotion is respected.
        </p>
      </motion.div>

      {/* <FilterSection /> */}

      <div>
        {loading ? (
          <LoadingCards />
        ) : doctors.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No doctors found matching your criteria.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {doctors.map((doctor, index) => (
              <DoctorCard key={doctor.Id || index} doctor={doctor} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;