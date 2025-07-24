import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, User, Send } from "lucide-react";
import supabase from "../../Supabase/supabaseClient";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [myAvatarUrl, setMyAvatarUrl] = useState(null);
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const [myId, setMyId] = useState(localStorage.getItem("userId"));
  const [profileId, setProfileId] = useState(localStorage.getItem("profileId"));

  const realtimeChannelRef = useRef(null);
  // Hàm lấy avatar của myId
  const fetchMyAvatar = async () => {
    try {
      const avatarRes = await fetch(
        `https://mental-care-server-nodenet.onrender.com/api/profile/${profileId}/image`
      );
      const avatarData = await avatarRes.json();
      setMyAvatarUrl(avatarData.data?.publicUrl || null);
      console.log("My avatar URL:", avatarData.data?.publicUrl);
    } catch (err) {
      console.error(`Error fetching avatar for myId ${myId}:`, err);
      setMyAvatarUrl(null);
    }
  };
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || !selectedUser.Id) return;

    const messageData = {
      senderid: myId,
      receiverid: selectedUser.Id,
      content: messageInput,
    };

    const { data, error } = await supabase
      .from("ManageChat")
      .insert(messageData)
      .select();

    if (!error && data && data[0]) {
      setMessages((prev) => [...prev, data[0]]);
      setMessageInput("");
    } else {
      console.error("Send message error:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessageInput(suggestion);
  };

  const fetchMessages = async (selectedUserId) => {
    const { data, error } = await supabase
      .from("ManageChat")
      .select("*")
      .or(
        `and(senderid.eq.${myId},receiverid.eq.${selectedUserId}),and(senderid.eq.${selectedUserId},receiverid.eq.${myId})`
      )
      .order("created_at", { ascending: true });

    if (!error) setMessages(data);
    else console.error("Error fetching messages:", error);
  };

  const loadMessages = async (id) => {
    const selected = users.find((u) => u.Id === id);
    if (!selected) return;
    setSelectedUser(selected);
    console.log("Selected user:", selected);
    await fetchMessages(id);
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API
          }/chat-users/${userRole}/${localStorage.getItem("profileId")}`
        );
        const usersData = await res.json();

        const usersWithAvatars = await Promise.all(
          usersData.map(async (user) => {
            try {
              const avatarRes = await fetch(
                `https://mental-care-server-nodenet.onrender.com/api/profile/${user.avatarId}/image`
              );
              const avatarData = await avatarRes.json();
              return {
                ...user,
                avatarUrl: avatarData.data?.publicUrl || null,
              };
            } catch (err) {
              console.error(`Error fetching avatar for user ${user.Id}:`, err);
              return { ...user, avatarUrl: null };
            }
          })
        );

        setUsers(usersWithAvatars);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };

    fetchChatUsers();
    fetchMyAvatar();
  }, [userRole, profileId]);

  useEffect(() => {
    if (!selectedUser || !myId) return;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const channel = supabase
      .channel(`realtime-chat-${selectedUser.Id}-${myId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ManageChat",
        },
        (payload) => {
          const newMessage = payload.new;
          const isCurrentChat =
            (newMessage.senderid === myId &&
              newMessage.receiverid === selectedUser.Id) ||
            (newMessage.senderid === selectedUser.Id &&
              newMessage.receiverid === myId);

          // Chỉ thêm tin nhắn từ người khác, không thêm tin nhắn của chính mình
          // vì tin nhắn của mình đã được thêm ngay khi gửi
          if (isCurrentChat && newMessage.senderid !== myId) {
            setMessages((prev) => {
              const messageExists = prev.some(
                (msg) => msg.id === newMessage.id
              );
              if (!messageExists) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [selectedUser, myId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex max-w-full h-screen overflow-y-auto py-6 px-3 rounded-2xl relative"
      style={{
        backgroundImage: "url('/bg_Question.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Sidebar */}
      <div className="w-1/4 relative z-20   rounded-2xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#6B728E]">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#ffffff]">
                {userRole === "Doctor" ? "Patient Chat" : "Doctor Chat"}
              </h2>
              <p className="text-[#ffffff]/80 text-sm">Connect & Communicate</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#ffffff]/80 uppercase tracking-wider">
              {userRole === "Doctor" ? "Patients" : "Doctors"}
            </h3>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.Id}
                  onClick={() => loadMessages(user.Id)}
                  className={`group flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:bg-white/20 ${selectedUser?.Id === user.Id ? "bg-white/10 text-white" : ""
                    }`}
                >
                  <div className="relative">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.fullName}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <p
                      className={`font-semibold ${selectedUser?.Id === user.Id
                        ? "text-white"
                        : "text-[#ffffff]/80"
                        }`}
                    >
                      {user.fullName}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#ffffff]/80 font-medium">
                  No users available
                </p>
                <p className="text-[#ffffff]/60 text-sm">Check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUser ? (
        <div className="flex-grow flex flex-col relative z-20">
          <div className="p-6 bg-white/10  rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={`${selectedUser.fullName}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-[#ffffff]">
                    {selectedUser.fullName}
                  </h4>
                </div>
              </div>
              <div className="text-xs  bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-300 text-gray-800 px-3 py-1 rounded-full">
                {userRole === "Doctor" ? "Patient" : "Doctor"}
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#6b728e00] rounded-2xl">
            {messages.length === 0 ? (
              <div className="flex flex-col justify-start h-full">
                {/* Tin nhắn chào mừng từ bác sĩ */}
                <div className="flex justify-start mb-6 mt-4">
                  <div className="flex items-end space-x-2 max-w-md">
                    {selectedUser.avatarUrl ? (
                      <img
                        src={selectedUser.avatarUrl}
                        alt={`${selectedUser.fullName}'s avatar`}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="relative">
                      <div className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-xl shadow-lg border border-white/20">
                        {/* <div className="flex items-center mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-xs font-medium text-green-200">
                            {userRole === "Doctor" ? "Bệnh nhân" : "Bác sĩ"} đang online
                          </span>
                        </div> */}
                        <p className="leading-relaxed text-sm">
                          {userRole === "Doctor"
                            ? `Chào bạn! Tôi là bệnh nhân ${selectedUser.fullName}. Bạn có thể nhắn tin trao đổi với tôi tại đây. 💬`
                            : `Chào bạn! Tôi là bác sĩ ${selectedUser.fullName}. Bạn có thể nhắn tin trao đổi với tôi về tình trạng sức khỏe của bạn tại đây. 🩺💬`}
                        </p>
                        <div className="flex items-center mt-3 text-xs text-white/80">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          <span>Hãy bắt đầu cuộc trò chuyện...</span>
                        </div>
                      </div>
                      {/* Speech bubble tail */}
                      <div className="absolute bottom-0 left-0 transform -translate-x-1 translate-y-1">
                        <div className="w-3 h-3 transform rotate-45 bg-white/20 border-r border-b border-white/20"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gợi ý câu hỏi */}
                <div className="flex flex-wrap gap-2 px-4">
                  {userRole !== "Doctor" && (
                    <>
                      <div
                        onClick={() =>
                          handleSuggestionClick("Tôi cần tư vấn về...")
                        }
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
                      >
                        "Tôi cần tư vấn về..."
                      </div>
                      <div
                        onClick={() =>
                          handleSuggestionClick("Triệu chứng của tôi là...")
                        }
                        className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
                      >
                        "Triệu chứng của tôi là..."
                      </div>
                      <div
                        onClick={() =>
                          handleSuggestionClick("Tôi muốn hỏi về...")
                        }
                        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
                      >
                        "Tôi muốn hỏi về..."
                      </div>
                    </>
                  )}
                  {userRole === "Doctor" && (
                    <>
                      <div
                        onClick={() =>
                          handleSuggestionClick("Bạn có triệu chứng gì?")
                        }
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
                      >
                        "Bạn có triệu chứng gì?"
                      </div>
                      <div
                        onClick={() =>
                          handleSuggestionClick(
                            "Khi nào bạn bắt đầu cảm thấy..."
                          )
                        }
                        className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-105"
                      >
                        "Khi nào bạn bắt đầu cảm thấy..."
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderid === myId ? "justify-end" : "justify-start"
                    }`}
                >
                  <div className="flex items-end space-x-2 max-w-md">
                    {msg.senderid !== myId && (
                      <>
                        {selectedUser.avatarUrl ? (
                          <img
                            src={selectedUser.avatarUrl}
                            alt={`${selectedUser.fullName}'s avatar`}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </>
                    )}
                    <div
                      className={`relative p-4 rounded-xl shadow-lg ${msg.senderid === myId
                        ? "bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-300 text-gray-800"
                        : "bg-gradient-to-r from-purple-200 via-pink-200 to-pink-300 text-gray-800"
                        }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className="block text-xs mt-2 text-[#ffffff]/110">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                      <div
                        className={`absolute bottom-0 ${msg.senderid === myId
                          ? "right-0 transform translate-x-1 translate-y-1"
                          : "left-0 transform -translate-x-1 translate-y-1"
                          }`}
                      >
                        <div
                          className={`w-3 h-3 transform rotate-45 ${msg.senderid === myId
                            ? "bg-gradient-to-r from-pink-200 to-indigo-300"
                            : "bg-white/90 border-r border-b border-[#C8A2C8]/40"
                            }`}
                        ></div>
                      </div>
                    </div>
                    {/* avatar myId */}
                    {msg.senderid === myId && (
                      <>
                        {myAvatarUrl ? (
                          <img
                            src={myAvatarUrl}
                            alt="Your avatar"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#C8A2C8] to-[#6B728E] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-[#C8A2C8]/40  backdrop-blur-xs rounded-b-2xl">
            <div className="flex items-center space-x-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-4 pr-12 bg-white/30 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A2C8] focus:border-transparent transition-all duration-200 placeholder-[#ffffff]/80"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="bg-gradient-to-r from-[#C8A2C8] to-[#6B728E] text-white p-4 rounded-full hover:brightness-110 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center relative z-20">
          <div className="text-center bg-gradient-to-br from-[#EBDCF1]/40 to-[#FDF2F8]/30 backdrop-blur-3xl rounded-2xl shadow-2xl p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C8A2C8]/40 to-[#6B728E]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-12 h-12 text-[#C8A2C8]" />
            </div>
            <h3 className="text-xl font-semibold text-[#ffffff] mb-2">
              Welcome to {userRole === "Doctor" ? "Patient" : "Doctor"} Chat
            </h3>
            <p className="text-[#ffffff]/80 max-w-md">
              Select a {userRole === "Doctor" ? "patient" : "doctor"} from the
              sidebar to start a conversation
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
