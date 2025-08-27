// // src/lib/api/messaging.ts

// import api from "@/lib/api";
// import type { Conversation, Message, User } from "@/lib/types";

// // The backend's ChatUserSerializer returns a User object with extra fields
// interface ChatUserResponse extends User {
//   unread_count: number;
//   last_message: {
//     message: string;
//     timestamp: string;
//     sender_id: number;
//     is_read: boolean;
//   } | null;
// }

// // The backend's ChatMessageSerializer returns a Message-like object
// interface ChatMessageResponse {
//     id: number;
//     sender: number;
//     recipient: number;
//     message: string;
//     image: string | null;
//     file: string | null;
//     timestamp: string;
//     is_read: boolean;
//     sender_details: User;
//     recipient_details: User;
// }

// // Helper to map backend user response to frontend Conversation type
// const mapToConversation = (user: ChatUserResponse): Conversation => ({
//   id: String(user.id),
//   participant: user,
//   lastMessage: user.last_message ? {
//     id: 'last-msg-' + user.id, // Synthesize an ID
//     conversationId: String(user.id),
//     senderId: String(user.last_message.sender_id),
//     content: user.last_message.message,
//     sentAt: new Date(user.last_message.timestamp),
//     readBy: user.last_message.is_read ? [String(user.id)] : [],
//   } : undefined,
//   unreadCount: user.unread_count,
// });

// // Helper to map backend message response to frontend Message type
// const mapToMessage = (msg: ChatMessageResponse): Message => ({
//     id: String(msg.id),
//     conversationId: String(msg.sender === api.defaults.headers.common['X-User-Id'] ? msg.recipient : msg.sender),
//     senderId: String(msg.sender),
//     content: msg.message,
//     sentAt: new Date(msg.timestamp),
//     readBy: msg.is_read ? [String(msg.recipient)] : [], // Assume read if is_read is true
//     attachment: msg.image || msg.file || undefined,
// });


// export const messagingAPI = {
//   /**
//    * Fetches the list of users the current user has had conversations with.
//    */
//   getConversations: async (): Promise<Conversation[]> => {
//     const response = await api.get<ChatUserResponse[]>("/chat/conversations/");
//     return response.data.map(mapToConversation);
//   },

//   /**
//    * Fetches the list of all staff and parents the user can potentially chat with.
//    */
//   getChatUsers: async (): Promise<User[]> => {
//     const response = await api.get<User[]>("/chat/users/");
//     return response.data;
//   },

//   /**
//    * Fetches the message history for a specific conversation (with another user).
//    * @param conversationId - The ID of the other user.
//    */
//   getMessages: async (conversationId: string): Promise<Message[]> => {
//     const response = await api.get<ChatMessageResponse[]>(`/chat/${conversationId}/messages/`);
//     return response.data.map(mapToMessage);
//   },

//   /**
//    * Sends a message to another user.
//    * @param messageData - The message payload. The 'conversationId' should be the recipient's ID.
//    */
//   sendMessage: async (messageData: Omit<Message, "id" | "sentAt" | "readBy">): Promise<Message> => {
//     const payload = {
//       message: messageData.content,
//       image: messageData.attachment?.includes("image") ? messageData.attachment : null, // Basic check
//       file: messageData.attachment && !messageData.attachment.includes("image") ? messageData.attachment : null,
//     };
//     const response = await api.post<ChatMessageResponse>(`/chat/${messageData.conversationId}/send/`, payload);
//     return mapToMessage(response.data);
//   },

//   /**
//    * Gets the total count of unread messages for the current user.
//    */
//   getUnreadMessagesCount: async (): Promise<number> => {
//     const response = await api.get<{ unread_count: number }>("/chat/unread-count/");
//     return response.data.unread_count;
//   },

//   /**
//    * Marks messages from a specific user as read.
//    * @param userId - The ID of the user whose messages should be marked as read.
//    */
//   markMessagesAsRead: async (userId: string): Promise<void> => {
//     await api.post(`/chat/${userId}/mark-as-read/`);
//   },

//   // createConversation is not needed as conversations are implicitly created by the first message.
//   createConversation: async (participantIds: string[], childId?: string): Promise<Conversation> => {
//     console.warn("This function is not used. A conversation is started by sending the first message.");
//     throw new Error("Not implemented: A conversation is started by sending the first message.");
//   },
// };