import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        print("CONNECT")

    async def disconnect(self, exit_code):
        pass

    async def receive(self, event):
        print("RECEIVE")
        pass
