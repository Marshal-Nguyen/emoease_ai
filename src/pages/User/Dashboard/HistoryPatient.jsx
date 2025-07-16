import React, { useState, useEffect } from "react";
import HistoryTestResult from "../../../components/Dashboard/Patient/HistoryTestResult";
import HistoryBooking from "../../../components/Dashboard/Patient/HistoryBooking";

const HistoryPatient = () => {
  const [activeTab, setActiveTab] = useState("Result");

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 h-screen rounded-xl p-8 flex flex-col shadow-lg">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("Result")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "Result"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center">
            <span>Test Results</span>
            <span className="text-xs text-gray-500">
              View your DASS-21 history
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Booking")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "Booking"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center">
            <span>Bookings</span>
            <span className="text-xs text-gray-500">
              View appointment history
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="h-full p-6">
          {activeTab === "Result" && <HistoryTestResult />}
          {activeTab === "Booking" && <HistoryBooking />}
        </div>
      </div>
    </div>
  );
};

export default HistoryPatient;
