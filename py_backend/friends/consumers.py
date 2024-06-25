from channels.generic.websocket import AsyncWebsocketConsumer
from users.models import CustomUser
from friends.models import InteractionRequest
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from users.utils import convert_image_to_base64
import json

class FriendsConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.set_online_status(True)
        await self.accept()


    async def disconnect(self, exit_code):
        await self.set_online_status(False)
        await self.group_send(
            self.scope['user'].username,
            event = {'type': 'send_friendslist'})


    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        handlers = {
            'auth': self.auth,
            'check_user_exist': self.user_exist,
            'friend_request': self.create_friend_request,
            'accept_request': self.accept_request,
            'decline_request': self.decline_request,
            'remove_friend': self.remove_friend,
            'get_friendslist': self.send_friendslist,
            'get_current_user_requests': self.send_current_user_requests,
            'get_user_requests': self.get_user_requests,
        }
        handler = handlers.get(message_type)
        if handler:
            await handler(data)


    async def auth(self, data):
        username = data.get('username')
        await self.authenticate_user(username)
        await self.channel_layer.group_add(
            self.scope['user'].username,
            self.channel_name)
        
        friends = await self.get_friends()
        for f in friends:
            await self.channel_layer.group_add(
                f.get('username'),
                self.channel_name)
        
        await self.group_send(
            self.scope['user'].username,
            event = {'type': 'send_friendslist'})



#----------- friends functions ------------------------------------------------------------------------------------------------------------


    async def create_friend_request(self, data):
        from_user = data.get('from_user')
        to_user = data.get('to_user')

        if self.scope['user'].username == to_user:
            return await self.send(text_data=json.dumps({ "type": "user_himself"}))

        user = await self.authenticate_user_with_username(to_user)
        if user is None:
            return await self.send(text_data=json.dumps({ "type": "user_do_not_exist"}))
        
        is_already_send = await self.request_already_sent(from_user, to_user)
        if is_already_send == True:
            return await self.send(text_data=json.dumps({ "type": "request_already_sent"}))
        
        request = await sync_to_async(InteractionRequest.objects.create)(from_user=from_user, to_user=to_user)

        isFriend = await sync_to_async(request.isFriend)()
        if isFriend:
            await self.send(text_data=json.dumps({ "type": "already_friends", "to_user": to_user}))
            await sync_to_async(request.delete)()
            return
        
        await self.channel_layer.group_add(
            to_user,
            self.channel_name,)
        event = {
            'type': 'new_request_notification',
            'from_user': from_user,
            'to_user': to_user,
            'type_from_user': 'friend_request_from_user',
            'type_to_user': 'friend_request_to_user'
        }
        await self.group_send(to_user, event)

    
    async def accept_request(self, data):        
        from_user = await sync_to_async(CustomUser.objects.get)(username=data.get('from_user'))
        to_user = await sync_to_async(CustomUser.objects.get)(username=data.get('to_user'))

        await sync_to_async(from_user.friends.add)(to_user)
        await sync_to_async(to_user.friends.add)(from_user)
        await self.delete_interaction_request(from_user, to_user)

        data['type'] = 'refresh_friends'
        await self.send_notification(data)

        await self.channel_layer.group_add(
            from_user.username,
            self.channel_name)
        event = {
            'type': 'new_request_notification',
            'from_user': from_user.username,
            'to_user': to_user.username,
            'type_from_user': 'friend_accepted_from_user',
            'type_to_user': None
        }
        await self.group_send(to_user.username, event)
        await self.group_send(from_user.username, event = {'type': 'send_friendslist'})


    async def remove_friend(self, data):
        from_user = await sync_to_async(CustomUser.objects.get)(username=data.get('from_user'))
        to_user = await sync_to_async(CustomUser.objects.get)(username=data.get('to_user'))

        await sync_to_async(from_user.friends.remove)(to_user)
        await sync_to_async(to_user.friends.remove)(from_user)
        
        await self.group_send(from_user.username, event = {'type': 'send_friendslist'})


    async def decline_request(self, data):
        from_user = data.get('from_user')
        to_user = data.get('to_user')
        await self.delete_interaction_request(from_user, to_user)
        await self.group_send(to_user, event = {'type': 'send_friendslist'})
        return await self.send(text_data=json.dumps({ "type": "refresh_friends"}))
        
    

    @database_sync_to_async
    def get_friends(self):
        current_user = CustomUser.objects.get(username=self.scope['user'].username)
        friendslist = []
        friendslist = current_user.friends.all()
        friends_list_data = [{'username': friend.username, 
                            'status': friend.is_online, 
                            'avatar': convert_image_to_base64(friend.avatar)}
                            for friend in friendslist]
        return friends_list_data


    async def send_friendslist(self, data):
        print("friendlist")
        friends_list_data = []
        friends_list_data = await self.get_friends()
        await self.send(text_data=json.dumps({
            "type": "friendslist",
            "friends": friends_list_data}))


    async def new_request_notification(self, event):
        if self.scope['user'].username == event['from_user']:
            event['type'] = event['type_from_user']
            await self.send_notification(event)
        if self.scope['user'].username == event['to_user']:
            event['type'] = event['type_to_user']
            await self.send_notification(event)


    async def send_notification(self, event):
        if event['type'] is None:
            return
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'from_user': event['from_user'],
            'to_user': event['to_user'],
            }))


    async def group_send(self, group_name, event):
        await self.channel_layer.group_send(
            group_name,
            event)


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

    async def user_exist(self, data):
        username = data.get('username')
        if username == self.scope['user'].username:
            exists = False
        else:	
            user = await self.authenticate_user_with_username(username)
            exists = user is not None
        await self.send(text_data=json.dumps({ "type": "user_exist", "exists": exists}))

    @database_sync_to_async
    def request_already_sent(self, from_user, to_user):
        request = InteractionRequest.objects.filter(from_user=from_user, to_user=to_user)
        if request:
            return True
        return False
    
    
    async def delete_interaction_request(self, from_user, to_user):
        #delete the line below
        request = []

        request = await sync_to_async(InteractionRequest.objects.get)(from_user=from_user, to_user=to_user)
        if request:
            await sync_to_async(request.delete)()


    @database_sync_to_async
    def get_requests(self, data):
        username = data.get('user')

        all_requests = InteractionRequest.objects.all()
        requests_list = []
        for r in all_requests.filter(to_user=username):
            user = CustomUser.objects.get(username=r.from_user)
            requests_list.append({'name': r.from_user, 'avatar': convert_image_to_base64(user.avatar)})
        return requests_list
    

    async def send_current_user_requests(self, data):
        requests = []
        requests = await self.get_requests(data)
        await self.send(text_data=json.dumps({
            "type": "get_current_user_requests",
            "friend_requests": requests}))

    async def get_user_requests(self, data):
        requests = []
        requests = await self.get_requests(data)
        await self.send(text_data=json.dumps({
            "type": "get_user_requests",
            "user": data.get('user'),
            "friend_requests": requests}))

    @database_sync_to_async    
    def set_online_status(self, status):
        try:
            user = CustomUser.objects.get(username=self.scope['user'].username)
            user.is_online = status
            user.save()
        except CustomUser.DoesNotExist:
            return False
