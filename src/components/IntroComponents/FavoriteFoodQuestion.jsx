import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";

export const FavoriteFoodQuestion = React.forwardRef(
  (
    {
      selectedFoods,
      onFoodSelect,
      onSubmit,
      isLoading = false,
      foods = [],
      total = 0,
      currentPage = 1,
      onLoadMore,
      isLoadingMore = false,
    },
    ref
  ) => {
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [selectedFoodsState, setSelectedFoodsState] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Sync internal state with props
    useEffect(() => {
      if (selectedFoods) {
        setSelectedFoodsState(
          Array.isArray(selectedFoods) ? selectedFoods : [selectedFoods]
        );
      } else {
        setSelectedFoodsState([]);
      }
    }, [selectedFoods]);

    // Sync filteredFoods with foods and search
    useEffect(() => {
      if (!searchQuery) {
        setFilteredFoods(foods);
      } else {
        handleSearch(searchQuery);
      }
      // eslint-disable-next-line
    }, [foods]);

    // Search handler with debounce
    const handleSearch = useCallback(
      debounce((query) => {
        const lowerQuery = query.toLowerCase();
        const filtered = foods.filter(
          (food) =>
            food.label.toLowerCase().includes(lowerQuery) ||
            food.description.toLowerCase().includes(lowerQuery) ||
            (food.mealTime || "").toLowerCase().includes(lowerQuery) ||
            (food.nutrients || []).some((nutrient) =>
              nutrient.toLowerCase().includes(lowerQuery)
            ) ||
            (food.categories || []).some((category) =>
              category.toLowerCase().includes(lowerQuery)
            )
        );
        setFilteredFoods(filtered);
      }, 300),
      [foods]
    );

    // Update search query and trigger filtering
    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      handleSearch(query);
    };

    // Select food handler (no limit)
    const handleSelectFood = (value) => {
      let updatedFoods;
      if (selectedFoodsState.includes(value)) {
        updatedFoods = selectedFoodsState.filter((id) => id !== value);
      } else {
        updatedFoods = [...selectedFoodsState, value];
      }
      setSelectedFoodsState(updatedFoods);
      onFoodSelect(updatedFoods);
    };

    // Load more foods
    const handleLoadMore = () => {
      if (onLoadMore && foods.length < total) {
        onLoadMore();
      }
    };

    // Submit handler
    const handleSubmit = () => {
      if (selectedFoodsState.length === 0 && foods.length > 0) {
        const defaultFood = [foods[0].value];
        setSelectedFoodsState(defaultFood);
        onFoodSelect(defaultFood);
      }
      if (onSubmit) {
        onSubmit();
      }
    };

    if (isLoading && currentPage === 1) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-3 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-3 text-sm">Đang tải món ăn...</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
        <motion.h1
          className="text-xl sm:text-2xl text-white font-bold mb-5 text-center relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            "Bạn thường ưu tiên loại thực phẩm nào cho sức khỏe tinh thần hoặc
            thể chất?"
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
            placeholder="Tìm kiếm món ăn, danh mục, hoặc chất dinh dưỡng..."
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
            {filteredFoods.map((food) => (
              <motion.div
                key={food.value}
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
                  onClick={() => handleSelectFood(food.value)}
                  className={`
                    bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer
                    transform transition-all duration-300 w-full
                    hover:bg-white/20 hover:-translate-y-1
                    ${
                      selectedFoodsState.includes(food.value)
                        ? "ring-2 ring-blue-400 bg-white/30 scale-105"
                        : "hover:scale-[1.02]"
                    }
                    flex items-center mx-auto h-[65px]
                    xl:hover:shadow-xl
                  `}>
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-3xl">{getFoodIcon(food.label)}</span>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        {food.label}
                      </h3>
                      <p className="text-white/70 text-xs line-clamp-1 truncate">
                        {food.description}
                      </p>
                      <p className="text-white/60 text-xs line-clamp-1 truncate">
                        {food.mealTime} |{" "}
                        {food.nutrients?.join(", ") ||
                          "Không có chất dinh dưỡng"}{" "}
                        | {food.categories?.join(", ") || "Không có danh mục"}
                      </p>
                    </div>
                    {selectedFoodsState.includes(food.value) && (
                      <span className="text-blue-400 text-xl">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {foods.length < total && (
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

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.03,
            backdropFilter: "blur(12px)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-6 px-5 py-3
            bg-[#602985]/10 backdrop-blur-md
            border-2 border-[#602985]/30
            text-white rounded-xl
            transition-all duration-300
            flex items-center gap-4
            shadow-[0_4px_20px_rgba(96,41,133,0.2)]
            hover:bg-[#602985]/20
            hover:border-[#602985]/50
            hover:shadow-[0_8px_25px_rgba(96,41,133,0.3)]
            disabled:opacity-50
            group">
          <span className="text-lg font-medium tracking-wide">
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="bg-[#ffffff9d] backdrop-blur-md 
              px-3 py-1 rounded-full text-sm text-[#602985]
              border border-[#602985]/30 font-medium">
              {selectedFoodsState.length}
            </span>
            {!isLoading && (
              <motion.svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                animate={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </motion.svg>
            )}
            {isLoading && (
              <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </motion.button>
      </motion.div>
    );
  }
);

// Helper function to map food categories to icons
const getFoodIcon = (name) => {
  if (!name) return "🍽️";
  const foodName = name.toLowerCase();

  // Custom mapping for specific foods
  if (foodName.includes("cá hồi")) return "🐟";
  if (foodName.includes("cá mòi")) return "🐟";
  if (foodName.includes("dầu ô liu")) return "🫒";
  if (foodName.includes("gạo lứt")) return "🍚";
  if (foodName.includes("hạnh nhân")) return "🌰";
  if (foodName.includes("hạt chia")) return "🌱";
  if (foodName.includes("nghệ")) return "🧄";
  if (foodName.includes("nước")) return "💧";
  if (foodName.includes("rau bina")) return "🥬";
  if (foodName.includes("sữa chua")) return "🥛";
  if (foodName.includes("thịt bò")) return "🥩";
  if (foodName.includes("thịt gà")) return "🍗";
  if (foodName.includes("trà xanh")) return "🍵";
  if (foodName.includes("trứng")) return "🥚";

  // Existing logic
  if (foodName.includes("vegetarian")) return "🥗";
  if (
    foodName.includes("meat") ||
    foodName.includes("beef") ||
    foodName.includes("pork")
  )
    return "🍖";
  if (foodName.includes("dessert") || foodName.includes("sweet")) return "🍰";
  if (foodName.includes("snack")) return "🥜";
  return "🍽️";
};

export default FavoriteFoodQuestion;
