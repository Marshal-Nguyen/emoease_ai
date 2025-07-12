import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";

const AffiliatePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 6; // Changed from 8 to 6
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Add these new states at the top of your component
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: "all",
    sortBy: "priceAsc", // Changed from "default" to "priceAsc"
  });

  // Replace PRICE_RANGES constant with:
  const PRICE_RANGE = {
    min: 0,
    max: 10000000,
    step: 100000,
  };

  // Add new states
  const [minPrice, setMinPrice] = useState(PRICE_RANGE.min);
  const [maxPrice, setMaxPrice] = useState(PRICE_RANGE.max);

  // Add price formatter function
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const SORT_OPTIONS = [
    { value: "priceAsc", label: "Giá tăng dần" },
    { value: "priceDesc", label: "Giá giảm dần" },
    { value: "nameAsc", label: "Tên A-Z" },
    { value: "nameDesc", label: "Tên Z-A" },
  ];

  // Add this debounce function
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Update the filtering logic
  const getFilteredProducts = () => {
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    return products
      .filter((product) => {
        const matchesSearch =
          debouncedSearchTerm === "" ||
          product.name
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase());

        const matchesCategory =
          filters.category === "all" || product.category === filters.category;

        const price = Number(product.price) || 0;
        const matchesPrice = price >= minPrice && price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "priceAsc":
            return (Number(a.price) || 0) - (Number(b.price) || 0);
          case "priceDesc":
            return (Number(b.price) || 0) - (Number(a.price) || 0);
          case "nameAsc":
            return (a.name || "").localeCompare(b.name || "");
          case "nameDesc":
            return (b.name || "").localeCompare(a.name || "");
          default:
            return (Number(a.price) || 0) - (Number(b.price) || 0); // Default to price ascending
        }
      });
  };

  const filteredProducts = getFilteredProducts();
  // const filteredProducts = useMemo(
  //   () => getFilteredProducts(),
  //   [searchTerm, filters, minPrice, maxPrice, products]
  // );
  useEffect(() => {
    const loadExcelData = async () => {
      try {
        const response = await fetch("/Emo_Affiliate.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedProducts = jsonData.map((row, index) => ({
          id: row["No"] || index + 1,
          category: row["Category"] || row["Loại sản phẩm"] || "Khác",
          name: row["Name"] || row["Sản phẩm"] || "Sản phẩm không tên",
          description: row["Description"] || row["Mô tả"] || "",
          usage: row["Usage"] || row["Công dụng"] || "",
          instructions: row["Instructions"] || row["Hướng dẫn sử dụng"] || "",
          image: row["Image"] || row["Hình ảnh"] || "",
          notes: row["Notes"] || row["Lưu ý khi sử dụng"] || "",
          price: row["Price"] || row["Giá"] || 0,
          affiliateLink: row["Link"] || "#",
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Lỗi khi tải file Excel:", error);
        // Mock data với style giống như hình
        setProducts([
          {
            id: 1,
            category: "Nước hoa",
            name: "Nước hoa Lavender Dreams",
            description: "Thiết kế bởi PerfumeArt",
            usage: "Xịt lên cổ tay và cổ",
            price: 450000,
            affiliateLink: "#",

            image:
              "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
          },
          {
            id: 2,
            category: "Nến thơm",
            name: "Bộ nến thơm Harmony",
            description: "Thiết kế bởi CandleStudio",
            usage: "Thắp nến trong 2-3 giờ",
            price: 420000,
            affiliateLink: "#",

            image:
              "https://images.unsplash.com/photo-1602874801545-3b60ac4d9952?w=400&h=400&fit=crop",
          },
          {
            id: 3,
            category: "Gối ngủ",
            name: "Gối ôm Memory Foam Premium",
            description: "Thiết kế bởi ComfortDesign",
            usage: "Sử dụng khi ngủ",
            price: 380000,
            affiliateLink: "#",

            image:
              "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop",
          },
          {
            id: 4,
            category: "Tinh dầu",
            name: "Tinh dầu Eucalyptus",
            description: "Thiết kế bởi NaturalEssence",
            usage: "Nhỏ vào máy khuếch tán",
            price: 320000,
            affiliateLink: "#",

            image:
              "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
          },
        ]);
      }
    };

    loadExcelData();
  }, []);

  const categories = [
    "all",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // Thêm constant cho chiều cao cố định
  const CARD_HEIGHTS = {
    image: "h-[240px]",
    title: "h-[56px]",
    description: "h-[48px]",
    price: "h-[48px]",
  };

  // Add this new function to get page numbers array
  const getPageNumbers = () => {
    const totalPageCount = Math.ceil(filteredProducts.length / productsPerPage);
    const maxVisiblePages = 5; // Number of page buttons to show

    if (totalPageCount <= maxVisiblePages) {
      return Array.from({ length: totalPageCount }, (_, i) => i);
    }

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPageCount - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  // Replace the Navigation Arrows section with this new Pagination component
  // Add useEffect to reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters, searchTerm]);

  // Update pagination calculation
  const paginatedProducts = filteredProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  // First, add a new state for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header Section with Hero */}

      <div className=" mx-auto lg:px-0 py-6">
        <header className="pt-12 w-full bg-gradient-to-r from-[#4A2580] to-[#804ac2] pb-8 px-6 text-center">
          <h1 className="text-xl opacity-80 mb-2 text-[#ffffff]">
            Welcome to EmoRelax
          </h1>
          <h2 className="text-5xl font-bold mb-4 text-[#ffffff]">
            Explore a Relaxing Space
          </h2>
          <p className="mb-8 opacity-80 max-w-3xl mx-auto text-[#ffffff]">
            We carefully select premium products to help you relax and regain
            mental balance in your daily life.
          </p>
          <div className="flex gap-4 justify-center">
            <button className=" bg-[#ffffff] px-3 py-2 rounded-md text-[#4A2580] tracking-wider shadow-xl animate-bounce hover:animate-none">
              <svg
                className="w-5 h-5"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  strokeLinecap="round"></path>
              </svg>
            </button>
          </div>
        </header>
      </div>

      {/* Main content with sidebar layout */}
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Always visible */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="space-y-6">
                {/* Search Input */}
                <div className="relative">
                  <label htmlFor="search-input" className="sr-only">
                    Tìm kiếm sản phẩm
                  </label>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
                            focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-3">Danh mục:</h3>
                  <div className="flex flex-col gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, category }))
                        }
                        className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition-all
                        ${
                          filters.category === category
                            ? "bg-purple-600 text-white"
                            : "bg-purple-50 text-gray-600 hover:bg-purple-100"
                        }`}>
                        {category === "all" ? "Tất cả" : category}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price Ranges */}
                <div className="space-y-4">
                  <h3 className="font-medium mb-3">Khoảng giá:</h3>
                  <div className="px-2">
                    {/* Min price slider */}
                    <input
                      type="range"
                      min={PRICE_RANGE.min}
                      max={PRICE_RANGE.max}
                      step={PRICE_RANGE.step}
                      value={minPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setMinPrice(
                          Math.min(value, maxPrice - PRICE_RANGE.step)
                        );
                      }}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer
               [&::-webkit-slider-thumb]:appearance-none
               [&::-webkit-slider-thumb]:w-4
               [&::-webkit-slider-thumb]:h-4
               [&::-webkit-slider-thumb]:bg-purple-600
               [&::-webkit-slider-thumb]:rounded-full
               [&::-webkit-slider-thumb]:cursor-pointer
               [&::-webkit-slider-thumb]:hover:bg-purple-700"
                    />

                    {/* Max price slider */}
                    <input
                      type="range"
                      min={PRICE_RANGE.min}
                      max={PRICE_RANGE.max}
                      step={PRICE_RANGE.step}
                      value={maxPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setMaxPrice(
                          Math.max(value, minPrice + PRICE_RANGE.step)
                        );
                      }}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer
               [&::-webkit-slider-thumb]:appearance-none
               [&::-webkit-slider-thumb]:w-4
               [&::-webkit-slider-thumb]:h-4
               [&::-webkit-slider-thumb]:bg-purple-600
               [&::-webkit-slider-thumb]:rounded-full
               [&::-webkit-slider-thumb]:cursor-pointer
               [&::-webkit-slider-thumb]:hover:bg-purple-700"
                    />
                  </div>

                  {/* Price range display */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Từ:</span>
                      <span className="font-medium text-purple-600">
                        {formatPrice(minPrice)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-sm text-gray-500">Đến:</span>
                      <span className="font-medium text-purple-600">
                        {formatPrice(maxPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sort Options Dropdown */}
                <div className="relative">
                  <h3 className="font-medium mb-3">Sắp xếp theo:</h3>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium text-left
              bg-purple-50 text-gray-600 hover:bg-purple-100 
              transition-all flex justify-between items-center">
                    <span>
                      {SORT_OPTIONS.find(
                        (option) => option.value === filters.sortBy
                      )?.label || "Mặc định"}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute z-10 w-full mt-2 bg-white border border-gray-100 
                  rounded-xl shadow-lg overflow-hidden">
                      {SORT_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, sortBy: value }));
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-purple-50 
                    transition-colors ${
                      filters.sortBy === value
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700"
                    }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilters({
                      category: "all",
                      sortBy: "default",
                    });
                    setMinPrice(PRICE_RANGE.min);
                    setMaxPrice(PRICE_RANGE.max);
                    setSearchTerm("");
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700
           border-2 border-purple-600 hover:border-purple-700 rounded-xl transition-colors">
                  Đặt lại bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Hiển thị {filteredProducts.length} sản phẩm
              </p>
            </div>

            {/* Product Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all 
                duration-300 overflow-hidden cursor-pointer group w-full"
                    onClick={() =>
                      window.open(product.affiliateLink, "_blank")
                    }>
                    {/* Product Image - Fixed Height */}
                    <div
                      className={`relative ${CARD_HEIGHTS.image} overflow-hidden`}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transform group-hover:scale-110 
                   transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 
                     flex items-center justify-center">
                          <Eye className="w-12 h-12 text-purple-400" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <span
                        className="absolute top-3 left-3 px-3 py-1 bg-white/90 
                    backdrop-blur-sm rounded-full text-sm font-medium 
                    text-purple-600">
                        {product.category || "Chưa phân loại"}
                      </span>
                    </div>

                    {/* Product Info Container - Fixed Layout */}
                    <div className="p-5 space-y-3">
                      {/* Title - Fixed Height */}
                      <div className={`${CARD_HEIGHTS.title}`}>
                        <h3
                          className="font-semibold text-gray-900 text-lg 
                    group-hover:text-purple-600 transition-colors 
                    line-clamp-2">
                          {product.name || "Sản phẩm chưa có tên"}
                        </h3>
                      </div>

                      {/* Description - Fixed Height */}
                      <div className={`${CARD_HEIGHTS.description}`}>
                        <p
                          className="text-sm text-gray-600 line-clamp-2 
                   group-hover:text-gray-900 transition-colors">
                          {product.description || "Chưa có mô tả chi tiết"}
                        </p>
                      </div>

                      {/* Price and Action - Fixed Height */}
                      <div
                        className={`${CARD_HEIGHTS.price} flex items-center justify-between`}>
                        <span
                          className="text-lg font-bold text-purple-600 
                      group-hover:text-purple-700 transition-colors">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                // Enhanced Empty State
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-16">
                  <div className="bg-white rounded-2xl p-12 shadow-sm">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Không tìm thấy sản phẩm
                    </h3>
                    <p className="text-gray-600">
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
            {filteredProducts.length > 0 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                {/* First page */}
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  currentPage === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Previous page */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  currentPage === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium
                  ${
                    currentPage === pageNum
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-purple-50"
                  }`}>
                    {pageNum + 1}
                  </button>
                ))}

                {/* Next page */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  currentPage === totalPages - 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L11.586 10l-4.293 4.293a1 1 0 000 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Last page */}
                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  currentPage === totalPages - 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M10.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Pagination */}
      </div>
    </div>
  );
};

export default AffiliatePage;
