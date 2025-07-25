# daycare_app/middleware.py

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs

class JWTAuthMiddleware:
    """
    Custom middleware that takes a token from the query string or Authorization header
    and authenticates the user for WebSocket connections.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Only process WebSocket scopes
        if scope['type'] == 'websocket':
            # 1. Try to get token from query string (e.g., ws://.../?token=xyz)
            query_string = parse_qs(scope.get('query_string', b'').decode('utf-8'))
            token = query_string.get('token', [None])[0]

            # 2. Optionally, try to get token from headers (if you modify client to send)
            # headers = dict(scope['headers'])
            # authorization_header = headers.get(b'authorization', b'').decode('utf-8')
            # if authorization_header.startswith('Bearer '):
            #     token = authorization_header.split(' ')[1]

            scope['user'] = AnonymousUser() # Default to anonymous

            if token:
                try:
                    # Perform JWT authentication
                    jwt_authentication = JWTAuthentication()
                    
                    # get_validated_token automatically handles token validation
                    validated_token = await database_sync_to_async(jwt_authentication.get_validated_token)(token)
                    
                    # get_user retrieves the user associated with the token
                    scope['user'] = await database_sync_to_async(jwt_authentication.get_user)(validated_token)

                except (InvalidToken, TokenError) as e:
                    print(f"JWT authentication failed: {e}")
                    # Authentication failed, user remains AnonymousUser
                    pass
                except Exception as e:
                    print(f"An unexpected error occurred during JWT authentication: {e}")
                    pass
        
        # Call the next middleware/application in the stack
        return await self.app(scope, receive, send)

# A helper function to create a middleware stack including AuthMiddlewareStack
# and your custom JWTAuthMiddleware. AuthMiddlewareStack is still useful for
# other context like session (if you also use it) or populating user on HTTP.
from channels.auth import AuthMiddlewareStack # Ensure this is imported

def JWTAuthMiddlewareStack(inner):
    # Order matters: custom JWT middleware first to set user, then AuthMiddlewareStack
    # can ensure it's properly handled in Channels' context.
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))