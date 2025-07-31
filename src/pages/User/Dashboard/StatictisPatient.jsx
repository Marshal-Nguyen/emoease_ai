import React from "react";
import TaskProgressChart from "../../../components/Dashboard/Patient/TaskProgressChart";
import MedicalProfile from "../../../components/Dashboard/Patient/MedicalProfile";
import NotionPatient from "../../../components/Dashboard/Patient/NotionPatient";
import MentalHealthDashboard from "../../../components/Dashboard/Patient/MentalHealthDashboard ";
import { useSelector } from "react-redux";

const StatictisPatient = () => {
  const profileId = useSelector((state) => state.auth.profileId);

  return (
    <div className="min-h-screen bg-[#ffffff] p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-emerald-200/20 rounded-full blur-lg animate-bounce delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 relative z-10">
        {/* Left Column - Main Charts */}
        <div className="xl:col-span-8 space-y-4">
          {/* Task Progress Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Task Progress
                  </h2>
                  <p className="text-white/80 text-sm">
                    Daily achievements & milestones
                  </p>
                </div>
              </div>
            </div>
            <TaskProgressChart />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <MentalHealthDashboard />
          </div>
        </div>

        {/* Right Column - Profile & Notes */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <MedicalProfile patientId={profileId} />
          </div>

          {/* Notion Patient */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <NotionPatient />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatictisPatient;
