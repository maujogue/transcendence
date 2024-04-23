from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse
from users.tokens import account_activation_token


@require_http_methods(["POST"])
@requires_csrf_token
def verification_email(request):
    if request.user.email_is_verified != True:
        current_site = get_current_site(request)
        user = request.user
        email = request.user.email
        subject = "Verify Email"
        message = render_to_string('user/verify_email_message.html', {
            'request': request,
            'user': user,
            'domain': current_site.domain,
            'uid':urlsafe_base64_encode(force_bytes(user.pk)),
            'token':account_activation_token.make_token(user),
        })
        email = EmailMessage(
            subject, message, to=[email]
        )
        email.content_subtype = 'html'
        email.send()
        return JsonResponse({'status': "success"}, status=200)
    else:
        return JsonResponse({'status': "failure"}, status=400)