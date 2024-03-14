"""
ASGI config for py_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import multiplayer.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'py_backend.settings')

application = ProtocolTypeRouter({
    'http':get_asgi_application(),
    "https": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            multiplayer.routing.websocket_urlpatterns
        )
    ),
})






# import os

# from django.core.asgi import get_asgi_application
# from channels.security.websocket import AllowedHostsOriginValidator
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack

# from game.routing import websocket_game_urlpatterns
# from friendlist.routing import websocket_friendlist_urlpatterns
# from notification.routing import websocket_notification_urlpatterns
# from tournament.routing import websocket_tournament_urlpatterns

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
# django_asgi_app = get_asgi_application()
# import django
# django.setup()

# application = ProtocolTypeRouter(
#     {
#         "http": django_asgi_app,
#         "https": django_asgi_app,
#         "websocket": AuthMiddlewareStack(
#             URLRouter(websocket_game_urlpatterns \
#                     + websocket_friendlist_urlpatterns \
#                     + websocket_notification_urlpatterns \
#                     + websocket_tournament_urlpatterns),
#         )
#     }
# )