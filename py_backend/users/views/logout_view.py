from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.http import JsonResponse
from users.models import CustomUser


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def logout_view(request):
    try:
        user = request.user
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "user_not_found_message"}, status=404)
    
    user.is_online = False
    user.save()
    
    logout(request)
    return JsonResponse({'status': "logout_message"}, status=200)