import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageCircle, Plus, Trash2, Menu } from "lucide-react";
import ChatbotAvatar from "./ChatbotAvatar";

const avatarImages = [
  "/Emo/EMO_1.webp",
  "/Emo/EMO_2.webp",
  "/Emo/EMO_3.webp",
  "/Emo/EMO_4.webp",
  "/Emo/EMO_5.webp",
  "/Emo/EMO_6.webp",
  "/Emo/EMO_7.webp",
  "/Emo/EMO_8.webp",
  "/Emo/EMO_9.webp",
  "/Emo/EMO_10.webp",
];

const getAvatarForSession = (sessionId) => {
  if (!sessionId) return avatarImages[0];
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarImages.length;
  return avatarImages[index];
};

const ConversationSidebar = ({
  sessions,
  onConversationSelect,
  onNewChat,
  activeConversation,
  onDeleteConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredConversations = sessions.filter((conv) =>
    (conv?.name?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
  );

  const SidebarContent = (
    <motion.div
      className="w-80 h-full flex flex-col relative overflow-hidden shadow-xl"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}>
      <div className="p-6 relative">
        <motion.button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-300 text-gray-800 rounded-2xl font-semibold shadow-md transition-all duration-300 mb-4 group relative overflow-hidden hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}>
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-5 h-5 text-[#8B5CF6]" />
            <span className="text-sm font-medium tracking-wide">
              Bắt đầu cuộc trò chuyện
            </span>
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageCircle className="w-4 h-4 text-[#C084FC]" />
            </motion.div>
          </div>
        </motion.button>

        <div className="relative">
          <motion.div
            className="bg-white/90 backdrop-blur-sm shadow flex items-center gap-3 rounded-xl px-3 py-2"
            whileFocus={{ scale: 1.02 }}>
            <Search className="w-4 h-4 text-gray-400/60" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400/60"
            />
          </motion.div>
        </div>
      </div>

      {/* Hiển thị tối đa 4 đoạn hội thoại, scroll nếu nhiều hơn */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          maxHeight: "calc(5.5rem * 4 + 2rem)", // 4 item * ~88px + padding
          minHeight: "0",
        }}>
        <AnimatePresence>
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`relative group rounded-3xl shadow-md hover:shadow-xl border border-pink-200 bg-[#ffffffec] hover:bg-pink-100/80 transition-all cursor-pointer ${
                activeConversation === conversation.id
                  ? "ring-2 ring-pink-400/50 scale-[1.02] border-pink-300"
                  : ""
              }`}
              onClick={() => {
                setIsOpen(false);
                onConversationSelect(conversation.id);
              }}>
              <div className="flex items-center gap-3 p-3">
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shadow border-2 border-white">
                    <img
                      src={getAvatarForSession(conversation.Id)}
                      alt="Avatar"
                      className="rounded-full w-10 h-10 object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      className="text-xl"
                      animate={{
                        scale:
                          activeConversation === conversation.id
                            ? [1, 1.2, 1]
                            : 1,
                      }}
                      transition={{ duration: 0.4 }}>
                      💬
                    </motion.span>
                    <h3 className="font-semibold text-[#6B728E] text-base truncate flex-1">
                      {conversation.Name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400/80 italic">
                      {conversation.CreatedDate ? (
                        <span className="bg-[#F3E8FF] text-[#8B5CF6] px-2 py-0.5 rounded-full shadow-sm font-mono">
                          {new Date(conversation.CreatedDate).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      ) : (
                        <span className="text-white bg-[#C8A2C8]/70 px-2 py-0.5 rounded-full shadow">
                          Mới 🌱
                        </span>
                      )}
                    </span>
                    <motion.button
                      className="opacity-100 transition-opacity rounded-full p-1 hover:bg-pink-200/40"
                      whileHover={{ scale: 1.2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(conversation.id);
                      }}>
                      <Trash2 className="w-4 h-4 text-pink-500" />
                    </motion.button>
                  </div>
                </div>
              </div>
              {activeConversation === conversation.id && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-[#C8A2C8] to-[#6B728E] rounded-r-full shadow-md"
                  layoutId="activeIndicator"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredConversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <ChatbotAvatar />
              <span className="absolute -top-3 -right-3 text-2xl animate-bounce select-none">
                {searchQuery ? "🤔" : "💬"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#6B728E] drop-shadow text-center">
              {searchQuery
                ? "Không tìm thấy đoạn hội thoại nào"
                : "Chưa có đoạn hội thoại nào"}
            </h3>
            <p className="text-[#C8A2C8]/80 text-base font-medium text-center max-w-xs">
              {searchQuery
                ? "Hãy thử từ khóa khác hoặc kiểm tra lại chính tả nhé!"
                : "Hãy bắt đầu một cuộc trò chuyện mới để chia sẻ cảm xúc cùng EmoEase 🫂"}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // Popup xác nhận xóa - render ngoài vòng lặp, luôn ở giữa màn hình
  const deletePopup = (
    <AnimatePresence>
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center gap-4 border border-[#C8A2C8]/30">
            <div className="text-4xl mb-2 animate-bounce">🗑️</div>
            <h3 className="text-lg font-bold text-[#C8A2C8] text-center">
              Xóa cuộc trò chuyện?
            </h3>
            <p className="text-gray-500 text-center text-sm">
              Bạn chắc chắn muốn xoá cuộc trò chuyện này? Hành động này không
              thể hoàn tác!
            </p>
            <div className="flex gap-2 mt-2 w-full">
              <button
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#c8a2c8] to-[#6b728e] text-white font-semibold shadow hover:scale-105 transition-all"
                onClick={() => {
                  onDeleteConversation(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}>
                Xóa
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition-all"
                onClick={() => setDeleteConfirmId(null)}>
                Hủy
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative z-50 lg:block">
      <div className="lg:hidden p-3">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white/30 backdrop-blur-md shadow px-3 py-2 rounded-xl text-sm font-semibold">
          <Menu className="w-5 h-5 text-[#C8A2C8]" />
        </button>
      </div>
      <div className="hidden lg:block">{SidebarContent}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            {/* Overlay - đặt trước, nhận sự kiện click */}
            <div
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />
            {/* Sidebar - đặt sau, không bị overlay che */}
            <motion.div
              className="absolute left-0 top-20 bottom-0"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}>
              {SidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Popup xác nhận xóa luôn ở giữa màn hình */}
      {deletePopup}
    </div>
  );
};

export default ConversationSidebar;