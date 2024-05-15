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
import tournaments.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'py_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "https": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
                multiplayer.routing.websocket_urlpatterns \
            +   tournaments.routing.websocket_urlpatterns
        )
    ),
})