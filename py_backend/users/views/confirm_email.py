from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model
from django.shortcuts import redirect

from users.models import CustomUser
from users.tokens import account_activation_token


@require_http_methods(["GET"])
def confirm_email(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and account_activation_token.check_token(user, token):
        user.email_is_verified = True
        user.save()
        return redirect('/emailVerified')
    return JsonResponse({'status': "error"}, status=400)
