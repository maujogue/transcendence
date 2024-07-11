from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required
from django.http import JsonResponse

from users.utils import decode_json_body, username_is_unique, username_is_valid


@require_http_methods(["POST"])
@requires_csrf_token
@login_required
def update_profile_username(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    username = data.get('username')
    if request.user.is_42auth:
        return JsonResponse({'status': "You cannot update your username because you are authenticated with 42."}, status=400)
    
    is_valid, is_valid_error = username_is_valid(username)
    if not is_valid:
        return JsonResponse({'error': is_valid_error}, status=400)

    if username:
        is_unique, error_message = username_is_unique(username)
        if not is_unique:
            return JsonResponse({'error': error_message}, status=400)
        request.user.username = username
        request.user.save()
        return JsonResponse({'status': "Your username has been correctly updated !"}, status=200)
    return JsonResponse({'error': 'Missing username.'}, status=400)