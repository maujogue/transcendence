from django.http import JsonResponse

def custom_login_required(func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_online:
            return JsonResponse({'error': 'User is not connected'}, status=404)
        return func(request, *args, **kwargs)
    return wrapper