import { useEffect, useState, useCallback } from "react";
import arrowDownAnimation from "../../../util/icon/arrowDown.json";
import alertIcon from "../../../util/icon/alertOctagon.json";
import Lottie from "lottie-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Thêm axios

// Color mapping based on the API response values
const colorMap = {
  "Did not apply to me at all": "bg-green-500 border-green-700",
  "Applied to me to some degree": "bg-yellow-500 border-yellow-700",
  "Applied to me to a considerable degree": "bg-orange-500 border-orange-700",
  "Applied to me very much": "bg-red-500 border-red-700",
};

// Text color mapping for better contrast
const textColorMap = {
  "Did not apply to me at all": "text-white",
  "Applied to me to some degree": "text-white",
  "Applied to me to a considerable degree": "text-white",
  "Applied to me very much": "text-white",
};

const TestEmotion = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [recommend, setRecommend] = useState(null);
  const [scores, setScores] = useState({
    depression: 0,
    anxiety: 0,
    stress: 0,
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const patientId = useSelector((state) => state.auth.profileId);
  const testId = "093b2667-6fe8-4ab5-be07-a2e603fdaa66";

  const API_TEST = import.meta.env.VITE_API_TEST_URL; // Lấy API Test từ .env
  const API_KEY = import.meta.env.VITE_API_GPT_KEY; // Lấy API Key từ .env
  const YOUR_TOKEN = localStorage.getItem("token");
  // Fetch initial question list
  useEffect(() => {
    async function fetchQuestionList() {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/tests/${testId}/questions?pageIndex=1&pageSize=21`,
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${YOUR_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        const sortedQuestions = data.testQuestions.data.sort(
          (a, b) => a.Order - b.Order
        );
        console.log("Fetched questions:", sortedQuestions);
        setQuestions(sortedQuestions);
        setTotalQuestions(sortedQuestions.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    }

    fetchQuestionList();
  }, []);

  // Handle option selection and move to next question
  const handleOptionChange = useCallback(
    (optionContent) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: optionContent,
      }));

      if (currentQuestionIndex + 1 < totalQuestions) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 400);
      }
    },
    [currentQuestionIndex, totalQuestions]
  );

  const handleTestAgain = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setScores({
      depression: 0,
      anxiety: 0,
      stress: 0,
    });
    setRecommend(null);
  };

  // Submit answers and fetch results from API, then call ChatGPT
  const handleSubmit = useCallback(() => {
    setSubmitted(true);

    const selectedOptionIds = Object.entries(answers).map(
      ([index, selectedOption]) => {
        const question = questions[parseInt(index)];
        const selectedOptionObj = question.options.find(
          (opt) => opt.Content === selectedOption
        );
        return selectedOptionObj.Id;
      }
    );

    const payload = {
      patientId: patientId,
      testId: testId,
      selectedOptionIds: selectedOptionIds,
    };

    fetch(`http://localhost:3000/api/tests/test-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${YOUR_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Submission successful:", data.testResultId);
        return fetch(
          `http://localhost:3000/api/tests/test-result/${data.testResultId}`,
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${YOUR_TOKEN}`,
            },
          }
        );
      })
      .then((response) => response.json())
      .then((resultData) => {
        const newScores = {
          depression: resultData.testResult.depressionScore.value,
          anxiety: resultData.testResult.anxietyScore.value,
          stress: resultData.testResult.stressScore.value,
        };
        setScores(newScores);

        // Gọi ChatGPT với điểm số
        const prompt = `Sau khi test bài test DASS-21 tôi nhận được chỉ số Depression là ${newScores.depression}, Anxiety là ${newScores.anxiety}, Stress là ${newScores.stress}. Bạn có thể chẩn đoán tôi đang như thế nào và tôi nên làm gì không?.Dịch ra tiếng anh.`;

        axios
          .post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "Bạn là một chuyên gia tâm lý, hãy chẩn đoán dựa trên điểm số DASS-21 và đưa ra lời khuyên cụ thể.Dịch ra tiếng anh",
                },
                { role: "user", content: prompt },
              ],
              max_tokens: 300,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
              },
            }
          )
          .then((chatGptResponse) => {
            const chatGptReply =
              chatGptResponse.data.choices[0].message.content;
            setRecommend(chatGptReply); // Cập nhật recommendation từ ChatGPT
          })
          .catch((error) => {
            console.error("Lỗi khi gọi API ChatGPT:", error);
            setRecommend(
              "Đã có lỗi xảy ra khi phân tích kết quả. Vui lòng thử lại sau."
            );
          });
      })
      .catch((error) => {
        console.error("Error submitting answers or fetching result:", error);
      });
  }, [answers, questions, patientId, testId, API_KEY]);

  const currentQuestion = questions[currentQuestionIndex];

  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="grid grid-cols-7 grid-rows-5 w-full min-h-[calc(100vh-110px)]">
      <div className="col-span-4 row-span-5 pl-5 p-5 h-full">
        <div className="h-full flex flex-col">
          {currentQuestion && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: -50,
                  transition: {
                    duration: 0.3,
                  },
                }}
                className="flex flex-col items-center p-6 rounded-lg text-xl w-full">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: {
                      delay: 0.2,
                      duration: 0.4,
                      ease: "easeOut",
                    },
                  }}
                  className="text-2xl font-semibold mb-8 p-5 text-center italic">
                  {currentQuestionIndex + 1}. {currentQuestion.Content}
                </motion.p>
                <motion.div
                  className="flex flex-col w-full space-y-4 px-6"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3,
                    },
                  }}>
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut",
                        },
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{
                        scale: 0.98,
                        transition: { duration: 0.1 },
                      }}
                      onClick={() => handleOptionChange(option.Content)}
                      className={`p-4 rounded-lg transition-all duration-300 ${
                        answers[currentQuestionIndex] === option.Content
                          ? `${colorMap[option.Content]} ${
                              textColorMap[option.Content]
                            } scale-105 shadow-md`
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}>
                      {option.Content}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="mt-auto flex justify-center mb-6">
            {isLastQuestion && !submitted && (
              <button
                onClick={handleSubmit}
                disabled={!answers[currentQuestionIndex]}
                className={`relative flex items-center justify-center py-4 px-8 text-black text-base font-bold rounded-full overflow-hidden bg-[#f6f3f8] transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-blue-500 before:to-blue-300 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-xl hover:before:left-0 ${
                  !answers[currentQuestionIndex]
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}>
                Submit
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 ml-2 -mr-1 transition duration-250 group-hover:translate-x-1">
                  <path
                    clipRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            )}

            {submitted && (
              <button
                onClick={handleTestAgain}
                className="relative flex items-center justify-center py-4 px-8 text-black text-base font-bold rounded-full overflow-hidden bg-[#f6f3f8] transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-blue-500 before:to-blue-300 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-xl hover:before:left-0">
                Try Again
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 ml-2 -mr-1 transition duration-250 group-hover:translate-x-1">
                  <path
                    clipRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results column */}
      <div className="col-span-3 row-span-5 h-full bg-[#ffffff] rounded-xl p-8 transition-all duration-300">
        {submitted ? (
          <div className="h-[550px] bg-[#f1e9fd] p-6 flex flex-col rounded-xl overflow-y-auto">
            <h2 className="text-2xl font-serif text-gray-800 mb-6">
              Your Assessment Results
            </h2>
            <div className="space-y-6 mb-8">
              {/* Depression Score */}
              <div className="bg-white py-3 px-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">Depression</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    DASS-21
                  </span>
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(
                      "depression",
                      scores.depression
                    )} transition-all duration-500 ease-out`}
                    style={{
                      width: `${Math.min(
                        100,
                        (scores.depression / 42) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm font-medium">
                  <span className="text-gray-700 font-serif">
                    Score: {scores.depression}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg ${getScoreColor(
                      "depression",
                      scores.depression
                    ).replace("bg-", "bg-opacity-20 text-")}`}>
                    {getScoreLevel("depression", scores.depression)}
                  </span>
                </div>
              </div>

              {/* Anxiety Score */}
              <div className="bg-white py-3 px-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">Anxiety</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    DASS-21
                  </span>
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(
                      "anxiety",
                      scores.anxiety
                    )} transition-all duration-500 ease-out`}
                    style={{
                      width: `${Math.min(100, (scores.anxiety / 42) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm font-medium">
                  <span className="text-gray-700 font-serif">
                    Score: {scores.anxiety}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg ${getScoreColor(
                      "anxiety",
                      scores.anxiety
                    ).replace("bg-", "bg-opacity-20 text-")}`}>
                    {getScoreLevel("anxiety", scores.anxiety)}
                  </span>
                </div>
              </div>

              {/* Stress Score */}
              <div className="bg-white py-3 px-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">Stress</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    DASS-21
                  </span>
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(
                      "stress",
                      scores.stress
                    )} transition-all duration-500 ease-out`}
                    style={{
                      width: `${Math.min(100, (scores.stress / 42) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm font-medium">
                  <span className="text-gray-700 font-serif">
                    Score: {scores.stress}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg ${getScoreColor(
                      "stress",
                      scores.stress
                    ).replace("bg-", "bg-opacity-20 text-")}`}>
                    {getScoreLevel("stress", scores.stress)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mt-auto border-l-4 border-amber-400">
              <div className="flex items-center mb-3">
                <Lottie
                  animationData={alertIcon}
                  loop={true}
                  style={{
                    width: 30,
                    height: 30,
                    filter:
                      "brightness(0) saturate(100%) invert(14%) sepia(93%) saturate(7481%) hue-rotate(1deg) brightness(92%) contrast(119%)",
                  }}
                />
                <p className="text-lg font-semibold text-gray-700 ml-2">
                  Important Note
                </p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {recommend || "Analyzing results, please wait..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-[#f4ecff] rounded-xl p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Lottie
                animationData={arrowDownAnimation}
                loop={true}
                style={{ width: 20, height: 20 }}
              />
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Assessment Incomplete
            </h3>

            <div className="bg-white rounded-lg shadow-md p-5 mb-6 w-full max-w-md">
              <div className="flex items-center mb-3">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="font-medium text-gray-700">
                  {totalQuestions - currentQuestionIndex} of {totalQuestions}{" "}
                  questions remaining
                </p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-[#b36cec] h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentQuestionIndex / totalQuestions) * 100}%`,
                  }}
                />
              </div>

              <p className="text-sm text-gray-600">
                Please answer all questions to receive your personalized
                assessment results.
              </p>
            </div>

            <div className="space-y-4 w-full max-w-md">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-medium text-gray-700">What is DASS-21?</p>
                </div>
                <p className="text-sm text-gray-600">
                  The Depression, Anxiety and Stress Scale (DASS-21) is a
                  validated tool that measures symptoms of depression, anxiety,
                  and stress.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-400">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <p className="font-medium text-gray-700">
                    Privacy Guaranteed
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Your responses are private and confidential. We don't store
                  your individual answers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions (giữ nguyên)
function getScoreColor(type, score) {
  const severityLevels = {
    depression: [
      { max: 9, color: "bg-green-500" },
      { max: 13, color: "bg-yellow-500" },
      { max: 20, color: "bg-orange-500" },
      { max: 42, color: "bg-red-500" },
    ],
    anxiety: [
      { max: 7, color: "bg-green-500" },
      { max: 9, color: "bg-yellow-500" },
      { max: 14, color: "bg-orange-500" },
      { max: 42, color: "bg-red-500" },
    ],
    stress: [
      { max: 14, color: "bg-green-500" },
      { max: 18, color: "bg-yellow-500" },
      { max: 25, color: "bg-orange-500" },
      { max: 42, color: "bg-red-500" },
    ],
  };

  const levels = severityLevels[type];
  for (const level of levels) {
    if (score <= level.max) {
      return level.color;
    }
  }
  return "bg-red-500";
}

function getScoreLevel(type, score) {
  const severityLabels = {
    depression: [
      { max: 9, label: "Normal" },
      { max: 13, label: "Mild" },
      { max: 20, label: "Moderate" },
      { max: 27, label: "Severe" },
      { max: 42, label: "Extremely Severe" },
    ],
    anxiety: [
      { max: 7, label: "Normal" },
      { max: 9, label: "Mild" },
      { max: 14, label: "Moderate" },
      { max: 19, label: "Severe" },
      { max: 42, label: "Extremely Severe" },
    ],
    stress: [
      { max: 14, label: "Normal" },
      { max: 18, label: "Mild" },
      { max: 25, label: "Moderate" },
      { max: 33, label: "Severe" },
      { max: 42, label: "Extremely Severe" },
    ],
  };

  const levels = severityLabels[type];
  for (const level of levels) {
    if (score <= level.max) {
      return level.label;
    }
  }
  return "Extremely Severe";
}

export default TestEmotion;
