from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model
from django.shortcuts import redirect

from users.tokens import email_update_token


@require_http_methods(["GET"])
def confirm_new_email(request, uidb64, token):
    CustomUser = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None
    
    if user is not None and email_update_token.check_token(user, token):
        user.email = request.user.email
        user.save()
        return redirect('/dash')
    return JsonResponse({'status': "error"}, status=400)