from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser

def custom_login_required(func):
    def wrapper(request, *args, **kwargs):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User does not exist'}, status=404)
        if not request.user:
            return JsonResponse({'error': 'There is no user in the request'}, status=404)
        if not request.user.email_is_verified:
            return JsonResponse({'error': 'Email is not verified'}, status=404)
        if not request.user.is_online:
            return JsonResponse({'error': 'User is not connected'}, status=404)
        return func(request, *args, **kwargs)
    return wrapper