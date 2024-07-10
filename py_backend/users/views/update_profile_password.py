from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required
from django.contrib.auth.hashers import make_password
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError

from django.http import JsonResponse

from users.utils import decode_json_body
from users.validators import PasswordValidators


@require_http_methods(["POST"])
@requires_csrf_token
@login_required
def update_profile_password(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    if request.user.is_42auth:
        return JsonResponse({'status': "You cannot update your password because you are authenticated with 42."}, status=400)
    
    new_password1 = data.get('new_password1')
    new_password2 = data.get('new_password2')

    password_validators = PasswordValidators()
    try:
        password_validators.validate(new_password1)
    except ValidationError as e:
        return JsonResponse({'status': str(e)}, status=400)

    if new_password1 and new_password2:
        if new_password1 == new_password2:
            hashed_password = make_password(new_password1)
            request.user.password = hashed_password
            request.user.save()
            update_session_auth_hash(request, request.user)

            return JsonResponse({"status": "Your password has been correctly updated !"}, status=200)
        else:
            return JsonResponse({'status': 'Passwords do not match.'}, status=400)
    else:
        return JsonResponse({'status': 'One password is missing.'}, status=400)