from channels.generic.websocket import AsyncWebsocketConsumer
from users.models import CustomUser
from friends.models import InteractionRequest
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json


class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()


    async def disconnect(self, exit_code):
        # await self.channel_layer.group_discard(
        #     self.group_name,
        #     self.channel_name,
        # )
        pass


    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'auth':
            await self.auth(data)

        if message_type == 'friend_request':
            await self.friend_request(data)

        if message_type == 'accept_request':
            await self.accept_request(data)




    async def auth(self, data):
        username = data.get('username')
        await self.authenticate_user(username)

        await self.channel_layer.group_add(
            self.scope['user'].username,
            self.channel_name)
        

    async def friend_request(self, data):
        from_user = data.get('from_user')
        to_user = data.get('to_user')

        user = await self.authenticate_user_with_username(to_user)

        if user is None:
            await self.send(text_data=json.dumps({ "type": "user_exist", "status": "failure"}))
            return
        
        request = await sync_to_async(InteractionRequest.objects.create)(from_user=from_user, to_user=to_user)
        isFriend = await sync_to_async(request.isFriend)()
        if isFriend:
            await self.send(text_data=json.dumps({ "type": "already_friends", "to_user": to_user}))
            #delete request
            return
        
        await self.channel_layer.group_add(
            to_user,
            self.channel_name,)
        await self.channel_layer.group_send(
            to_user,
            {'type': 'new_request_notification',
            'from_user': from_user,
            'to_user': to_user})

        # await self.accept_request(data)

    
    async def accept_request(self, data):
        requests = await self.get_request_from_user(data.get('to_user'))

        if data.get('from_user') not in requests:
            await self.send(text_data=json.dumps({ "type": "accept_request", "status": "failure"}))
            return
        
        from_user = await sync_to_async(CustomUser.objects.get)(username=data.get('from_user'))
        to_user = await sync_to_async(CustomUser.objects.get)(username=data.get('to_user'))

        await sync_to_async(from_user.friends.add)(to_user)
        await sync_to_async(to_user.friends.add)(from_user)

        if self.scope['user'].username == data['from_user']:
            data['type'] = 'accept_request'
            await self.send_notification(data)
        

    async def new_request_notification(self, event):
        if self.scope['user'].username == event['from_user']:
            event['type'] = 'friend_request_from_user'
            await self.send_notification(event)
        if self.scope['user'].username == event['to_user']:
            event['type'] = 'friend_request_to_user'
            await self.send_notification(event)


    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'from_user': event['from_user'],
            'to_user': event['to_user'],
            }))


    async def authenticate_user_with_username(self, username):
        try:
            user = await CustomUser.objects.aget(username=username)
            return user
        except CustomUser.DoesNotExist:
            return None
        

    async def authenticate_user(self, username):
        user = await self.authenticate_user_with_username(username)
        if user is not None:
            self.scope['user'] = user
            await self.send(text_data=json.dumps({ "type": "auth", "status": "success"}))
        else:
            await self.send(text_data=json.dumps({ "type": "auth", "status": "failed"}))

    @database_sync_to_async
    def get_request_from_user(self, to_user):
        all_requests = InteractionRequest.objects.all()
        requests = all_requests.filter(to_user=to_user)
        return [r.from_user for r in requests]