import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.accept()
        self.send({
            'type': "websocket.accept",
        })

    async def disconnect(self):
        pass

    async def receive(self, event):
        self.send({
            "type": "websocket.send",
            "text": event["text"],
        })
        # text_data_json = json.loads(text_data)
        # message = text_data_json['message']
        # self.send(text_data=json.dumps({
        #     'message': message
        # }))
