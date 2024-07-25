from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse


@require_http_methods(["GET"])
@requires_csrf_token
def check_user_logged_in_view(request):
    return JsonResponse({'is_logged_in': request.user.is_authenticated}, status=200)
