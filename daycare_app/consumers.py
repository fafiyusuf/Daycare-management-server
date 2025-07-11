import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
        else:
            self.room_group_name = f'user_{self.user.id}'
            
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data['message']
        recipient_id = data['recipient_id']

        # Save message to database
        message = await self.save_message(self.user.id, recipient_id, message_text)

        # Send message to recipient if they're online
        await self.channel_layer.group_send(
            f'user_{recipient_id}',
            {
                'type': 'chat_message',
                'message': message_text,
                'sender_id': self.user.id,
                'sender_name': self.user.get_full_name() or self.user.username,
                'timestamp': message['timestamp']
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, recipient_id, message):
        sender = User.objects.get(id=sender_id)
        recipient = User.objects.get(id=recipient_id)
        chat_message = ChatMessage.objects.create(
            sender=sender,
            recipient=recipient,
            message=message
        )
        return {
            'id': chat_message.id,
            'timestamp': chat_message.timestamp.isoformat()
        }
