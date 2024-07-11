from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse

from users.utils import email_is_unique, email_is_valid, decode_json_body
from django.views.decorators.csrf import csrf_exempt


@require_http_methods(["POST"])
# @requires_csrf_token
@csrf_exempt
def email_available(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    email = data.get('email')
    is_valid, is_valid_response = email_is_valid(email)
    if not is_valid:
        return JsonResponse({'status': is_valid_response}, status=400)
    

    if email:
        is_unique, response = email_is_unique(email)
        if is_unique:
            return JsonResponse({'status': 'success'}, status=200)
        return JsonResponse({'status': 'failure', 'error': response}, status=200)
    return JsonResponse({'status': "Missing email."}, status=400)