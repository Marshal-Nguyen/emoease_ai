import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import supabase from "../../../Supabase/supabaseClient";
import ReactMarkdown from "react-markdown";

const MentalHealthDashboard = () => {
  const [latestTest, setLatestTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileId = useSelector((state) => state.auth.profileId);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchLatestTestResult = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!profileId) {
          throw new Error("Profile ID is required");
        }

        // First, let's check if we can connect to Supabase and see what tables exist
        const { data: tableCheck, error: tableError } = await supabase
          .from("TestResults")
          .select("Id, PatientId")
          .limit(1);

        // Query Supabase directly for TestResults
        const { data, error: supabaseError } = await supabase
          .from("TestResults")
          .select("*")
          .eq("PatientId", profileId)
          .not("TakenAt", "is", null)
          .order("TakenAt", { ascending: false })
          .limit(1);

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
            TakenAt: null,
            DepressionScore: null,
            AnxietyScore: null,
            StressScore: null,
            SeverityLevel: "",
            RecommendationJson: JSON.stringify([]),
            CreatedAt: null,
            CreatedBy: null,
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 bg-[#fff0] p-5 rounded-2xl shadow-lg border-l-4 border-purple-500">
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
              {typeof depressionScore === "number"
                ? formatScore(depressionScore)
                : "N/A"}
            </span>
            <span
              className={`text-xs font-semibold ${
                typeof depressionScore === "number"
                  ? getSeverityInfo(depressionScore).colorClass
                  : "text-gray-400"
              }`}
            >
              {typeof depressionScore === "number"
                ? getSeverityInfo(depressionScore).severity
                : "Unknown"}
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
      {/* <div> */}
      {recommendations && recommendations.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-center">
            Recommendations:
          </h2>

          <div
            className={`space-y-6 ${
              !showAll ? "max-h-96 overflow-hidden" : ""
            }`}
          >
            {recommendations.map((text, index) => (
              <div key={index} className=" pb-5">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-xl font-bold text-purple-700 mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-lg font-semibold text-purple-600 mt-3 mb-2"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-base font-semibold text-indigo-600 mt-2 mb-1"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-gray-700 mb-2" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-4 text-gray-700" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong
                        className="text-pink-600 font-semibold"
                        {...props}
                      />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="text-indigo-500" {...props} />
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            ))}
          </div>

          {recommendations.length === 1 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-purple-600 hover:underline font-medium"
              >
                {showAll ? "Thu gọn ▲" : "Hiển thị thêm ▼"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-300 rounded animate-pulse" />
            ))}
          </div>
          <p className="text-gray-500 text-center mt-4 italic">
            No recommendations available
          </p>
        </div>
      )}
    </div>
    // </div>
  );
};

export default MentalHealthDashboard;
