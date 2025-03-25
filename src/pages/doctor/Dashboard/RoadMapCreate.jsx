import React, { useState, useEffect } from "react";
import TreatmentActivities from "../../../components/Dashboard/Doctor/TreatmentActivities";
import MedicalHistory from "../../../components/Dashboard/Doctor/MedicalHistory";
import { useSelector } from "react-redux";
const RoadMapCreate = () => {
  const [activeTab, setActiveTab] = useState("Treatment");
  const profileId = useSelector((state) => state.auth.profileId);
  return (
    <div className=" h-screen rounded-xl px-8 pt-4 flex flex-col">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit mb-2">
        <button
          type="button"
          onClick={() => setActiveTab("Treatment")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "Treatment"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}>
          <div className="flex flex-col items-center">
            <span>Treatment Activities</span>
            <span className="text-xs text-gray-500">
              View and manage roadmap
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Medical")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "Medical"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}>
          <div className="flex flex-col items-center">
            <span>Medical History</span>
            <span className="text-xs text-gray-500">
              Review medical records
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-white rounded-xl ">
        <div className="h-full">
          {activeTab === "Treatment" && (
            <TreatmentActivities profileId={profileId} />
          )}
          {activeTab === "Medical" && <MedicalHistory />}
        </div>
      </div>
    </div>
  );
};

export default RoadMapCreate;
