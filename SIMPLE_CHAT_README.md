# Simple Direct Messaging System

A straightforward direct messaging system for the daycare management system. Users can send simple text messages, images, and files to each other.

## Features

### ✅ What's Included:
- **Direct Messages**: One-on-one conversations between any two users
- **Message History**: View conversation history with any user
- **Unread Count**: See how many unread messages you have
- **File Sharing**: Send images and files in messages
- **Real-time Messaging**: Live message delivery via WebSocket
- **Conversation List**: See users you've chatted with recently

### ❌ What's NOT Included:
- No group chats or chat rooms
- No message editing or deletion
- No typing indicators
- No message replies or threads
- No complex permissions or roles
- No read receipts (just basic read/unread status)

## API Endpoints

### Get Users to Chat With
\`\`\`
GET /api/chat/users/
\`\`\`
Returns all active users except yourself.

### Get Your Conversations
\`\`\`
GET /api/chat/conversations/
\`\`\`
Returns users you've previously chatted with, including last message preview.

### Get Message History
\`\`\`
GET /api/chat/{user_id}/messages/
\`\`\`
Get all messages between you and a specific user. Automatically marks messages as read.

### Send a Message
\`\`\`
POST /api/chat/{user_id}/send/
{
  "message": "Hello there!",
  "image": (optional file),
  "file": (optional file)
}
\`\`\`

### Get Unread Count
\`\`\`
GET /api/chat/unread-count/
\`\`\`
Returns total number of unread messages.

## WebSocket Connection

Connect to: `ws://localhost:8000/ws/chat/`

### Send Message via WebSocket:
\`\`\`json
{
  "message": "Hello!",
  "recipient_id": 123
}
\`\`\`

### Receive Message:
\`\`\`json
{
  "type": "new_message",
  "message": "Hello!",
  "sender_id": 456,
  "sender_name": "John Doe",
  "timestamp": "2025-01-10T12:00:00Z"
}
\`\`\`

## Usage Examples

### Frontend Integration
\`\`\`javascript
// Get users to chat with
fetch('/api/chat/users/')
  .then(response => response.json())
  .then(users => console.log(users));

// Send a message
fetch('/api/chat/123/send/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    message: 'Hello there!'
  })
});

// WebSocket connection
const socket = new WebSocket('ws://localhost:8000/ws/chat/');
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('New message:', data);
};
\`\`\`

## Role-Based Communication

All authenticated users can message each other, but typical communication patterns:

- **Parents ↔ Staff**: Updates about their children
- **Staff ↔ Staff**: Coordination and information sharing
- **Admin ↔ Everyone**: Administrative communications
- **Nurse ↔ Parents**: Health-related updates
- **Babysitter ↔ Parents**: Daily activity updates

## Security

- Only authenticated users can send/receive messages
- Users can only see their own conversations
- File uploads are validated and stored securely
- All API endpoints require proper authentication

This simple system provides exactly what's needed for basic communication without unnecessary complexity.
