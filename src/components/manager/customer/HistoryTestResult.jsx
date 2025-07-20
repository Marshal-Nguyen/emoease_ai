import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import supabase from "../../../Supabase/supabaseClient";
import ReactMarkdown from "react-markdown";

const HistoryTestResult = () => {
  const [testResults, setTestResults] = useState([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const profileId = id; // Use id from params as profileId

  useEffect(() => {
    const fetchTestResults = async () => {
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

        console.log("Table connection test:", { tableCheck, tableError });

        // Query Supabase directly for ALL TestResults of this patient
        const { data, error: supabaseError } = await supabase
          .from("TestResults")
          .select("*")
          .eq("PatientId", profileId)
          .not("TakenAt", "is", null)
          .order("TakenAt", { ascending: false });

        console.log("Supabase query result:", { data, error: supabaseError });

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          throw new Error(`Supabase Error: ${supabaseError.message}`);
        }

        if (data && data.length > 0) {
          console.log("Test results found:", data.length, "records");

          // Transform Supabase data to match the expected format
          const transformedData = data.map((test) => {
            let recommendation = "No recommendation provided.";

            if (test.RecommendationJson) {
              try {
                if (typeof test.RecommendationJson === "string") {
                  const parsed = JSON.parse(test.RecommendationJson);
                  if (Array.isArray(parsed)) {
                    recommendation = parsed.join(". ");
                  } else if (typeof parsed === "string") {
                    recommendation = parsed;
                  } else if (parsed?.raw && typeof parsed.raw === "string") {
                    recommendation = parsed.raw;
                  } else {
                    recommendation = String(parsed);
                  }
                } else if (Array.isArray(test.RecommendationJson)) {
                  recommendation = test.RecommendationJson.join(". ");
                } else {
                  recommendation = String(test.RecommendationJson);
                }
              } catch (error) {
                console.error("Error parsing RecommendationJson:", error);
                recommendation = String(test.RecommendationJson);
              }
            }

            return {
              id: test.Id,
              patientId: test.PatientId,
              testId: test.TestId,
              takenAt: test.TakenAt,
              depressionScore: {
                value: test.DepressionScore || 0,
              },
              anxietyScore: {
                value: test.AnxietyScore || 0,
              },
              stressScore: {
                value: test.StressScore || 0,
              },
              severityLevel: test.SeverityLevel || "Normal",
              recommendation: recommendation,
              createdAt: test.CreatedAt,
              createdBy: test.CreatedBy,
            };
          });

          setTestResults(transformedData);
        } else {
          console.log("No test results found for this patient");
          setTestResults([]);
        }
      } catch (err) {
        console.error("Error fetching test results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchTestResults();
    } else {
      setLoading(false);
      setError("No profile ID available");
    }
  }, [profileId]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getScoreCategory = (score, type) => {
    if (type === "depression") {
      if (score <= 9) return "Normal";
      if (score <= 13) return "Mild";
      if (score <= 20) return "Moderate";
      if (score <= 27) return "Severe";
      return "Extremely Severe";
    } else if (type === "anxiety") {
      if (score <= 7) return "Normal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      if (score <= 19) return "Severe";
      return "Extremely Severe";
    } else if (type === "stress") {
      if (score <= 14) return "Normal";
      if (score <= 18) return "Mild";
      if (score <= 25) return "Moderate";
      if (score <= 33) return "Severe";
      return "Extremely Severe";
    }
    return "Unknown";
  };

  const getColorForCategory = (category) => {
    switch (category) {
      case "Normal":
        return "green";
      case "Mild":
        return "yellow";
      case "Moderate":
        return "orange";
      case "Severe":
        return "red";
      case "Extremely Severe":
        return "purple";
      default:
        return "gray";
    }
  };

  const getProgressPercentage = (score, type) => {
    const maxScores = {
      depression: 42,
      anxiety: 42,
      stress: 42,
    };
    return Math.min((score / maxScores[type]) * 100, 100);
  };

  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  if (!testResults || testResults.length === 0)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="mb-4">
            <Info size={48} className="text-gray-400 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có kết quả test nào
          </h3>
          <p className="text-gray-500">
            Người dùng này chưa thực hiện bài test nào. Kết quả test sẽ hiển thị
            ở đây khi có.
          </p>
        </div>
      </div>
    );

  const selectedTest = testResults[selectedTestIndex];

  let recommendations = [];

  if (selectedTest.recommendation) {
    try {
      const raw = selectedTest.recommendation;

      if (typeof raw === "string") {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          recommendations = parsed;
        } else if (typeof parsed === "string") {
          recommendations = [parsed];
        } else if (parsed?.raw && typeof parsed.raw === "string") {
          recommendations = [parsed.raw];
        } else {
          recommendations = [String(parsed)];
        }
      } else {
        recommendations = [String(raw)];
      }
    } catch (error) {
      // Nếu recommendation là markdown hoặc text thường thì vẫn fallback an toàn
      recommendations = [selectedTest.recommendation];
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
    <div className="flex h-full overflow-y-auto bg-[#ffffff]">
      {/* Test History Panel */}
      <div className="w-1/3 bg-white shadow-md overflow-y-auto">
        {/* <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          Test History
        </h2> */}
        <div className="space-y-3 overflow-y-auto pr-2 ">
          {testResults.map((test, index) => (
            <div
              key={`${test.id}-${index}`}
              className={`p-4 rounded-lg transition-all duration-200 ${
                selectedTestIndex === index
                  ? "bg-blue-50 border-l-4 border-blue-500 shadow-md"
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }`}
              onClick={() => setSelectedTestIndex(index)}
            >
              <div className="font-medium text-gray-800">
                Test on {formatDate(test.takenAt)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Level: {test.severityLevel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Details Panel */}
      <div className="w-2/3 p-4 bg-white overflow-y-auto">
        {/* <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          Test Details
        </h2> */}

        {/* Depression Score */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Depression</h3>
            <span className="text-sm text-gray-600">DASS-21</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className={`bg-${getColorForCategory(
                getScoreCategory(
                  selectedTest.depressionScore.value,
                  "depression"
                )
              )}-500 h-2.5 rounded-full`}
              style={{
                width: `${getProgressPercentage(
                  selectedTest.depressionScore.value,
                  "depression"
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Score: {selectedTest.depressionScore.value}
            </span>
            <span
              className={`text-${getColorForCategory(
                getScoreCategory(
                  selectedTest.depressionScore.value,
                  "depression"
                )
              )}-500`}
            >
              {getScoreCategory(
                selectedTest.depressionScore.value,
                "depression"
              )}
            </span>
          </div>
        </div>

        {/* Anxiety Score */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Anxiety</h3>
            <span className="text-sm text-gray-600">DASS-21</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className={`bg-${getColorForCategory(
                getScoreCategory(selectedTest.anxietyScore.value, "anxiety")
              )}-500 h-2.5 rounded-full`}
              style={{
                width: `${getProgressPercentage(
                  selectedTest.anxietyScore.value,
                  "anxiety"
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Score: {selectedTest.anxietyScore.value}
            </span>
            <span
              className={`text-${getColorForCategory(
                getScoreCategory(selectedTest.anxietyScore.value, "anxiety")
              )}-500`}
            >
              {getScoreCategory(selectedTest.anxietyScore.value, "anxiety")}
            </span>
          </div>
        </div>

        {/* Stress Score */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Stress</h3>
            <span className="text-sm text-gray-600">DASS-21</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className={`bg-${getColorForCategory(
                getScoreCategory(selectedTest.stressScore.value, "stress")
              )}-500 h-2.5 rounded-full`}
              style={{
                width: `${getProgressPercentage(
                  selectedTest.stressScore.value,
                  "stress"
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Score: {selectedTest.stressScore.value}
            </span>
            <span
              className={`text-${getColorForCategory(
                getScoreCategory(selectedTest.stressScore.value, "stress")
              )}-500`}
            >
              {getScoreCategory(selectedTest.stressScore.value, "stress")}
            </span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <div className="flex items-start">
            <div className="mr-3">
              <Info size={24} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Important Note</h3>
              <div className="space-y-4 text-gray-700">
                {recommendations.map((text, index) => (
                  <div key={index} className="prose max-w-none">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTestResult;
