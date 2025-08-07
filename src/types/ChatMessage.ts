export interface ChatMessage {
  _id: string;
  businessId: string;
  sessionId: string;
  message: string;
  senderType: 'customer' | 'ai' | 'agent' | 'system';
  agentId?: string | null;
  isGoodResponse?: boolean | null;
  systemMessageType?: 
    | 'agent_joined' 
    | 'agent_left' 
    | 'customer_joined' 
    | 'customer_left'
    | 'chat_started'
    | 'chat_ended'
    | 'agent_assigned'
    | 'agent_reassigned'
    | 'queue_joined'
    | 'queue_left'
    | null;
  escalationId?: string | null;
  createdAt: string;
  updatedAt: string;
}
