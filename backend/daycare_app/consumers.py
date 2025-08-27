import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatMessage, User
from .serializers import ChatMessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # --- ADD THESE DEBUG PRINTS ---
        print(f"\n--- WebSocket Connection Attempt ---")
        print(f"Scope user type: {type(self.scope.get('user'))}")
        if self.scope.get('user') and self.scope['user'].is_authenticated:
            print(f"User authenticated: {self.scope['user'].username} (ID: {self.scope['user'].id})")
        else:
            print(f"User is NOT authenticated (Anonymous).")
        # --- END DEBUG PRINTS ---
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
        else:
            self.other_user_id = self.scope['url_route']['kwargs']['user_id']
            
            # Create a unique room name for the pair of users
            user_ids = sorted([int(self.user.id), int(self.other_user_id)])
            self.room_group_name = f'chat_{user_ids[0]}_{user_ids[1]}'

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_text = text_data_json['message']

        # Save message to database
        message = await self.save_message(message_text)
        
        # Serialize the message
        serializer = ChatMessageSerializer(message)
        message_data = serializer.data

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_data
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def save_message(self, message_text):
        recipient = User.objects.get(id=self.other_user_id)
        message = ChatMessage.objects.create(
            sender=self.user,
            recipient=recipient,
            message=message_text
        )
        return message

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.room_group_name = f'notifications_{self.user.id}'

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

    # This method is called when a notification is sent to the group
    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event["data"]))
