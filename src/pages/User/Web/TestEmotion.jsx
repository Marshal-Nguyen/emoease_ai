import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import ReactMarkdown from "react-markdown"; // Nếu đã cài react-markdown
import arrowDownAnimation from "../../../util/icon/arrowDown.json";
import alertIcon from "../../../util/icon/alertOctagon.json";
import LoadingWithHamster from "../../../components/LoadHamster/LoadingWithHamster";
import LoadingPanda from "../../../components/LoadHamster/LoadingPanda";
import { subHours, format } from "date-fns";
// Color mappings for UI consistency
const colorMap = {
  "Hoàn toàn không áp dụng với tôi.": "bg-teal-400 border-teal-600",
  "Áp dụng với tôi ở mức độ nào đó.": "bg-amber-400 border-amber-600",
  "Áp dụng với tôi ở mức độ đáng kể.": "bg-orange-400 border-orange-600",
  "Áp dụng với tôi rất nhiều.": "bg-rose-400 border-rose-600",
};

const textColorMap = {
  "Hoàn toàn không áp dụng với tôi.": "text-white",
  "Áp dụng với tôi ở mức độ nào đó.": "text-white",
  "Áp dụng với tôi ở mức độ đáng kể.": "text-white",
  "Áp dụng với tôi rất nhiều.": "text-white",
};

// Helper functions for score visualization
const getScoreColor = (type, score) => {
  const typeKey =
    type === "trầm cảm"
      ? "depression"
      : type === "lo âu"
      ? "anxiety"
      : type === "căng thẳng"
      ? "stress"
      : type;

  const severityLevels = {
    depression: [
      { max: 9, color: "bg-teal-400" },
      { max: 13, color: "bg-amber-400" },
      { max: 20, color: "bg-orange-400" },
      { max: 42, color: "bg-rose-400" },
    ],
    anxiety: [
      { max: 7, color: "bg-teal-400" },
      { max: 9, color: "bg-amber-400" },
      { max: 14, color: "bg-orange-400" },
      { max: 42, color: "bg-rose-400" },
    ],
    stress: [
      { max: 14, color: "bg-teal-400" },
      { max: 18, color: "bg-amber-400" },
      { max: 25, color: "bg-orange-400" },
      { max: 42, color: "bg-rose-400" },
    ],
  };

  return (
    severityLevels[typeKey]?.find((level) => score <= level.max)?.color ||
    "bg-rose-400"
  );
};

const getScoreLevel = (type, score) => {
  const typeKey =
    type === "trầm cảm"
      ? "depression"
      : type === "lo âu"
      ? "anxiety"
      : type === "căng thẳng"
      ? "stress"
      : type;

  const severityLabels = {
    depression: [
      { max: 9, label: "Bình thường" },
      { max: 13, label: "Nhẹ" },
      { max: 20, label: "Trung bình" },
      { max: 27, label: "Nặng" },
      { max: 42, label: "Rất nặng" },
    ],
    anxiety: [
      { max: 7, label: "Bình thường" },
      { max: 9, label: "Nhẹ" },
      { max: 14, label: "Trung bình" },
      { max: 19, label: "Nặng" },
      { max: 42, label: "Rất nặng" },
    ],
    stress: [
      { max: 14, label: "Bình thường" },
      { max: 18, label: "Nhẹ" },
      { max: 25, label: "Trung bình" },
      { max: 33, label: "Nặng" },
      { max: 42, label: "Rất nặng" },
    ],
  };

  return (
    severityLabels[typeKey]?.find((level) => score <= level.max)?.label ||
    "Rất nặng"
  );
};

