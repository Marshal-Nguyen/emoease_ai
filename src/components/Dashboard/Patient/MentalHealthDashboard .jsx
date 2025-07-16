import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import supabase from "../../../Supabase/supabaseClient";
import ReactMarkdown from "react-markdown";

const MentalHealthDashboard = () => {
  const [latestTest, setLatestTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileId = useSelector((state) => state.auth.profileId);

  useEffect(() => {
    const fetchLatestTestResult = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!profileId) {
          throw new Error("Profile ID is required");
        }

        console.log("Fetching test results for profileId:", profileId);

        // First, let's check if we can connect to Supabase and see what tables exist
        const { data: tableCheck, error: tableError } = await supabase
          .from("TestResults")
          .select("Id, PatientId")
          .limit(1);

        console.log("Table connection test:", { tableCheck, tableError });

        // Query Supabase directly for TestResults
        const { data, error: supabaseError } = await supabase
          .from("TestResults")
          .select("*")
          .eq("PatientId", profileId)
          .not("TakenAt", "is", null)
          .order("TakenAt", { ascending: false })
          .limit(1);

        console.log("Supabase query result:", { data, error: supabaseError });

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          throw new Error(`Supabase Error: ${supabaseError.message}`);
        }

        if (data && data.length > 0) {
          console.log("Latest test result:", data[0]);
          setLatestTest(data[0]);
        } else {
          console.log("No test results found for this patient");

          // For testing purposes, let's create mock data
          const mockTestResult = {
            Id: "mock-test-id",
            PatientId: profileId,
            TestId: "mock-assessment-id",
            TakenAt: new Date().toISOString(),
            DepressionScore: 12,
            AnxietyScore: 8,
            StressScore: 15,
            SeverityLevel: "Mild",
            RecommendationJson: JSON.stringify([
              "Practice regular meditation and mindfulness exercises",
              "Maintain a consistent sleep schedule of 7-8 hours per night",
              "Engage in regular physical activity such as walking or light exercise",
              "Consider talking to a mental health professional if symptoms persist",
            ]),
            CreatedAt: new Date().toISOString(),
            CreatedBy: "System",
          };

          console.log("Using mock data:", mockTestResult);
          setLatestTest(mockTestResult);
        }
      } catch (err) {
        console.error("Error fetching test results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchLatestTestResult();
    } else {
      setLoading(false);
      setError("No profile ID available");
    }
  }, [profileId]);

  // Format the scores to always have 2 digits
  const formatScore = (score) => {
    return score < 10 ? `0${score}` : `${score}`;
  };

  // Get severity level and color based on score
  const getSeverityInfo = (score, type) => {
    let severity, colorClass;

    if (score <= 9) {
      severity = "Normal";
      colorClass = "text-green-600";
    } else if (score <= 13) {
      severity = "Mild";
      colorClass = "text-yellow-600";
    } else if (score <= 20) {
      severity = "Moderate";
      colorClass = "text-orange-600";
    } else if (score <= 27) {
      severity = "Severe";
      colorClass = "text-red-600";
    } else {
      severity = "Extremely Severe";
      colorClass = "text-red-800";
    }

    return { severity, colorClass };
  };

  console.log("Latest test data:", latestTest);

  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading test results...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error loading test results: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );

  if (!latestTest)
    return (
      <div className="text-center py-10">
        <div className="bg-blue-50 rounded-lg p-6 mb-4">
          <svg
            className="w-12 h-12 text-blue-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium">
            No test results found for this patient.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Please take a mental health assessment first to see your results
            here.
          </p>
          <button
            onClick={() => (window.location.href = "/assessment")}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take Assessment
          </button>
        </div>
        <div className="text-xs text-gray-400">
          Profile ID: {profileId || "Not found"}
        </div>
      </div>
    );

  // Extract needed data from the latest test result
  const depressionScore = latestTest.DepressionScore || 0;
  const anxietyScore = latestTest.AnxietyScore || 0;
  const stressScore = latestTest.StressScore || 0;
  const severityLevel = latestTest.SeverityLevel || "Unknown";
  const testDate = latestTest.TakenAt
    ? new Date(latestTest.TakenAt).toLocaleDateString()
    : "Unknown date";
  const createdDate = latestTest.CreatedAt
    ? new Date(latestTest.CreatedAt).toLocaleDateString()
    : null;

  console.log("Rendering with data:", {
    depressionScore,
    anxietyScore,
    stressScore,
    severityLevel,
    testDate,
    latestTest,
  });

  // Parse RecommendationJson if it exists
  let recommendations = [];

  if (latestTest.RecommendationJson) {
    try {
      if (typeof latestTest.RecommendationJson === "string") {
        const parsed = JSON.parse(latestTest.RecommendationJson);
        if (Array.isArray(parsed)) {
          recommendations = parsed;
        } else if (typeof parsed === "string") {
          recommendations = [parsed];
        } else if (parsed?.raw && typeof parsed.raw === "string") {
          recommendations = [parsed.raw];
        } else {
          recommendations = [String(parsed)];
        }
      } else if (Array.isArray(latestTest.RecommendationJson)) {
        recommendations = latestTest.RecommendationJson;
      } else {
        recommendations = [String(latestTest.RecommendationJson)];
      }
    } catch (error) {
      console.error("Error parsing RecommendationJson:", error);
      recommendations = [String(latestTest.RecommendationJson)];
    }
  }

  if (recommendations.length === 0) {
    recommendations = [
      "Engage in relaxation techniques (deep breathing, meditation, light physical activities)",
      "Adjust lifestyle habits, focusing on sleep and nutrition",
      "If symptoms persist or worsen, seeking professional psychological support is advised",
    ];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 bg-[#fff0]">
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">
              Debug Info (Click to expand)
            </summary>
            <pre className="mt-2 overflow-auto">
              Profile ID: {profileId}
              {"\n"}Latest Test: {JSON.stringify(latestTest, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Test Date Info */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Latest Test Result - <span className="font-semibold">{testDate}</span>
        </p>
        {createdDate && createdDate !== testDate && (
          <p className="text-xs text-gray-500">Created: {createdDate}</p>
        )}
        {severityLevel !== "Unknown" && (
          <p className="text-sm font-medium mt-1">
            Overall Severity:{" "}
            <span
              className={`${
                getSeverityInfo(
                  Math.max(depressionScore, anxietyScore, stressScore)
                ).colorClass
              }`}
            >
              {severityLevel}
            </span>
          </p>
        )}
      </div>

      {/* Score Cards Container */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Depression Card */}
        <div className="w-40 rounded-xl overflow-hidden shadow-md bg-white">
          <div className="bg-indigo-400 p-2 text-center">
            <h3 className="text-white font-bold italic">Depression</h3>
          </div>
          <div className="p-6 flex flex-col justify-center items-center">
            <span className="text-5xl text-indigo-500 font-bold italic mb-2">
              {formatScore(depressionScore)}
            </span>
            <span
              className={`text-xs font-semibold ${
                getSeverityInfo(depressionScore).colorClass
              }`}
            >
              {getSeverityInfo(depressionScore).severity}
            </span>
          </div>
        </div>

        {/* Anxiety Card */}
        <div className="w-40 rounded-xl overflow-hidden shadow-md bg-white border-2 border-emerald-400">
          <div className="bg-emerald-400 p-2 text-center">
            <h3 className="text-white font-bold italic">Anxiety</h3>
          </div>
          <div className="p-6 flex flex-col justify-center items-center">
            <span className="text-5xl text-emerald-600 font-bold italic mb-2">
              {formatScore(anxietyScore)}
            </span>
            <span
              className={`text-xs font-semibold ${
                getSeverityInfo(anxietyScore).colorClass
              }`}
            >
              {getSeverityInfo(anxietyScore).severity}
            </span>
          </div>
        </div>

        {/* Stress Card */}
        <div className="w-40 rounded-xl overflow-hidden shadow-md bg-white">
          <div className="bg-amber-300 p-2 text-center">
            <h3 className="text-white font-bold italic">Stress</h3>
          </div>
          <div className="p-6 flex flex-col justify-center items-center">
            <span className="text-5xl text-amber-600 font-bold italic mb-2">
              {formatScore(stressScore)}
            </span>
            <span
              className={`text-xs font-semibold ${
                getSeverityInfo(stressScore).colorClass
              }`}
            >
              {getSeverityInfo(stressScore).severity}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-xl px-6 py-3 shadow-sm mt-4">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Recommendations:
        </h2>
        <div className="h-96 overflow-y-auto italic">
          <div className="space-y-4">
            {recommendations.map((text, index) => (
              <div key={index} className="prose max-w-none">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Details */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Test ID: {latestTest.Id} | Patient ID: {latestTest.PatientId}
        </p>
        {latestTest.TestId && (
          <p className="text-xs text-gray-500">
            Assessment ID: {latestTest.TestId}
          </p>
        )}
        {latestTest.CreatedBy && (
          <p className="text-xs text-gray-500">
            Created by: {latestTest.CreatedBy}
          </p>
        )}
      </div>
    </div>
  );
};

export default MentalHealthDashboard;
