from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from .consumers import FriendsConsumer

application = ProtocolTypeRouter({
    'websocket': URLRouter([
        path('ws/friends/', FriendsConsumer.as_asgi()),
    ])
})