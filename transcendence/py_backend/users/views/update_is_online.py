from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.sessions.models import Session
from django.http import JsonResponse
from users.utils import decode_json_body
from users.models import CustomUser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@require_http_methods(['POST'])
@requires_csrf_token
def update_is_online_view(request):
    try:
        data = decode_json_body(request)
        if not data or not isinstance(data, dict):
            return JsonResponse({'status': 'error', 'message': 'Invalid request body'}, status=400)
        username = data.get('username')
        online = data.get('online')
        response = update_is_online(username, online)
        return response
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    

def update_is_online(username, online):
    online = False if online == 'False' else True
    if not isinstance(username, str):
        return JsonResponse({'status': 'error', 'message': 'Invalid username type', 'type': type(username)}, status=400)
    if not isinstance(online, bool):
        return JsonResponse({'status': 'error', 'message': 'Invalid is_online state', 'type': type(online)}, status=400)
    user = CustomUser.objects.get(username=username)
    if not user:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

    user.is_online = online
    user.save()
    if not online:
        sessions = Session.objects.all()
        for session in sessions:
            session_data = session.get_decoded()
            if session_data.get('_auth_user_id') == str(user.id):
                session.delete()

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}",
        {
            "type": "notify",
            "message": {"action": "logout"},
        },
    )
    return JsonResponse({'status': 'success', 'message': 'Online state updated successfully'})