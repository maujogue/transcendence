from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def check_user_42(request):
    user = request.user
    return JsonResponse({'status': 'success', 'auth_42': user.auth_42}, status=200)