from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from users.utils import decode_json_body, username_is_unique


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_username(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    username = data.get('username')

    if username:
        is_unique, error_message = username_is_unique(username)
        if not is_unique:
            return JsonResponse({'error': error_message}, status=400)
        request.user.username = username
        request.user.save()
    return JsonResponse({'status': "Your username has been correctly updated !"}, status=200)