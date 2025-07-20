import React from "react";
import TaskProgressChart from "../../../components/Dashboard/Patient/TaskProgressChart";
import MedicalProfile from "../../../components/Dashboard/Patient/MedicalProfile";
import NotionPatient from "../../../components/Dashboard/Patient/NotionPatient";
import MentalHealthDashboard from "../../../components/Dashboard/Patient/MentalHealthDashboard ";
import { useSelector } from "react-redux";

const StatictisPatient = () => {
  const profileId = useSelector((state) => state.auth.profileId);

  return (
    <div className="min-h-screen  p-6 rounded-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mental Health Statistics
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 font-medium">Active</span>
          </div>
        </div>
        <p className="text-gray-600">
          Track your progress and overall health overview
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Main Charts */}
        <div className="xl:col-span-8 space-y-6">
          {/* Task Progress Chart */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Task Progress
                </h2>
              </div>
            </div>
            <div className="p-6">
              <TaskProgressChart />
            </div>
          </div>

          {/* Mental Health Dashboard */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Mental Health Dashboard
                </h2>
              </div>
            </div>
            <div className="p-6">
              <MentalHealthDashboard />
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Notes */}
        <div className="xl:col-span-4 space-y-6">
          {/* Medical Profile */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Medical Profile
                </h2>
              </div>
            </div>
            <div className="p-6">
              <MedicalProfile patientId={profileId} />
            </div>
          </div>

          {/* Notion Patient */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Medical Record</h2>
              </div>
            </div>
            <div className="p-6">
              <NotionPatient />
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Stats</h3>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
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
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Weekly Activity</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Average Mood Score</span>
                <span className="font-bold">7.2/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Current Streak</span>
                <span className="font-bold">12 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatictisPatient;
