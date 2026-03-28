import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Annapurna AI. Ask me anything " }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // 🔥 Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/chatbot", {
        message: userMsg.text
      });

      const botMsg = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error 😢" }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col">

      {/* HEADER */}
      <div className="p-4 text-xl font-semibold border-b border-white/10">
         Annapurna AI Assistant
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                  : "bg-gray-800 text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="w-full flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl text-sm shadow-md">
              Typing...
            </div>
          </div>
        )}

        {/* Auto scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-4 border-t border-white/10 flex gap-3 items-center bg-black/30 backdrop-blur">

        <input
          className="flex-1 px-4 py-3 rounded-lg bg-gray-900 text-white outline-none border border-white/10 focus:border-purple-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything..."
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition active:scale-95"
        >
          Send 
        </button>
      </div>
    </div>
  );
}