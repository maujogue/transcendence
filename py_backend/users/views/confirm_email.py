from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib import messages
from django.http import JsonResponse

from users.models import CustomUser
from users.tokens import account_activation_token
from django.contrib.auth import login


def confirm_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.email_is_verified = True
        user.save()
        datas = {
            'uidb64': uidb64,
            'token': token,
        }
        return JsonResponse({'status': "success", 'datas': datas}, status=200)
    return JsonResponse({'status': "error"}, status=400)
