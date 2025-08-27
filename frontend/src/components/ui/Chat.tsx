// // src/components/ui/Chat.tsx

// "use client"

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { chatAPI } from "@/lib/api/chat";
// import { useAuthStore, useConversationStore, useUserStore } from "@/lib/store";
// import { format } from "date-fns";
// import { MessageCircle, Send } from "lucide-react";
// import { useEffect, useLayoutEffect, useRef, useState } from "react"; // Import useLayoutEffect

// function safeFormatDate(dateString: string) {
//   const date = new Date(dateString);
//   return isNaN(date.getTime())
//     ? 'Invalid Date'
//     : format(date, "PPP p");
// }

// interface ChatProps {}

// export function Chat() {
//   const { user: authUser, token: authToken } = useAuthStore();
//   const { users, setUsers } = useUserStore();
//   const {
//     conversations,
//     setConversations,
//     messages,
//     setMessages,
//     markMessagesAsRead,
//     connectWebSocket,
//     disconnectWebSocket,
//     sendWebSocketMessage,
//     setCurrentConversation,
//     currentConversation,
//   } = useConversationStore();
//   const [message, setMessage] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const otherUsers = users.filter(u => u.id !== authUser?.id);
//   const selectedRecipientId = currentConversation && typeof currentConversation === 'string'
//     ? currentConversation.split('-').find(id => id !== authUser?.id)
//     : null;
  
//   // Safely find the recipient data
//   const selectedRecipientData = selectedRecipientId 
//     ? users?.find((user) => user?.id?.toString() === selectedRecipientId?.toString())
//     : null;

//   // Effect to load initial chat users and conversations
//   useEffect(() => {
//     const fetchChatData = async () => {
//       if (!authToken) return;
//       try {
//         const [fetchedUsers, fetchedConversations] = await Promise.all([
//           chatAPI.getChatUsers(),
//           chatAPI.getConversations(),
//         ]);
//         setUsers(fetchedUsers);
//         setConversations(fetchedConversations);
//       } catch (error) {
//         console.error("Failed to fetch chat data:", error);
//       }
//     };

//     fetchChatData();
//   }, [authToken, setUsers, setConversations]); // Added dependencies

