import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()

    async def disconnect(self, exit_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json.get('type') == 'auth':
            friendslist = text_data_json['friendslist']
            if friendslist != False:
                await self.send(text_data=json.dumps({'type': 'list', 'friendslist': friendslist.count()}))
            else:
                await self.send(text_data=json.dumps({'type': 'message', 'message': 'You have no friends.'}))
            
