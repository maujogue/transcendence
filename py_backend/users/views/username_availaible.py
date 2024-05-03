from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse

from users.utils import username_is_unique, decode_json_body


@require_http_methods(["POST"])
@requires_csrf_token
def username_available(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    username = data.get('username')

    if username:
        is_unique, response = username_is_unique(username)
        if is_unique:
            return JsonResponse({'status': 'true'}, status=200)
        return JsonResponse({'status': 'false', 'response': response}, status=200)
    return JsonResponse({'status': "Missing username."}, status=400)