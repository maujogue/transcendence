import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

    async def disconnect(self, exit_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        if text_data_json.get('type') == 'friend_request':
            to_user = text_data_json.get('to')

            await self.send(text_data=json.dumps({
                'type': 'friend_request',
                'to': to_user}))

