from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def get_user_datas(request):
    user = request.user
    print(user.username)
    return JsonResponse({'status': 'User have 0 friends'}, status=200)

