from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse

from users.utils import decode_json_body


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_password(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    new_password1 = data.get('new_password1')
    new_password2 = data.get('new_password2')

    if new_password1 and new_password2:
        if new_password1 == new_password2:
            hashed_password = make_password(new_password1)
            request.user.password = hashed_password
            request.user.save()
            return JsonResponse({"status": "Your password has been correctly updated !"}, status=200)
        else:
            return JsonResponse({'status': 'Passwords do not match.'}, status=400)
    else:
        return JsonResponse({'status': 'One password is missing.'}, status=400)