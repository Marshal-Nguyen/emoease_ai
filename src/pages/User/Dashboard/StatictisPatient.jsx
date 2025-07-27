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

      {/* Header Section */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mental Health Statistics
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-emerald-600 font-semibold">
                  System Healthy
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-sm text-gray-700 font-semibold">
                Active Session
              </span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4 4h7l5 5v3"
                />
              </svg>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-lg font-medium">
          🌟 Track your mental wellness journey
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        {/* Left Column - Main Charts */}
        <div className="xl:col-span-8 space-y-8">
          {/* Task Progress Chart */}
          {/* <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
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
            <div className="p-8">
              <TaskProgressChart />
            </div>
          </div> */}

          {/* Mental Health Dashboard */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 -translate-x-20"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform duration-300">
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Mental Health Dashboard
                  </h2>
                  <p className="text-white/80 text-sm">
                    💚 Wellness insights & analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <MentalHealthDashboard />
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Notes */}
        <div className="xl:col-span-4 space-y-6">
          {/* Medical Profile */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <div className="bg-gradient-to-r  from-orange-500 via-red-500 to-pink-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 translate-x-12"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:rotate-6 transition-transform duration-300">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Medical Profile
                  </h2>
                  <p className="text-white/80 text-sm">
                    🩺 Personal health data
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <MedicalProfile patientId={profileId} />
            </div>
          </div>

          {/* Notion Patient */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 overflow-hidden group hover:scale-[1.02] transform">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:-rotate-6 transition-transform duration-300">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Medical Record
                  </h2>
                  <p className="text-white/80 text-sm">📋 Treatment history</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <NotionPatient />
            </div>
          </div>

          {/* Quick Stats Card */}
          {/* <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transform transition-all duration-500">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-500"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Quick Stats</h3>
                </div>
                <div className="text-4xl">⚡</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <span className="text-white/90 font-medium">
                      Weekly Activity
                    </span>
                  </div>
                  <span className="font-bold text-xl">85%</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">😊</span>
                    <span className="text-white/90 font-medium">
                      Mood Score
                    </span>
                  </div>
                  <span className="font-bold text-xl">7.2/10</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔥</span>
                    <span className="text-white/90 font-medium">
                      Current Streak
                    </span>
                  </div>
                  <span className="font-bold text-xl">12 days</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <span className="text-white/90 font-medium">
                      Goals Achieved
                    </span>
                  </div>
                  <span className="font-bold text-xl">9/12</span>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StatictisPatient;
