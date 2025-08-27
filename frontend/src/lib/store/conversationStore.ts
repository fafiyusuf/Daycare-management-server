// // src/lib/store/conversationStore.ts
// import type { Conversation, Message } from "@/lib/types";
// import toast from "react-hot-toast";
// import { create } from "zustand";
// import { useAuthStore } from "./authStore";

// interface ConversationState {
//   socket: WebSocket | null
//   isConnected: boolean
//   isConnecting: boolean
//   conversations: Conversation[]
//   messages: Record<string, Message[]>
//   currentConversation: string | null
//   setConversations: (conversations: Conversation[]) => void
//   setMessages: (conversationId: string, messages: Message[]) => void
//   markMessagesAsRead: (conversationId: string, userId: string) => void
//   setCurrentConversation: (conversationId: string | null) => void
//   connectWebSocket: (userId: string, token: string) => void
//   disconnectWebSocket: () => void
//   sendWebSocketMessage: (messagePayload: {
//     type: string;
//     sender_id: string;
//     recipient_id: string;
//     message: string;
//   }) => void
// }

// export const useConversationStore = create<ConversationState>()((set, get) => ({
//   socket: null,
//   isConnected: false,
//   isConnecting: false,
//   conversations: [],
//   messages: {},
//   currentConversation: null,

//   setConversations: (conversations) => set({ conversations }),
//   setMessages: (conversationId, messages) => {
//       set((state) => ({
//         messages: { ...state.messages, [conversationId]: messages }
//       }))
//   },
//   markMessagesAsRead: (conversationId, userId) =>
//     set((state) => ({
//       messages: {
//         ...state.messages,
//         [conversationId]: state.messages[conversationId]?.map((msg) =>
//             !msg.readBy.includes(userId) ? { ...msg, readBy: [...msg.readBy, userId] } : msg
//           ) || [],
//       },
//       conversations: state.conversations.map(conv =>
//         conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
//       )
//     })),
//   setCurrentConversation: (conversationId) => set({ currentConversation: conversationId }),

//   connectWebSocket: (userId, token) => {
//     if (get().isConnecting || get().isConnected) return;

//     set({ isConnecting: true });
//     // Use the NEXT_PUBLIC_WEBSOCKET_URL from environment variables
//     const websocketBaseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
//     if (!websocketBaseUrl) {
//       console.error("NEXT_PUBLIC_WEBSOCKET_URL is not defined in environment variables.");
//       toast.error("WebSocket URL is not configured.");
//       set({ isConnecting: false });
//       return;
//     }
//     const socketUrl = `${websocketBaseUrl}ws/chat/${userId}/?token=${token}`;

//     const newSocket = new WebSocket(socketUrl);

//     newSocket.onopen = () => {
//       console.log('WebSocket connected!');
//       set({ socket: newSocket, isConnected: true, isConnecting: false });
//     };

//     newSocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === 'chat_message') {
//         const currentAuthUser = useAuthStore.getState().user;
//         if (!currentAuthUser) return;

//         const participantIds = [String(data.sender_id), String(data.recipient_id)].sort();
//         const incomingConversationId = participantIds.join('-');

//         set(state => {
//           const isViewingThisConversation = state.currentConversation === incomingConversationId;

//           // Prepare the received message, marking it as read if currently viewing the conversation
//           const receivedMessage: Message = {
//             id: data.message_id || `ws-msg-${Date.now()}`,
//             conversationId: incomingConversationId,
//             senderId: String(data.sender_id),
//             recipientId: String(data.recipient_id),
//             content: data.message,
//             type: 'text',
//             sentAt: data.timestamp || new Date().toISOString(),
//             // Ensure current user and recipient are in readBy if viewing, or based on data.is_read
//             readBy: isViewingThisConversation || data.is_read
//               ? Array.from(new Set([String(currentAuthUser.id), String(data.recipient_id), String(data.sender_id)]))
//               : [],
//           };

//           // Update conversations
//           const conversations = [...state.conversations];
//           const convIndex = conversations.findIndex(c => c.id === incomingConversationId);

//           if (convIndex > -1) {
//             const oldConv = conversations[convIndex];
//             // If viewing, unreadCount is 0, otherwise increment
//             const newUnreadCount = isViewingThisConversation ? 0 : (oldConv.unreadCount || 0) + 1;
//             conversations[convIndex] = { ...oldConv, lastMessage: receivedMessage, unreadCount: newUnreadCount };
//             // Move updated conversation to the top
//             const [updatedConv] = conversations.splice(convIndex, 1);
//             conversations.unshift(updatedConv);
//           } else {
//             // New conversation: add to the top and set unreadCount
//             conversations.unshift({
//               id: incomingConversationId,
//               participants: participantIds,
//               lastMessage: receivedMessage,
//               unreadCount: isViewingThisConversation ? 0 : 1
//             });
//           }

//           // Update messages for the specific conversation
//           const updatedMessagesForConversation = [
//             ...(state.messages[incomingConversationId] || []),
//             receivedMessage
//           ];

//           return {
//             conversations,
//             messages: {
//               ...state.messages,
//               [incomingConversationId]: updatedMessagesForConversation
//             }
//           };
//         });
//       }
//     };

//     newSocket.onclose = () => {
//       console.log('WebSocket disconnected');
//       set({ isConnected: false, isConnecting: false, socket: null });
//     };

//     newSocket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       toast.error("WebSocket connection error.");
//       set({ isConnected: false, isConnecting: false, socket: null });
//     };
//   },

//   disconnectWebSocket: () => {
//     get().socket?.close();
//     set({ socket: null, isConnected: false, isConnecting: false });
//     console.log('WebSocket closed.');
//   },

//   sendWebSocketMessage: (messagePayload) => {
//     const { socket, isConnected } = get();
//     const currentAuthUser = useAuthStore.getState().user;
//     if (!currentAuthUser) return;

//     if (socket && isConnected) {
//         socket.send(JSON.stringify(messagePayload));
//         const participantIds = [messagePayload.sender_id, messagePayload.recipient_id].sort();
//         const conversationId = participantIds.join('-');
//         const tempMessage: Message = {
//             id: `temp-${Date.now()}`,
//             conversationId,
//             senderId: messagePayload.sender_id,
//             recipientId: messagePayload.recipient_id,
//             content: messagePayload.message,
//             type: 'text',
//             sentAt: new Date().toISOString(),
//             readBy: [currentAuthUser.id],
//         };

//         set(state => {
//             const conversations = [...state.conversations];
//             const convIndex = conversations.findIndex(c => c.id === conversationId);
//             if (convIndex > -1) {
//                 conversations[convIndex] = { ...conversations[convIndex], lastMessage: tempMessage };
//                 const [updatedConv] = conversations.splice(convIndex, 1);
//                 conversations.unshift(updatedConv);
//             } else {
//                 conversations.unshift({ id: conversationId, participants: participantIds, lastMessage: tempMessage, unreadCount: 0 });
//             }
//             return {
//                 conversations,
//                 messages: {
//                     ...state.messages,
//                     [conversationId]: [...(state.messages[conversationId] || []), tempMessage]
//                 }
//             };
//         });
//     } else {
//       toast.error("Not connected. Please refresh.");
//     }
//   },
// }));