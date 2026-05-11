const CHAT_USER_ID_KEY = "heed_chat_user_id";
const CHAT_CONVERSATION_ID_KEY = "heed_chat_conversation_id";

function createGuestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getChatUserId() {
  if (typeof window === "undefined") {
    return "guest-server";
  }

  const stored = window.localStorage.getItem(CHAT_USER_ID_KEY);
  if (stored) {
    return stored;
  }

  const userId = createGuestId();
  window.localStorage.setItem(CHAT_USER_ID_KEY, userId);
  return userId;
}

export function getStoredChatConversationId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CHAT_CONVERSATION_ID_KEY);
}

export function setStoredChatConversationId(conversationId: number | string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAT_CONVERSATION_ID_KEY, String(conversationId));
}

export function buildChatHeaders() {
  return {
    "Content-Type": "application/json",
    "x-heed-user-id": getChatUserId(),
  };
}
