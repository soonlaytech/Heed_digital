import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, MessageCircle, Send, Sparkles, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildChatHeaders, getStoredChatConversationId, setStoredChatConversationId } from "@/lib/chat-session";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = ["I feel overwhelmed today", "Help me plan my day", "I'm feeling lonely"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || initializedRef.current) {
      return;
    }

    let cancelled = false;

    async function initializeConversation() {
      setIsInitializing(true);
      try {
        const headers = buildChatHeaders();
        const listResponse = await fetch("/api/conversations", { headers });
        if (!listResponse.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const conversations = await listResponse.json();
        const storedConversationId = getStoredChatConversationId();
        const activeConversation = conversations.find((conversation: { id: number }) => String(conversation.id) === storedConversationId) || conversations[0];

        if (cancelled) return;

        if (activeConversation) {
          setConversationId(activeConversation.id);
          setStoredChatConversationId(activeConversation.id);

          const detailResponse = await fetch(`/api/conversations/${activeConversation.id}`, { headers });
          if (detailResponse.ok && !cancelled) {
            const detail = await detailResponse.json();
            setMessages(detail.messages ?? []);
          }
        } else {
          const createResponse = await fetch("/api/conversations", {
            method: "POST",
            headers,
            body: JSON.stringify({ title: "HEED Companion" }),
          });

          if (createResponse.ok && !cancelled) {
            const conversation = await createResponse.json();
            setConversationId(conversation.id);
            setStoredChatConversationId(conversation.id);
            setMessages([]);
          }
        }

        initializedRef.current = true;
      } catch (error) {
        console.warn("Could not initialize HEED chat widget", error);
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    initializeConversation();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const sendMessage = async (messageText: string = input) => {
    const content = messageText.trim();
    if (!content || !conversationId || isSending) {
      return;
    }

    const userMessage: Message = { id: Date.now(), role: "user", content };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: buildChatHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.reply || data.message || "I'm here to listen.";
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", content: assistantReply }]);
    } catch (error) {
      console.error("Failed to send message from widget:", error);
      setMessages((current) => [...current, { id: Date.now() + 2, role: "assistant", content: "I’m having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[min(92vw,24rem)] overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl shadow-black/10"
          >
            <div className="flex items-center justify-between border-b border-border/50 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">HEED Companion</p>
                  <p className="text-xs text-muted-foreground">Gentle support for your day</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[30rem] space-y-6 overflow-y-auto bg-white p-4">
              {messages.length === 0 ? (
                <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Welcome to HEED</span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Tell me how your day is going, what feels heavy, or what you want help organizing.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div key={message.id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-[85%] items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-accent text-white" : "bg-primary text-white"}`}>
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${isUser ? "bg-accent/10 text-foreground" : "bg-white text-foreground border border-border/60"}`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(isInitializing || isSending) && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 pt-1 flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
              className="border-t border-border/70 bg-white p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Say what’s on your mind..."
                  className="min-h-[46px] flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
                  disabled={!input.trim() || isSending || isInitializing || !conversationId}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="h-14 rounded-full px-5 font-semibold text-white shadow-xl"
        style={{
          background: "linear-gradient(160deg, #16955A 0%, #0F7A3A 55%, #0A5829 100%)",
          boxShadow: "0 14px 30px -10px rgba(15,122,58,.55), inset 0 1px 0 rgba(255,255,255,.18)",
        }}
      >
        {open ? <ChevronDown className="mr-2 h-5 w-5" /> : <MessageCircle className="mr-2 h-5 w-5" />}
        {open ? "Close" : "Chat with HEED"}
      </Button>
    </div>
  );
}
