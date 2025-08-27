// // src/lib/api/chat.ts
// import api from '@/lib/api';
// import { Message, User } from '@/lib/types';

// export const chatAPI = {
//   getChatUsers: async (): Promise<User[]> => {
//     const response = await api.get<User[]>('/chat/users/');
//     return response.data.map(user => ({
//       ...user,
//       id: String(user.id),
//     }));
//   },
  
//   getConversations: async (): Promise<any[]> => {
//     const response = await api.get<any[]>('/chat/conversations/');
//     return response.data;
//   },

//   getMessages: async (userId: string): Promise<Message[]> => {
//     // CORRECTED ENDPOINT: matches backend API structure
//     const response = await api.get<any[]>(`/chat/${userId}/messages/`);
//     return response.data.map(msg => ({
//       ...msg,
//       id: String(msg.id),
//       conversationId: [msg.sender_id, msg.recipient_id].sort().join('-'),
//       senderId: String(msg.sender_id),
//       recipientId: String(msg.recipient_id),
//       sentAt: msg.sent_at || new Date().toISOString(),
//       readBy: msg.read_by?.map(String) || [],
//     }));
//   },

//   sendMessage: async (userId: string, content: string): Promise<Message> => {
//     // CORRECTED ENDPOINT
//     const response = await api.post<Message>(`/chat/${userId}/send/`, { content });
//     return {
//       ...response.data,
//       id: String(response.data.id),
//       senderId: String(response.data.sender_id),
//       recipientId: String(response.data.recipient_id),
//       readBy: response.data.read_by?.map(String) || [],
//     };
//   },
// };