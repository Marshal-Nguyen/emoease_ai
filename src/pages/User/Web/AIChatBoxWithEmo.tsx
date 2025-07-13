import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import ConversationSidebar from "../../../components/Chat/ConversationSidebar";
import MainLayout from "../../../components/Chat/MainLayout";
import TypewriterMessage from "../../../components/Chat/TypewriterMessage";

// API Base URL
const BASE_URL = (import.meta as any).env.VITE_API;
const TOKEN = localStorage.getItem("token"); // Thay bằng logic lấy token thực tế

// Component hiển thị tin nhắn
const ChatMessages = ({ messages, isLoadingMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Xác định index của tin nhắn đang loading (nếu có)
  const lastIndex = messages.length - 1;

  return (
    <div className="flex-1 bg-[#6b728e00] rounded-2xl p-6 mb-4 overflow-y-auto ">
      <AnimatePresence>
        {messages &&
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 mb-4 ${
                message.senderIsEmo ? "justify-start" : "justify-end"
              }`}
            >
              {message.senderIsEmo && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img
                    src="/emo.webp"
                    alt="Emo Avatar"
                    className="rounded-full"
                  />
                </div>
              )}
              <motion.div
                className={`max-w-xs p-3 rounded-xl ${
                  message.senderIsEmo
                    ? "bg-white/90 text-gray-700 shadow"
                    : "bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-300 text-gray-800 ml-auto shadow"
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {message.senderIsEmo &&
                index === lastIndex &&
                isLoadingMessages ? (
                  <TypewriterMessage text={message.content} onDone={() => {}} />
                ) : (
                  <span>{message.content}</span>
                )}
                <p className="text-xs opacity-60 mt-1">
                  {message.createdDate
                    ? new Date(message.createdDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </motion.div>
            </motion.div>
          ))}
        {/* Hiển thị ... khi đang loading tin nhắn */}
        {isLoadingMessages && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 mb-4 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] flex items-center justify-center flex-shrink-0 shadow-lg">
              <img src="/emo.webp" alt="Emo Avatar" className="rounded-full" />
            </div>
            <motion.div
              className="max-w-xs p-3 rounded-xl bg-white/90 text-gray-700 shadow flex items-center"
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <span className="text-lg font-bold tracking-widest animate-pulse">
                ...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

// Component nhập tin nhắn
const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  return (
    <motion.div
      className="bg-white/80 backdrop-blur-xl shadow-2xl p-4 rounded-3xl border border-white/30 ring-1 ring-purple-100/40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <form className="flex gap-3 items-center" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
          }}
          placeholder="Bạn đang cảm thấy thế nào? 🌈"
          className="flex-1 px-4 py-3 bg-white/60 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A2C8] placeholder:text-sm placeholder:text-gray-400/80 transition-all"
          disabled={disabled}
        />
        <motion.button
          type="submit"
          className="px-4 py-3 bg-gradient-to-tr from-[#C8A2C8] to-[#a78bfa] hover:brightness-110 text-white rounded-full shadow-md disabled:opacity-50 transition-all"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled || !message.trim()}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  );
};

// Component chính
type Session = {
  id: string;
  name: string;
  [key: string]: any;
};

