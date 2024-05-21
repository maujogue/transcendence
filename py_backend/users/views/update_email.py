from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse

from users.utils import decode_json_body, email_is_valid, email_is_unique, send_update_email



@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_email(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    email = data.get('email')
    is_valid, error_valid = email_is_valid(email)
    is_unique, error_unique = email_is_unique(email)

    if not is_valid:
        return JsonResponse({'status': error_valid}, status=400)
    if not is_unique:
        return JsonResponse({'status': error_unique}, status=400)
    
    if email or email == '':
        request.user.email = email
        request.user.save()
        send_update_email(request, email)
        return JsonResponse({'status': "Your email has been correctly updated !"}, status=200)
    return JsonResponse({'status': "Missing email."}, status=400)