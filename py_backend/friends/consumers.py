import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_name = 'friend_request'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, exit_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'friend_request':
            from_user = data.get('from')
            to_user = data.get('to')
            await self.channel_layer.group_send(
                self.group_name,
                {'type': 'send_friend_request_notification',
                'from': from_user,
                'to': to_user})
            
    async def send_friend_request_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'friend_request',
            'from': event['from'],
            'to': event['to'],
            }))
