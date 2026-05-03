import { useEffect, useRef, useState } from "react";
import popSound from "../../assets/sounds/Pop.mp3";
import notificationSound from "../../assets/sounds/Notify.mp3";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/button";
import { FaArrowUp } from "react-icons/fa";

import { promptGemini } from "@/lib/services/api";
import TypingIndicator from "./Typingindicator";

// Audio
const popAudio = new Audio(popSound);
popAudio.volume = 0.2;

const notificationAudio = new Audio(notificationSound);
notificationAudio.volume = 0.2;

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState("");
  const lastMessageRef = useRef(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function passPrompt() {
    const userMessage = prompt;

    setMessages((curr) => [...curr, { content: userMessage, role: "user" }]);

    setPrompt("");
    popAudio.play();

    handlePromptOpenai(userMessage);
  }

  function handlePrompting(e) {
    e.preventDefault();
    passPrompt();
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      passPrompt();
    }
  };

  async function handlePromptOpenai(userMessage) {
    setIsBotTyping(true);

    try {
      const response = await promptGemini({
        message: userMessage,
      });

      setMessages((curr) => [
        ...curr,
        { content: response.response, role: "bot" },
      ]);

      setError("");
      notificationAudio.play();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsBotTyping(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header / Site Info */}
      <div className="px-4 py-3 border-b bg-white">
        <h1 className="text-lg font-semibold text-gray-800">
          UniHelp AI Chatbot 🤖
        </h1>
        <p className="text-xs text-gray-500">
          Ask anything about your university, courses, results & more
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border"
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isBotTyping && <TypingIndicator />}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form
          className="flex items-end gap-2 bg-gray-100 p-2 rounded-2xl"
          onSubmit={handlePrompting}
          onKeyDown={handleKeyDown}
        >
          <textarea
            className="flex-1 bg-transparent border-0 focus:outline-none resize-none text-sm"
            placeholder="Ask anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={1}
          />

          <Button
            disabled={prompt.trim().length < 1}
            className="rounded-full w-10 h-10"
          >
            <FaArrowUp />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
