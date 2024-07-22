from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.sessions.models import Session
from django.http import JsonResponse
from users.utils import decode_json_body
from users.models import CustomUser
from users.decorators import is_in_game
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import logging
logging = logging.getLogger('django')

@require_http_methods(['POST'])
@requires_csrf_token
@is_in_game
def update_is_online(request):
    try:
        data = decode_json_body(request)
        if isinstance(data, JsonResponse):
            return data
        
        online = True if data.get('online') == 'true' else False
        if not isinstance(online, bool):
            return JsonResponse({'status': 'error', 'message': 'Invalid is_online state', 'type': type(online)}, status=400)
        user = CustomUser.objects.get(username=data.get('username'))
        if not user:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

        user.is_online = online
        user.save()
        if not online:
            sessions = Session.objects.all()
            for session in sessions:
                session_data = session.get_decoded()
                if session_data.get('_auth_user_id') == str(user.id) and session.session_key != request.session.session_key:
                    session.delete()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "notify",
                "message": {"action": "logout"},
            },
        )
        logging.info('user: %s', user.username)
        logging.info('online: %s', user.is_online)
        return JsonResponse({'status': 'success', 'message': 'Online state updated successfully'})
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
