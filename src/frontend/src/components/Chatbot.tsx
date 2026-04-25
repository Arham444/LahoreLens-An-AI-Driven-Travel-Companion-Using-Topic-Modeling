import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Salam! 👋 I'm **LahoreLens AI** — your personal Lahore travel assistant.\n\nAsk me anything about Lahore's food, landmarks, history, or help me plan your trip!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resize state
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initialize position when opened
  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      const x = window.innerWidth - (isExpanded ? 520 : 400) - 24;
      const y = window.innerHeight - (isExpanded ? 650 : 540) - 24;
      setPosition({ x, y });
    }
  }, [isOpen]);

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!chatContainerRef.current) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      // Clamp to viewport
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Reset position on resize toggle
  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      const w = next ? 520 : 400;
      const h = next ? 650 : 540;
      setPosition({
        x: Math.min(position.x, window.innerWidth - w - 10),
        y: Math.min(position.y, window.innerHeight - h - 10),
      });
      return next;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Send chat history for context
      const history = messages
        .filter((m) => m.id !== "1") // skip initial greeting
        .map((m) => ({ text: m.text, sender: m.sender }));

      const res = await axios.post(`${API_URL}/api/gemini/chat`, {
        message: currentInput,
        history,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: res.data.reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorText =
        err.response?.status === 503
          ? "I'm currently offline. The AI service isn't available right now. 😔"
          : err.response?.status === 429
          ? "I'm getting a lot of questions right now! Please wait a moment and try again. ⏳"
          : err.response?.status === 401
          ? "There's an issue with the AI configuration. Please contact the team."
          : err.message?.includes("Network Error")
          ? "Can't reach the server. Please check your internet connection. 🌐"
          : "Sorry, I couldn't process that. Please try again! 🔄";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown-ish rendering for bold and newlines
  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j}>{part}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const chatWidth = isExpanded ? 520 : 400;
  const chatHeight = isExpanded ? 650 : 540;

  return (
    <>
      {/* ═══ OPEN CHAT PANEL ═══ */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="fixed z-50 bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            width: chatWidth,
            height: chatHeight,
            left: position.x,
            top: position.y,
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          {/* Header — draggable */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground select-none"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 opacity-60" />
              <Sparkles className="h-5 w-5" />
              <div>
                <h3 className="font-semibold text-sm">LahoreLens AI</h3>
                <p className="text-[10px] opacity-80">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className="hover:bg-primary-foreground/10 text-primary-foreground h-7 w-7"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-foreground/10 text-primary-foreground h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ overscrollBehavior: "contain" }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{renderText(message.text)}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about Lahore..."
                className="flex-1 rounded-full text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="rounded-full h-9 w-9"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FLOATING BUTTON ═══ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-xl bg-gradient-to-br from-primary to-primary/80 hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-7 w-7 text-white" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75" style={{ animationDuration: "2s" }} />
        </button>
      )}
    </>
  );
}
