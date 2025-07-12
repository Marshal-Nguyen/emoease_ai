import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = "https://vietnamlabs.com";

export const AddressQuestion = React.forwardRef(
  ({ onAddressChange, onSubmit, isSubmitting }, ref) => {
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [province, setProvince] = useState("");
    const [ward, setWard] = useState("");
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Lấy danh sách tỉnh khi mount
    useEffect(() => {
      setLoadingProvinces(true);
      fetch(`${BASE_URL}/api/vietnamprovince`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setProvinces(data.data.map((item) => item.province));
          }
        })
        .finally(() => setLoadingProvinces(false));
    }, []);

    // Lấy danh sách phường/xã khi chọn tỉnh
    useEffect(() => {
      setWard("");
      setWards([]);
      if (province) {
        setLoadingWards(true);
        fetch(
          `${BASE_URL}/api/vietnamprovince?province=${encodeURIComponent(
            province
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data && Array.isArray(data.data.wards)) {
              setWards(data.data.wards);
            }
          })
          .finally(() => setLoadingWards(false));
      }
    }, [province]);

    // Merge và submit
    const handleSubmit = () => {
      if (!province || !ward) return;
      const merged = `${province} - ${ward}`;
      console.log("Submitting address:", merged);
      onSubmit && onSubmit(merged);
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col justify-center items-center p-4 relative z-10">
        <motion.h1
          className="text-xl md:text-3xl text-white font-bold mb-8 mt-4 text-center relative leading-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Bạn đang ở đâu để EmoEase hỗ trợ tốt hơn?
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
          className="w-full max-w-lg md:max-w-xl mb-8 flex flex-col gap-4"
          style={{ maxWidth: "100vw" }}>
          <select
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white text-base md:text-lg focus:ring-2 focus:ring-purple-400 transition"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            disabled={loadingProvinces}>
            <option value="">
              {loadingProvinces ? "Đang tải tỉnh/thành..." : "Chọn tỉnh thành"}
            </option>
            {provinces.map((p) => (
              <option key={p} value={p} className="text-black">
                {p}
              </option>
            ))}
          </select>
          <select
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white text-base md:text-lg focus:ring-2 focus:ring-purple-400 transition"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            disabled={!province || loadingWards}>
            <option value="">
              {province
                ? loadingWards
                  ? "Đang tải phường/xã..."
                  : "Chọn phường xã"
                : "Chọn tỉnh thành trước"}
            </option>
            {wards.slice(0, 10).map((w) => (
              <option key={w.name} value={w.name} className="text-black">
                {w.name}
              </option>
            ))}
          </select>
          {/* Hiển thị mergedFrom nếu có */}
          {ward && (
            <div className="text-white/80 text-sm mt-1 px-2">
              {wards.find((w) => w.name === ward)?.mergedFrom?.length > 1 && (
                <>
                  <span className="font-semibold text-purple-200">Gộp từ:</span>{" "}
                  {wards.find((w) => w.name === ward)?.mergedFrom.join(", ")}
                </>
              )}
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={isSubmitting || !province || !ward}
          className="mt-2 px-7 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 flex items-center gap-4 hover:from-purple-600 hover:to-pink-600 hover:scale-105 active:scale-95 disabled:opacity-50">
          <span>{isSubmitting ? "Đang xử lý..." : "Tiếp tục nhé"}</span>
          {!isSubmitting && (
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
          {isSubmitting && (
            <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          )}
        </motion.button>
      </motion.div>
    );
  }
);

export default AddressQuestion;