const AIChatBoxWithEmo = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  type Message = {
    senderIsEmo: boolean;
    content: string;
    createdDate?: string;
    [key: string]: any;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionName, setSessionName] = useState("Your Zen Companion");
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Lấy danh sách phiên
  const fetchSessions = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/sessions?PageIndex=1&PageSize=10`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      console.log("Fetched sessions data:", data); // Thêm log để kiểm tra
      setSessions(
        Array.isArray(data.data)
          ? data.data.map((s) => ({
              ...s,
              id: s.Id,
              name: s.Name,
              createdAt: s.CreatedAt,
              lastActive: s.LastActive,
            }))
          : []
      );
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiên:", error);
    }
  };

  // Lấy tin nhắn của phiên
  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/sessions/${sessionId}/messages?PageIndex=1&PageSize=20`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      const normalized = Array.isArray(data.data)
        ? data.data.map((msg) => ({
            senderIsEmo: msg.SenderIsEmo,
            content: msg.Content,
            createdDate: msg.CreatedDate,
            ...msg,
          }))
        : [];
      setMessages(normalized);
      await fetch(`${BASE_URL}/sessions/${sessionId}/messages/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  };

  // Tạo phiên mới với tên tuỳ chỉnh
  const createSessionWithCustomName = async (sessionName: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/sessions?sessionName=${encodeURIComponent(sessionName)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      // Chuẩn hóa key Name để đồng bộ với các session khác
      const newSession = {
        ...data,
        Name: data.name,
        CreatedDate: data.createdDate,
        id: data.id,
      };
      setSessions((prev) => [...prev, newSession]);
      setCurrentSessionId(newSession.id);
      setSessionName(newSession.Name);
      setMessages(data.initialMessage ? [data.initialMessage] : []);
    } catch (error) {
      console.error("Lỗi khi tạo phiên:", error);
    }
  };

  // Xóa phiên
  const deleteSession = async (sessionId) => {
    try {
      await fetch(`${BASE_URL}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
        setSessionName("Your Zen Companion");
      }
    } catch (error) {
      console.error("Lỗi khi xóa phiên:", error);
    }
  };

  // Gửi tin nhắn
  const sendMessage = async (message) => {
    if (!currentSessionId) return;
    try {
      setIsLoadingMessages(true);
      setMessages((prev) => [
        ...prev,
        {
          senderIsEmo: false,
          content: message,
          createdDate: new Date().toISOString(),
        },
      ]);
      const response = await fetch(`${BASE_URL}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: message,
          sessionId: currentSessionId,
        }),
      });
      const data = await response.json();
      // Chuẩn hóa key cho từng message
      if (Array.isArray(data)) {
        const normalized = data.map((msg) => ({
          senderIsEmo: msg.SenderIsEmo,
          content: msg.Content,
          createdDate: msg.CreatedDate,
          ...msg,
        }));
        setPendingMessages(normalized);
      } else {
        setPendingMessages([]);
      }
    } catch (error) {
      setIsLoadingMessages(false);
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  // Hiệu ứng hiển thị từng tin nhắn pendingMessages cách nhau 1s
  useEffect(() => {
    if (pendingMessages.length === 0) {
      setIsLoadingMessages(false);
      return;
    }
    setIsLoadingMessages(true);
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, pendingMessages[0]]);
      setPendingMessages((prev) => prev.slice(1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [pendingMessages]);

  // Xử lý chọn phiên
  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    setSessionName(session?.name || "Your Zen Companion");
    fetchMessages(sessionId);
  };

  // Tải danh sách phiên khi component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <MainLayout>
      {/* Background image layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg_Question.webp')",
        }}
      />
      {/* Overlay for darken effect */}
      {/* <div className="fixed inset-0 z-10 bg-gradient-to-br from-[#c8a2c8]/40 via-white/30 to-[#6b728e]/40 pointer-events-none" /> */}
      {/* Main chat layout */}
      <div className="relative z-20 flex h-[calc(100vh-120px)] max-w-7xl mx-auto py-8">
        <ConversationSidebar
          sessions={sessions}
          onConversationSelect={handleSelectSession}
          onNewChat={() => setShowNewSessionModal(true)}
          activeConversation={currentSessionId}
          onDeleteConversation={deleteSession}
        />
        <div className="flex-1 flex flex-col px-4 md:px-8">
          {currentSessionId ? (
            <>
              <ChatMessages
                messages={messages}
                isLoadingMessages={isLoadingMessages}
              />
              <ChatInput
                onSendMessage={sendMessage}
                disabled={!currentSessionId}
              />
            </>
          ) : (
            // Thiết kế lại khi chưa chọn phiên
            <motion.section
              className="relative flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Glow & Blur Layer */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#EBDCF1]/40 to-[#FDF2F8]/30 backdrop-blur-3xl rounded-[2rem] shadow-2xl" />

              {/* Floating Emoji */}
              <motion.div
                className="text-6xl relative z-10 mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🧸
              </motion.div>

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-bold text-[#ffffff] tracking-tight relative z-10 drop-shadow-md break-words text-center max-w-screen-sm sm:max-w-xl px-2">
                Chào mừng <br />
                <span className="text-[#C8A2C8]">
                  {localStorage.getItem("username")}
                </span>{" "}
                đến với{" "}
                <span className="text-[#C8A2C8] font-extrabold">EmoEase</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3 text-base md:text-lg text-[#ffffff]/80 font-medium max-w-2xl relative z-10 leading-relaxed">
                Một nơi an toàn để bạn chia sẻ mọi cảm xúc không bị đánh giá,
                không cần phải gồng mình.
              </p>

              {/* Button */}
              <motion.button
                onClick={() => setShowNewSessionModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 bg-gradient-to-r from-[#c8a2c8] to-[#6b728e] text-white px-7 py-3 rounded-full font-semibold shadow-xl relative z-10"
              >
                🌟 Bắt đầu hành trình cảm xúc
              </motion.button>

              {/* Soft glow lights */}
              <motion.div
                className="absolute -bottom-10 -left-10 w-44 h-44 bg-pink-200/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.35, 0.2] }}
                transition={{ repeat: Infinity, duration: 7 }}
              />
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 6 }}
              />
            </motion.section>
          )}
        </div>
      </div>

      {/* Modal nhập tên phiên mới */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[#6B728E] text-center">
              Tạo cuộc trò chuyện mới
            </h3>
            <input
              type="text"
              className="border border-[#C8A2C8]/40 rounded-lg px-4 py-2 focus:outline-none focus:border-[#C8A2C8]"
              placeholder="Nhập tên cuộc trò chuyện..."
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              autoFocus
              maxLength={40}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#c8a2c8] to-[#6b728e] text-white font-semibold shadow hover:scale-105 transition-all"
                disabled={!newSessionName.trim()}
                onClick={() => {
                  createSessionWithCustomName(newSessionName.trim());
                  setShowNewSessionModal(false);
                  setNewSessionName("");
                }}
              >
                Tạo mới
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition-all"
                onClick={() => {
                  setShowNewSessionModal(false);
                  setNewSessionName("");
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AIChatBoxWithEmo;
