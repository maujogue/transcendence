from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse


from users.utils import username_is_unique, decode_json_body, username_is_valid


@require_http_methods(["POST"])
@requires_csrf_token
def username_available(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    username = data.get('username')
    is_valid, is_valid_error = username_is_valid(username)
    if not is_valid:
        return JsonResponse({'status': is_valid_error}, status=400)

    if username:
        is_unique, response = username_is_unique(username)
        if is_unique:
            return JsonResponse({'status': 'success'}, status=200)
        return JsonResponse({'status': 'failure', 'error': response}, status=200)
    return JsonResponse({'status': "Missing username."}, status=400)