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
          `http://localhost:3000/api/chat-users/${userRole}/${localStorage.getItem(
            "profileId"
          )}`
        );
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };

    fetchChatUsers();
  }, [userRole]);

  console.log("user", users);

  useEffect(() => {
    // const fetchMyself = async () => {
    //   const { data, error } = await supabase.auth.getUser();
    //   console.log("data", data);

    //   if (data?.user) {
    //     setMyId(data.user.id);
    //     localStorage.setItem("id", data.user.id);
    //   } else {
    //     console.error("Could not get current user:", error);
    //   }
    // };

    const fetchMyself = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log(data);
        localStorage.setItem("id", data.Id);
      } catch (error) {
        console.log(error);
      }
    };

    // fetchMyself();
  }, [userRole, userId]);

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

  console.log("Sending message from", myId, "to", selectedUser?.Id);

  console.log(users);
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r shadow-lg">
        <div className="p-6 border-b flex items-center space-x-3">
          <MessageCircle className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            {userRole === "Doctor" ? "Patient Chat" : "Doctor Chat"}
          </h2>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            {userRole === "Doctor" ? "Patients" : "Doctors"}
          </h3>
          <div className="space-y-2">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.Id}
                  onClick={() => loadMessages(user.Id)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedUser?.Id === user.Id
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <User className="w-6 h-6 mr-3" />
                  <div className="flex-grow">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {user.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No users available</p>
            )}
          </div>
        </div>
      </div>

      {selectedUser ? (
        <div className="flex-grow flex flex-col">
          <div className="bg-white p-4 shadow-sm flex items-center">
            <User className="w-8 h-8 mr-3" />
            <div>
              <h4 className="font-semibold text-lg">{selectedUser.fullName}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <Circle
                  className={`w-2 h-2 mr-2 ${
                    selectedUser.isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                />
                {selectedUser.isOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderid === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md p-3 rounded-lg ${
                    msg.senderid === userId
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {msg.content}
                  <span className="block text-xs opacity-75 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="bg-white p-4 border-t flex items-center space-x-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-50 text-gray-500">
          <p>Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
