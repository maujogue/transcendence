from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser

from users.models import CustomUser

@require_http_methods(["GET"])
@requires_csrf_token
def check_user_logged_in_view(request):
    if isinstance(request.user, AnonymousUser) or not request.user:
        return JsonResponse({'error': 'AnonymousUser'}, status=400)
    try:
        user = CustomUser.objects.get(username=request.user.username)
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=400)
    return JsonResponse({'is_logged_in': user.is_online}, status=200)
