from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required
from django.contrib.auth import logout
from django.http import JsonResponse


@require_http_methods(["POST"])
@custom_login_required
@requires_csrf_token
def logout_view(request):
    logout(request)
    return JsonResponse({'status': "You are now logout !"}, status=200)