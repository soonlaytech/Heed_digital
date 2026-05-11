import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Brain, Moon, Utensils, Zap, Heart, Users, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildChatHeaders, getStoredChatConversationId, setStoredChatConversationId } from "@/lib/chat-session";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

type PatternCondition =
  | "poor_sleep" | "fatigue" | "skipped_meals"
  | "low_productivity" | "stress" | "social_isolation"
  | "positive_mood" | "good_streak" | "none";

interface ActivePattern {
  condition: PatternCondition;
  confidence: "low" | "medium" | "high";
}

interface BehaviorProfileSummary {
  dominantCondition: PatternCondition;
  activePatterns: ActivePattern[];
  streakDays: number;
}
// ─── Pattern Display Config ───────────────────────────────────────────────────

const PATTERN_CONFIG: Record<
  PatternCondition,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  poor_sleep:        { label: "Sleep issues detected", icon: <Moon className="w-3 h-3" />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  fatigue:           { label: "Fatigue noticed",        icon: <Zap className="w-3 h-3" />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  skipped_meals:     { label: "Meal gaps noticed",      icon: <Utensils className="w-3 h-3" />, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  low_productivity:  { label: "Low energy days",        icon: <Brain className="w-3 h-3" />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  stress:            { label: "Stress signals",         icon: <Heart className="w-3 h-3" />, color: "text-red-700", bg: "bg-red-50 border-red-200" },
  social_isolation:  { label: "Isolation noticed",      icon: <Users className="w-3 h-3" />, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
  positive_mood:     { label: "Good vibes!",            icon: <Star className="w-3 h-3" />, color: "text-green-700", bg: "bg-green-50 border-green-200" },
  good_streak:       { label: "On a streak!",           icon: <Star className="w-3 h-3" />, color: "text-green-700", bg: "bg-green-50 border-green-200" },
  none:              { label: "Getting to know you",    icon: <Brain className="w-3 h-3" />, color: "text-gray-500", bg: "bg-gray-50 border-gray-100" },
};

// ─── Pattern Badge Component ─────────────────────────────────────────────────

function PatternBadge({ condition }: { condition: PatternCondition }) {
  const config = PATTERN_CONFIG[condition] || PATTERN_CONFIG.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// ─── Main Chat Component ──────────────────────────────────────────────────────

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [profile, setProfile] = useState<BehaviorProfileSummary | null>(null);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation + fetch initial behavior profile
  useEffect(() => {
    async function init() {
      try {
        const headers = buildChatHeaders();
        const existingConversations = await fetch("/api/conversations", { headers });
        if (existingConversations.ok) {
          const conversations = await existingConversations.json();
          const storedConversationId = getStoredChatConversationId();
          const activeConversation = conversations.find((conv: any) => String(conv.id) === storedConversationId) || conversations[0];

          if (activeConversation) {
            setConversationId(activeConversation.id);
            setStoredChatConversationId(activeConversation.id);

            const conversationResponse = await fetch(`/api/conversations/${activeConversation.id}`, { headers });
            if (conversationResponse.ok) {
              const detail = await conversationResponse.json();
              setMessages(detail.messages ?? []);
            }
          } else {
            const createRes = await fetch("/api/conversations", {
              method: "POST",
              headers,
              body: JSON.stringify({ title: "Daily Chat" }),
            });
            if (createRes.ok) {
              const conv = await createRes.json();
              setConversationId(conv.id);
              setStoredChatConversationId(conv.id);
            }
          }
        }

        const profileRes = await fetch("/api/behavior-profile", { headers: buildChatHeaders() });
        if (profileRes.ok) {
          const data: BehaviorProfileSummary = await profileRes.json();
          setProfile(data);
          if (data.dominantCondition !== "none" && data.activePatterns.length > 0) {
            setShowProfileBanner(true);
            setTimeout(() => setShowProfileBanner(false), 5001);
          }
        }
      } catch (e) {
        console.warn("Could not initialize chat", e);
      }
    }
    init();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || isStreaming) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: buildChatHeaders(),
        body: JSON.stringify({ content: userMsg.content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const assistantReply = data.reply || data.message || "I'm here to listen.";

      const assistantMsg: Message = { id: Date.now() + 1, role: "assistant", content: assistantReply };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error("Failed to send chat message:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }] );
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen min-h-0 overflow-hidden bg-[#FDFBF7]">

      {/* Behavior Profile Banner — appears briefly when patterns detected */}
      <AnimatePresence>
        {showProfileBanner && profile && profile.dominantCondition !== "none" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center gap-2 flex-wrap"
          >
            <Brain className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium">HEED has learned from your history:</span>
            {profile.activePatterns.slice(0, 3).map(p => (
              <PatternBadge key={p.condition} condition={p.condition} />
            ))}
            {profile.streakDays >= 2 && (
              <span className="text-xs text-green-600 font-medium">🔥 {profile.streakDays}-day streak</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6" ref={scrollRef}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-display font-medium text-foreground mb-1">I'm here to listen</h3>
            <p className="text-muted-foreground text-sm mb-4">Tell me how you're doing, or what's on your mind.</p>

            {/* Show detected patterns in empty state */}
            {profile && profile.activePatterns.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground mb-1 w-full">I've noticed from our history:</span>
                {profile.activePatterns.slice(0, 3).map(p => (
                  <PatternBadge key={p.condition} condition={p.condition} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${isUser ? "bg-accent text-white" : "bg-primary text-white"}
                `}>
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div
                  className={`whitespace-pre-line rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-accent/10 text-foreground"
                      : "bg-white text-foreground border border-border/60"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isStreaming && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Invisible element for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-border">
        {/* Active pattern indicator above input */}
        {profile && profile.dominantCondition !== "none" && messages.length > 0 && (
          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Responding with awareness of: </span>
            <PatternBadge condition={profile.dominantCondition} />
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="max-w-3xl mx-auto flex gap-3"
        >
          <input
            ref={inputRef}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Tell me how you're feeling..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            className="h-[50px] w-[50px] rounded-xl bg-primary hover:bg-primary/90"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
