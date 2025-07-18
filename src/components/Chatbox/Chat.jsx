import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, User, Send } from "lucide-react";
import supabase from "../../Supabase/supabaseClient";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const [myId, setMyId] = useState(localStorage.getItem("userId"));

  const realtimeChannelRef = useRef(null);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || !selectedUser.Id) return;

    const { error } = await supabase.from("ManageChat").insert({
      senderid: myId,
      receiverid: selectedUser.Id,
      content: messageInput,
    });

    if (!error) setMessageInput("");
    else console.error("Send message error:", error);
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
    await fetchMessages(id);
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API}/chat-users/${userRole}/${localStorage.getItem("profileId")}`
        );
        const usersData = await res.json();

        const usersWithAvatars = await Promise.all(
          usersData.map(async (user) => {
            try {
              const avatarRes = await fetch(
                `http://localhost:3000/api/profile/${user.Id}/image`
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
  }, [userRole]);

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

          if (isCurrentChat) {
            setMessages((prev) => [...prev, newMessage]);
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
                  className={`group flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:bg-white/20 ${selectedUser?.Id === user.Id
                    ? "bg-white/10 text-white"
                    : ""
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
                <p className="text-[#ffffff]/80 font-medium">No users available</p>
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
              <div className="flex flex-col items-center justify-center h-full text-[#ffffff]/80">
                <div className="w-20 h-20 bg-gradient-to-br from-[#EBDCF1]/40 to-[#FDF2F8]/30 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-[#C8A2C8]" />
                </div>
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderid === userId ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end space-x-2 max-w-md">
                    {msg.senderid !== userId && (
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
                      className={`relative p-4 rounded-xl shadow-lg ${msg.senderid === userId
                        ? "bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-300 text-gray-800"
                        : "bg-white/10 text-gray-700"
                        }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className="block text-xs mt-2 text-[#ffffff]/110">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                      <div
                        className={`absolute bottom-0 ${msg.senderid === userId
                          ? "right-0 transform translate-x-1 translate-y-1"
                          : "left-0 transform -translate-x-1 translate-y-1"
                          }`}
                      >
                        <div
                          className={`w-3 h-3 transform rotate-45 ${msg.senderid === userId
                            ? "bg-gradient-to-r from-pink-200 to-indigo-300"
                            : "bg-white/90 border-r border-b border-[#C8A2C8]/40"
                            }`}
                        ></div>
                      </div>
                    </div>
                    {msg.senderid === userId && (
                      <>
                        {selectedUser.avatarUrl ? (
                          <img
                            src={selectedUser.avatarUrl}
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
                  className="w-full p-4 pr-12 bg-white/60 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A2C8] focus:border-transparent transition-all duration-200 placeholder-[#ffffff]/80"
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