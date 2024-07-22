from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser

def custom_login_required(func):
    def wrapper(request, *args, **kwargs):
        if isinstance(request.user, AnonymousUser) or not request.user or not request.user.email_is_verified:
            return JsonResponse({'status': 'error', 'message': 'You need to be logged in to access this page'}, status=401)
        return func(request, *args, **kwargs)
    return wrapper