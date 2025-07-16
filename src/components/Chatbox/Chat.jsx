import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, User, Send, Circle } from "lucide-react";
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
          `${
            import.meta.env.VITE_API
          }/chat-users/${userRole}/${localStorage.getItem("profileId")}`
        );
        const data = await res.json();
        setUsers(data);
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

  // Tự động scroll xuống cuối khi có tin nhắn
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex max-w-full bg-[#ffffff] h-screen overflow-y-auto py-6 px-3 rounded-2xl">
      {/* Sidebar */}
      <div className="w-1/4 bg-white/90 backdrop-blur-sm border-r border-indigo-200 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-indigo-100 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center space-x-3 rounded-3xl">
            <div className="p-2 bg-white/20 rounded-3xl backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {userRole === "Doctor" ? "Patient Chat" : "Doctor Chat"}
              </h2>
              <p className="text-blue-100 text-sm">Connect & Communicate</p>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {userRole === "Doctor" ? "Patients" : "Doctors"}
            </h3>
            {/* <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {users.length} online
            </div> */}
          </div>

          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.Id}
                  onClick={() => loadMessages(user.Id)}
                  className={`group flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedUser?.Id === user.Id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border border-transparent hover:border-blue-200"
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedUser?.Id === user.Id
                          ? "bg-white/20"
                          : "bg-gradient-to-br from-blue-400 to-indigo-500"
                      }`}
                    >
                      <User
                        className={`w-6 h-6 ${
                          selectedUser?.Id === user.Id
                            ? "text-white"
                            : "text-white"
                        }`}
                      />
                    </div>
                    {/* <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                        user.isOnline
                          ? "bg-green-400 border-green-300"
                          : "bg-gray-400 border-gray-300"
                      } ${
                        selectedUser?.Id === user.Id
                          ? "border-white"
                          : "border-white"
                      }`}
                    ></div> */}
                  </div>
                  <div className="ml-4 flex-grow">
                    <p
                      className={`font-semibold ${
                        selectedUser?.Id === user.Id
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      {user.fullName}
                    </p>
                    {/* <div className="flex items-center mt-1">
                      <Circle
                        className={`w-2 h-2 mr-2 ${
                          user.isOnline
                            ? "text-green-400 fill-current"
                            : "text-gray-400 fill-current"
                        }`}
                      />
                      <p
                        className={`text-xs ${
                          selectedUser?.Id === user.Id
                            ? "text-blue-100"
                            : user.isOnline
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {user.isOnline ? "Online" : "Offline"}
                      </p>
                    </div> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No users available</p>
                <p className="text-gray-400 text-sm">Check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUser ? (
        <div className="flex-grow flex flex-col bg-white/50 backdrop-blur-sm">
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-sm p-6 shadow-sm border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  {/* <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      selectedUser.isOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                  ></div> */}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-gray-800">
                    {selectedUser.fullName}
                  </h4>
                  {/* <div className="flex items-center text-sm">
                    <Circle
                      className={`w-2 h-2 mr-2 ${
                        selectedUser.isOnline
                          ? "text-green-500 fill-current"
                          : "text-gray-400 fill-current"
                      }`}
                    />
                    <span
                      className={
                        selectedUser.isOnline
                          ? "text-green-600 font-medium"
                          : "text-gray-500"
                      }
                    >
                      {selectedUser.isOnline ? "Online" : "Offline"}
                    </span>
                  </div> */}
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {userRole === "Doctor" ? "Patient" : "Doctor"}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/30 to-blue-50/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderid === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-end space-x-2 max-w-md">
                    {msg.senderid !== userId && (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`relative p-4 rounded-2xl shadow-lg ${
                        msg.senderid === userId
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <span
                        className={`block text-xs mt-2 ${
                          msg.senderid === userId
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                      {/* Message tail */}
                      <div
                        className={`absolute bottom-0 ${
                          msg.senderid === userId
                            ? "right-0 transform translate-x-1 translate-y-1"
                            : "left-0 transform -translate-x-1 translate-y-1"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 transform rotate-45 ${
                            msg.senderid === userId
                              ? "bg-indigo-600"
                              : "bg-white border-r border-b border-gray-200"
                          }`}
                        ></div>
                      </div>
                    </div>
                    {msg.senderid === userId && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-sm p-6 border-t border-indigo-100">
            <div className="flex items-center space-x-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-white/50 to-blue-50/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to {userRole === "Doctor" ? "Patient" : "Doctor"} Chat
            </h3>
            <p className="text-gray-500 max-w-md">
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
