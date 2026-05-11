import { getDb, nextSequence } from "../../db";

export interface ConversationRecord {
  id: number;
  userId: string;
  title: string;
  createdAt: Date;
}

export interface MessageRecord {
  id: number;
  conversationId: number;
  userId: string;
  role: string;
  content: string;
  createdAt: Date;
}

async function getCollections() {
  const db = await getDb();
  return {
    conversations: db.collection<ConversationRecord>("conversations"),
    messages: db.collection<MessageRecord>("messages"),
  };
}

export interface IChatStorage {
  getConversation(id: number, userId: string): Promise<ConversationRecord | undefined>;
  getAllConversations(userId: string): Promise<ConversationRecord[]>;
  createConversation(title: string, userId: string): Promise<ConversationRecord>;
  deleteConversation(id: number, userId: string): Promise<void>;
  getMessagesByConversation(conversationId: number, userId: string): Promise<MessageRecord[]>;
  createMessage(conversationId: number, userId: string, role: string, content: string): Promise<MessageRecord>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number, userId: string) {
    const { conversations } = await getCollections();
    return (await conversations.findOne({ id, userId })) || undefined;
  },

  async getAllConversations(userId: string) {
    const { conversations } = await getCollections();
    return conversations.find({ userId }).sort({ createdAt: -1, id: -1 }).toArray();
  },

  async createConversation(title: string, userId: string) {
    const { conversations } = await getCollections();
    const conversation: ConversationRecord = {
      id: await nextSequence("conversations"),
      title,
      userId,
      createdAt: new Date(),
    };
    await conversations.insertOne(conversation);
    return conversation;
  },

  async deleteConversation(id: number, userId: string) {
    const { conversations, messages } = await getCollections();
    await messages.deleteMany({ conversationId: id, userId });
    await conversations.deleteOne({ id, userId });
  },

  async getMessagesByConversation(conversationId: number, userId: string) {
    const { messages } = await getCollections();
    return messages.find({ conversationId, userId }).sort({ createdAt: 1, id: 1 }).toArray();
  },

  async createMessage(conversationId: number, userId: string, role: string, content: string) {
    const { messages, conversations } = await getCollections();
    const conversation = await conversations.findOne({ id: conversationId, userId });
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message: MessageRecord = {
      id: await nextSequence("messages"),
      conversationId,
      userId,
      role,
      content,
      createdAt: new Date(),
    };
    await messages.insertOne(message);
    return message;
  },
};