// ScoreCard Component
const ScoreCard = ({ type, score, compact }) => {
  // Đã bỏ iconMap, chỉ giữ borderColorMap
  const borderColorMap = {
    "trầm cảm": "border-blue-300",
    "lo âu": "border-yellow-300",
    "căng thẳng": "border-pink-300",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white ${
        compact ? "p-3" : "p-5"
      } rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-8 ${
        borderColorMap[type] || "border-indigo-200"
      } flex flex-col items-center justify-center`}
    >
      <h3
        className={`font-semibold text-gray-800 mb-1 flex items-center capitalize ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {/* Đã xóa icon */}
        {type}
      </h3>
      <div className="text-2xl font-bold text-indigo-700 mb-1">{score}</div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
        DASS-21
      </span>
      <span
        className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
          type,
          score
        ).replace("bg-", "bg-opacity-20 text-")}`}
      >
        {getScoreLevel(type, score)}
      </span>
    </motion.div>
  );
};

const RecommendationSection = ({ recommendation }) => {
  if (!recommendation || typeof recommendation === "string") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-amber-500"
      >
        <div className="flex items-center mb-3">
          <Lottie
            animationData={alertIcon}
            loop={true}
            style={{
              width: 28,
              height: 28,
              filter:
                "brightness(0) saturate(100%) invert(14%) sepia(93%) saturate(7481%) hue-rotate(1deg) brightness(92%) contrast(119%)",
            }}
          />
          <p className="text-lg font-semibold text-gray-800 ml-3">Lời khuyên</p>
        </div>
        <p className="text-sm text-gray-600">
          {typeof recommendation === "string"
            ? recommendation
            : "Đang phân tích kết quả, vui lòng đợi..."}
        </p>
      </motion.div>
    );
  }

  // Nếu có recommendation.raw thì render markdown
  if (recommendation.raw) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-purple-500"
      >
        <ReactMarkdown
          children={recommendation.raw}
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
              <strong className="text-pink-600 font-semibold" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="text-indigo-500" {...props} />
            ),
          }}
        />
      </motion.div>
    );
  }

  // Nếu không có gì thì báo lỗi
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-amber-500"
    >
      <p className="text-sm text-gray-600">
        Không có khuyến nghị cho kết quả này.
      </p>
    </motion.div>
  );
};

const IncompleteAssessment = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
  >
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="bg-gradient-to-br from-[#f0f9ff] to-[#fdf4ff] rounded-3xl p-8 md:p-12 shadow-2xl max-w-xl w-full flex flex-col items-center relative space-y-6"
    >
      {/* Nút đóng */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 text-2xl font-bold"
        onClick={onClose}
        aria-label="Đóng"
      >
        &times;
      </button>

      {/* Biểu tượng */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-4xl mb-2 select-none"
      >
        📝
      </motion.div>

      {/* Tiêu đề */}
      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
        Bạn chưa hoàn tất bài kiểm tra
      </h3>

      {/* Lời khuyến khích */}
      <p className="text-gray-600 text-center max-w-md text-sm md:text-base">
        Trước khi bắt đầu, hãy dành vài phút để tìm hiểu lý do vì sao bài kiểm
        tra này lại quan trọng với bạn 💜
      </p>

      {/* Box: Giới thiệu DASS-21 */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-indigo-400 w-full">
        <div className="flex items-center mb-2">
          <span className="text-indigo-500 text-xl mr-2">ℹ️</span>
          <p className="font-medium text-gray-800">DASS-21 là gì?</p>
        </div>
        <p className="text-gray-600 text-sm">
          Đây là công cụ khoa học giúp bạn hiểu rõ hơn về mức độ Trầm cảm, Lo âu
          và Căng thẳng hiện tại của mình. Được kiểm chứng và sử dụng toàn cầu
          🌍
        </p>
      </div>

      {/* Box: Bảo mật */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-teal-400 w-full">
        <div className="flex items-center mb-2">
          <span className="text-teal-500 text-xl mr-2">🔒</span>
          <p className="font-medium text-gray-800">Bảo mật tuyệt đối</p>
        </div>
        <p className="text-gray-600 text-sm">
          Mọi câu trả lời của bạn đều được xử lý ẩn danh và không liên kết với
          danh tính cá nhân. Chúng tôi tôn trọng quyền riêng tư của bạn 💫
        </p>
      </div>

      {/* Box: Lời mời tiếp tục */}
      <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-pink-400 w-full">
        <div className="flex items-center mb-2">
          <span className="text-pink-500 text-xl mr-2">🌱</span>
          <p className="font-medium text-gray-800">Chỉ mất 3 phút</p>
        </div>
        <p className="text-gray-600 text-sm">
          Việc hoàn thành bài test giúp Emo hiểu bạn hơn, từ đó đề xuất lộ trình
          hỗ trợ phù hợp và mang tính cá nhân hóa cao nhất.
        </p>
      </div>
    </motion.div>
  </motion.div>
);

const RecommendationModal = ({ open, onClose, recommendation }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute hover:cursor-pointer top-3 right-3 text-gray-400 hover:text-purple-600 text-2xl font-bold"
          aria-label="Đóng"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          Báo cáo cá nhân hóa
        </h2>
        <RecommendationSection recommendation={recommendation} />
      </motion.div>
    </div>
  );
};

const TestEmotion = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [scores, setScores] = useState({
    depression: 0,
    anxiety: 0,
    stress: 0,
  });
  const [testInfo, setTestInfo] = useState({
    testId: "",
    patientId: "",
    takenAt: "",
    severityLevel: "",
    patientName: "",
  });
  const [showRecommendation, setShowRecommendation] = useState(false);

  // NEW: Hiển thị popup IncompleteAssessment trước, sau khi tắt mới cho phép làm bài
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Thêm state submitting

  const patientId = useSelector((state) => state.auth.profileId);
  const testId = "093b2667-6fe8-4ab5-be07-a2e603fdaa66";
  const YOUR_TOKEN = localStorage.getItem("token");

  function formatTimestamp(takenAt) {
    try {
      const date = new Date(takenAt);
      if (isNaN(date)) throw new Error("Invalid timestamp");
      const adjustedDate = subHours(date, 5);
      return format(date, "dd/MM/yyyy HH:mm:ss");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid Date";
    }
  }

  // Fetch questions
  useEffect(() => {
    async function fetchQuestionList() {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API
          }/tests/${testId}/questions?pageIndex=1&pageSize=21`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${YOUR_TOKEN}`,
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

  // Handle option selection
  const handleOptionChange = useCallback(
    (optionContent) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: optionContent,
      }));
      if (currentQuestionIndex + 1 < totalQuestions) {
        setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 400);
      }
    },
    [currentQuestionIndex, totalQuestions]
  );

  // Handle test submission
  const handleSubmit = useCallback(async () => {
    setSubmitting(true); // Bắt đầu loading khi nộp bài
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
    const payload = { patientId, testId, selectedOptionIds };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/tests/test-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${YOUR_TOKEN}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      const result = data.testResult;
      setScores({
        depression: result.depressionScore?.value ?? 0,
        anxiety: result.anxietyScore?.value ?? 0,
        stress: result.stressScore?.value ?? 0,
      });
      setTestInfo({
        testId: result.testId,
        patientId: result.patientId,
        takenAt: result.takenAt,
        severityLevel: result.severityLevel,
        patientName: result.patientName,
      });
      setRecommendation(
        result.recommendation || "Không có khuyến nghị cho kết quả này."
      );
    } catch (error) {
      console.error("Error submitting test:", error);
      setRecommendation("Đã xảy ra lỗi khi lấy kết quả. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false); // Kết thúc loading
    }
  }, [answers, questions, patientId, testId, YOUR_TOKEN]);

  // Reset test
  const handleTestAgain = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setScores({ depression: 0, anxiety: 0, stress: 0 });
    setTestInfo({
      testId: "",
      patientId: "",
      takenAt: "",
      severityLevel: "",
      patientName: "",
    });
    setRecommendation(null);
  };
  const loadingMessages = [
    "🧠 Đang suy nghĩ kỹ càng...",
    "🐹 Hamster đang chạy hết tốc lực để xử lý kết quả...",
    "📊 Đang phân tích dữ liệu cảm xúc của bạn...",
    "💫 Chúng tôi đang gọi các neuron hội họp gấp...",
    "🧬 Kết quả đang được tinh chỉnh bởi AI cảm xúc...",
    "🔮 Tính toán tương lai cảm xúc...",
    "📦 Gói kết quả đang được đóng hộp đẹp đẽ...",
  ];

  const [pandaMessage, setPandaMessage] = useState("");
  useEffect(() => {
    const pandaMessages = [
      "🧠 Gấu cũng đang làm bài thử… nhưng quên câu hỏi rồi 😅",
      "📉 Gấu đang đánh giá bạn đó… đùa thôi 🤭",
      "🐼 Câu này dễ ha? Hay bạn đang phân vân dữ lắm?",
      "👀 Gấu sẽ không phán xét... nhưng gấu biết hết!",
      "💬 Gấu nghĩ bạn đang stress... vì chọn mãi chưa xong 🤯",
    ];
    const randomMsg =
      pandaMessages[Math.floor(Math.random() * pandaMessages.length)];
    setPandaMessage(randomMsg);
  }, [currentQuestionIndex]); // Gọi lại khi câu hỏi thay đổi

  const [messageIndex, setMessageIndex] = useState(0);

  // Optional: Tự động thay đổi message mỗi vài giây
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000); // đổi mỗi 3 giây
    return () => clearInterval(interval);
  }, []);

  // Loading khi lấy kết quả bài test
  if (submitting) {
    return (
      <div className="flex flex-col w-screen items-center justify-center h-screen bg-gradient-to-br from-teal-50 to-purple-50 z-50 text-center px-6">
        <LoadingWithHamster />
        <p className="mt-6 text-lg md:text-xl font-semibold text-gray-700 animate-pulse">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-teal-50 to-purple-50 p-4 md:p-8">
      {/* Hiển thị popup IncompleteAssessment trước */}
      <AnimatePresence>
        {showIntro && (
          <IncompleteAssessment
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onClose={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      {/* Sau khi tắt popup mới hiển thị phần câu hỏi */}
      {!showIntro && (
        <div className="w-screen px-10 mx-auto">
          <div className="flex flex-col h-full">
            {/* Hiển thị câu hỏi chỉ khi chưa nộp bài */}
            {!submitted && currentQuestion && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white p-4 md:p-8 rounded-2xl shadow-lg min-h-[340px] flex flex-col justify-between"
                >
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-8 text-center italic"
                  >
                    Câu {currentQuestionIndex + 1}/{totalQuestions}:{" "}
                    {currentQuestion.Content}
                  </motion.p>
                  <motion.div
                    className="flex flex-col w-full space-y-3 md:space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
                  >
                    {currentQuestion.options.map((option) => (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionChange(option.Content)}
                        className={`p-3 md:p-4 rounded-lg text-left transition-all duration-300 text-base font-medium ${
                          answers[currentQuestionIndex] === option.Content
                            ? `${colorMap[option.Content]} ${
                                textColorMap[option.Content]
                              } shadow-md`
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        {option.Content}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Nút nộp bài chỉ hiển thị khi chưa nộp bài */}
            {!submitted && (
              <div className="mt-6 md:mt-8 flex justify-center">
                {isLastQuestion && (
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!answers[currentQuestionIndex]}
                    whileHover={{
                      scale: answers[currentQuestionIndex] ? 1.05 : 1,
                    }}
                    whileTap={{
                      scale: answers[currentQuestionIndex] ? 0.95 : 1,
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300
    ${
      answers[currentQuestionIndex]
        ? "bg-gradient-to-r from-emerald-500 to-indigo-500 text-white shadow-lg hover:shadow-xl"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
                  >
                    <span>Nộp bài</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>
            )}

            {/* Hiển thị kết quả sau khi nộp bài, ẩn phần câu hỏi */}
            {submitted && (
              <div className="mt-10 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-200">
                  {/* Header */}
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center mb-6">
                    🧠 Kết quả đánh giá DASS-21 của bạn
                  </h2>

                  {/* Thông tin bài kiểm tra */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 md:p-6 rounded-xl mb-6 border-l-4 border-indigo-400">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                      📋 Thông tin bài kiểm tra
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>
                        <strong>Người dùng:</strong> {testInfo.patientName}
                      </li>
                      <li>
                        <strong>Mã bài kiểm tra:</strong> {testInfo.testId}
                      </li>
                      <li>
                        <strong>Mã người dùng:</strong> {testInfo.patientId}
                      </li>
                      <li>
                        <strong>Thời gian thực hiện:</strong>{" "}
                        {formatTimestamp(testInfo.takenAt)}
                      </li>
                      <li>
                        <strong>Mức độ nghiêm trọng:</strong>{" "}
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            testInfo.severityLevel === "Severe"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {testInfo.severityLevel}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Điểm số */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <ScoreCard
                      type="trầm cảm"
                      score={scores.depression}
                      compact
                    />
                    <ScoreCard type="lo âu" score={scores.anxiety} compact />
                    <ScoreCard
                      type="căng thẳng"
                      score={scores.stress}
                      compact
                    />
                  </div>

                  {/* Nút hành động */}
                  <div className="flex flex-col gap-4 items-center w-full">
                    <div className="flex flex-col w-64 p-2 rounded-3xl gap-2 bg-white shadow-inner border border-indigo-100">
                      <a
                        onClick={() => setShowRecommendation(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-center font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        📈 Xem báo cáo chi tiết
                      </a>

                      <a
                        onClick={handleTestAgain}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl text-center font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Thử lại
                          <svg
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            fill="none"
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                          >
                            <path
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                              strokeWidth="2"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!submitted && (
              <div className="flex flex-col items-center justify-center">
                <div className="text-sm italic text-gray-500 text-center animate-pulse">
                  {pandaMessage}
                </div>
                <LoadingPanda />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendation Modal */}
      <RecommendationModal
        open={showRecommendation}
        onClose={() => setShowRecommendation(false)}
        recommendation={recommendation}
      />
    </div>
  );
};

export default TestEmotion;