//   // Effect to load messages for the current conversation
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (currentConversation && authUser) {
//         try {
//           const fetchedMessages = await chatAPI.getMessages(authUser.id); // Assuming getMessages can filter by conversation or fetches all then we filter
//           // Filter messages relevant to the current conversation
//           const relevantMessages = fetchedMessages.filter(msg => msg.conversationId === currentConversation);
//           setMessages(currentConversation, relevantMessages);
//           // Mark messages as read if current user is the recipient
//           if (selectedRecipientData) {
//             markMessagesAsRead(currentConversation, authUser.id);
//           }
//         } catch (error) {
//           console.error(`Failed to fetch messages for conversation ${currentConversation}:`, error);
//         }
//       }
//     };
//     fetchMessages();
//   }, [currentConversation, authUser, setMessages, markMessagesAsRead, selectedRecipientData]);


//   // Effect for WebSocket connection and disconnection
//   useEffect(() => {
//     if (authUser && authToken) {
//       connectWebSocket(authUser.id, authToken);
//     }

//     return () => {
//       disconnectWebSocket();
//     };
//   }, [authUser, authToken, connectWebSocket, disconnectWebSocket]);

//   // Use useLayoutEffect for scroll manipulation, triggered only when messages for current conversation change
//   useLayoutEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
//     }
//   }, [messages[currentConversation]]);


//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (message.trim() && authUser && selectedRecipientId) {
//       sendWebSocketMessage({
//         type: 'chat_message',
//         sender_id: authUser.id,
//         recipient_id: selectedRecipientId,
//         message: message.trim(),
//       });
//       setMessage(""); // Clear input after sending
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage(e);
//     }
//   };

//   // Add null check for conversations before sorting
//   const sortedConversations = conversations ? [...conversations].sort((a, b) => {
//     const dateA = a?.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt).getTime() : 0;
//     const dateB = b?.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt).getTime() : 0;
//     return dateB - dateA;
//   }) : [];

//   return (
//     <div className="flex h-full bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
//       {/* Sidebar for conversations */}
//       <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
//         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversations</h2>
//         </div>
//         <ScrollArea className="flex-1 overflow-y-auto">
//           {sortedConversations.length > 0 ? (
//             sortedConversations.map((conv) => {
//               const otherParticipantId = conv?.participants?.find(pId => pId !== authUser?.id);
//               // IMPORTANT: Apply optional chaining here as well
//               const otherParticipant = users?.find(u => u.id === otherParticipantId);
//               const isSelected = currentConversation === conv.id;
//               return (
//                 <div
//                   key={conv.id}
//                   className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isSelected ? 'bg-yellow-100 dark:bg-yellow-800' : ''}`}
//                   onClick={() => setCurrentConversation(conv.id)}
//                 >
//                   <Avatar className="h-10 w-10">
//                     <AvatarImage src={otherParticipant?.profile_picture || "/placeholder-user.jpg"} />
//                     <AvatarFallback>{otherParticipant?.first_name ? otherParticipant.first_name[0] : '?'}</AvatarFallback>
//                   </Avatar>
//                   <div className="ml-3 flex-1">
//                     <div className="flex items-center justify-between">
//                       <h3 className="font-medium text-gray-900 dark:text-white">{otherParticipant?.first_name} {otherParticipant?.last_name}</h3>
//                       {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
//                         <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
//                           {conv.unreadCount}
//                         </span>
//                       )}
//                     </div>
//                     {conv.lastMessage && (
//                       <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
//                         {conv.lastMessage.content}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="p-4 text-center text-gray-500 dark:text-gray-400">No conversations yet.</div>
//           )}
//         </ScrollArea>
//       </div>

//       {/* Main chat area */}
//       <div className="flex-1 flex flex-col">
//         {selectedRecipientData ? (
//           <>
//             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-800">
//               <Avatar className="h-10 w-10">
//                 <AvatarImage src={selectedRecipientData.profile_picture || "/placeholder-user.jpg"} />
//                 <AvatarFallback>{selectedRecipientData.first_name[0]}</AvatarFallback>
//               </Avatar>
//               <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
//                 {selectedRecipientData.first_name} {selectedRecipientData.last_name}
//               </h2>
//             </div>

//             <ScrollArea className="flex-1 p-4 space-y-4 overflow-y-auto">
//               {messages[currentConversation]?.map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`flex ${msg.senderId === authUser?.id ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <div
//                     className={`max-w-[70%] p-3 rounded-lg ${
//                       msg.senderId === authUser?.id
//                         ? 'bg-yellow-500 text-white rounded-br-none'
//                         : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
//                     }`}
//                   >
//                     <p className="text-sm">{msg.content}</p>
//                     <p className="text-xs text-right opacity-75 mt-1">
//                       {safeFormatDate(msg.sentAt)}
//                     </p>
//                     {msg.senderId === authUser?.id && (
//                       <p className="text-xs text-right opacity-75 mt-1">
//                         {msg.readBy.length > 1 ? 'Read' : 'Sent'} {/* Simple read indicator */}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} /> {/* For auto-scrolling */}
//             </ScrollArea>

//             <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//               <form onSubmit={handleSendMessage} className="relative flex items-center">
//                 <input
//                   type="text"
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Type a message..."
//                   className="w-full p-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
//                 />
//                 <button
//                   type="submit"
//                   disabled={!message.trim()}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Send className="h-5 w-5" />
//                 </button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
//             <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
//               <MessageCircle className="h-10 w-10 text-yellow-400" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Start by selecting a conversation from the sidebar to view messages.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }