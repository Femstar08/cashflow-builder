"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AIChatPanelProps = {
  onSendMessage: (message: string) => Promise<string>;
  isProcessing?: boolean;
};

export function AIChatPanel({ onSendMessage, isProcessing = false }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your assistant. Ask me anything about your cashflow forecast, get insights, or request recommendations. Try asking: 'What are my biggest expenses?' or 'How can I improve my cashflow?'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await onSendMessage(userMessage.content);
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const quickQuestions = [
    "What are my biggest expenses?",
    "How can I improve cashflow?",
    "When will I break even?",
    "What revenue streams are performing best?",
  ];

  return (
    <Card
      title="Insights"
      className="border-2 border-[#53E9C5]/30 bg-gradient-to-br from-white to-[#53E9C5]/5 h-[600px] flex flex-col"
    >
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[#53E9C5] text-[#15213C]"
                  : "bg-white border-2 border-[#5C6478]/20 text-[#5C6478]"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-[#5C6478]/20 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-[#53E9C5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 bg-[#53E9C5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 bg-[#53E9C5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t-2 border-[#5C6478]/20 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => setInput(question)}
              className="rounded-full border border-[#5C6478]/30 bg-white px-3 py-1 text-xs text-[#5C6478] hover:bg-[#53E9C5]/10 hover:border-[#53E9C5] transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me anything about your cashflow..."
            className="flex-1 rounded-lg border-2 border-[#5C6478]/20 px-4 py-2 text-sm outline-none focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] px-6"
          >
            {isSending ? "..." : "Send"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

