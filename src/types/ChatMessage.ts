export interface ChatMessage {
  _id: string;
  businessId: string;
  sessionId: string;
  message: string;
  senderType: 'customer' | 'ai' | 'agent';
  agentId?: string | null;
  isGoodResponse?: boolean | null;
  createdAt: string;
  updatedAt: string;
}
