import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";

export const IndustryQuestion = React.forwardRef(
  (
    {
      selectedIndustry,
      onIndustrySelect,
      onSubmit,
      isSubmitting = false,
      industries = [],
      total = 0,
      currentPage = 1,
      onLoadMore,
      isLoadingMore = false,
    },
    ref
  ) => {
    const [filteredIndustries, setFilteredIndustries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Sync filteredIndustries with industries and search
    useEffect(() => {
      if (!searchQuery) {
        setFilteredIndustries(industries);
      } else {
        handleSearch(searchQuery);
      }
      // eslint-disable-next-line
    }, [industries]);

    // Search handler with debounce
    const handleSearch = useCallback(
      debounce((query) => {
        const lowerQuery = query.toLowerCase();
        const filtered = industries.filter((industry) =>
          industry.label.toLowerCase().includes(lowerQuery)
        );
        setFilteredIndustries(filtered);
      }, 300),
      [industries]
    );

    // Update search query and trigger filtering
    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      handleSearch(query);
    };

    // Select industry handler (single selection)
    const handleSelectIndustry = (value) => {
      onIndustrySelect(value);
    };

    // Load more industries
    const handleLoadMore = () => {
      if (onLoadMore && industries.length < total) {
        onLoadMore();
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
        <motion.h1
          className="text-xl sm:text-3xl text-white font-bold mb-5 text-center relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Ngành nghề hiện tại của bạn là gì?
          </span>
          <motion.div
            className="absolute -bottom-2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-400 to-white rounded-full"
            style={{ transform: "translateX(-50%)" }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "4rem", opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-4/5 max-w-3xl mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm ngành nghề..."
            className="w-full px-4 py-2 mb-5 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </motion.div>

        {/* Responsive grid, scrollable on small screens, 1-3 columns */}
        <div
          className={`
            relative w-full max-w-3xl
            h-[288px] sm:h-[288px] xl:h-[288px]
            overflow-y-auto custom-scrollbar hide-scrollbar px-2 sm:px-4
            overflow-x-auto
          `}>
          <div
            className={`
              grid gap-3
              min-w-[320px]
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3
            `}
            style={{ minWidth: 320 }}>
            {filteredIndustries.map((industry) => (
              <motion.div
                key={industry.value}
                className="snap-start py-1 h-[65px] flex items-center"
                initial={{ scale: 0.9, opacity: 0.6 }}
                whileInView={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  },
                }}
                viewport={{
                  once: false,
                  amount: 0.8,
                  margin: "-5%",
                }}>
                <div
                  onClick={() => handleSelectIndustry(industry.value)}
                  className={`
                    bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer
                    transform transition-all duration-300 w-full
                    hover:bg-white/20 hover:-translate-y-1
                    ${
                      selectedIndustry === industry.value
                        ? "ring-2 ring-blue-400 bg-white/30 scale-105"
                        : "hover:scale-[1.02]"
                    }
                    flex items-center mx-auto h-[65px]
                    xl:hover:shadow-xl
                  `}>
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-3xl">💼</span>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        {industry.label}
                      </h3>
                    </div>
                    {selectedIndustry === industry.value && (
                      <span className="text-blue-400 text-xl">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {industries.length < total && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="mt-4 px-4 hover:cursor-pointer py-2 bg-white/20 text-white rounded-lg transition-all disabled:opacity-50">
            {isLoadingMore ? (
              <>
                <span>Đang tải...</span>
                <div className="inline-block h-4 w-4 ml-2 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              "Tải thêm"
            )}
          </motion.button>
        )}
      </motion.div>
    );
  }
);

export default IndustryQuestion;
