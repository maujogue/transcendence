from django.http import JsonResponse

def custom_login_required(func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
        return func(request, *args, **kwargs)
    return wrapper