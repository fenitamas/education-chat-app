"use client";
import { useState, useEffect } from "react";

export default function ChatRoomPage({ params }) {
  const { roomId } = params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`chat-${roomId}`);
    if (saved) setMessages(JSON.parse(saved));
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(`chat-${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { text: input, time: new Date().toLocaleTimeString(), sender: "You" },
    ]);
    setInput("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Chat Room: {roomId}</h1>

      <div className="border rounded-xl p-4 h-96 overflow-y-auto bg-white shadow-md">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 flex ${
                msg.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl shadow ${
                  msg.sender === "You"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs opacity-70">{msg.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border p-3 rounded-l-xl outline-none shadow"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 rounded-r-xl hover:bg-blue-700 shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
}