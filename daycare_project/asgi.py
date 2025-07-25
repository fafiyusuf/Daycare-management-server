# daycare_project/asgi.py
import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daycare_project.settings')

django_asgi_app = get_asgi_application()

from daycare_app.middleware import JWTAuthMiddlewareStack
from daycare_app import routing # This import is crucial

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack( # Your custom JWT authentication middleware
            URLRouter( # Routes WebSocket connections to your consumers
                routing.websocket_urlpatterns
            )
        )
    ),
})