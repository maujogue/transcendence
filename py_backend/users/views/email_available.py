from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse

from users.utils import email_is_unique, decode_json_body


@require_http_methods(["POST"])
@requires_csrf_token
def email_available(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    email = data.get('email')

    if email:
        is_unique, response = email_is_unique(email)
        if is_unique:
            return JsonResponse({'status': 'true'}, status=200)
        return JsonResponse({'status': 'false', 'response': response}, status=200)
    return JsonResponse({'status': "Missing email."}, status=400)