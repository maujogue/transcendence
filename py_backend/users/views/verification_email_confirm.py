from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib import messages
from django.http import JsonResponse

from users.models import CustomUser
from users.tokens import account_activation_token
from django.contrib.auth import get_user_model
from django.shortcuts import redirect


def verification_email_confirm(request, uidb64, token):
    CustomUser = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        # user.email_is_verified = True
        user.save()
        # return redirect('https://127.0.0.1:8000')
        return JsonResponse({'status': "success"}, status=200)
    return JsonResponse({'status': "error"}, status=400)
