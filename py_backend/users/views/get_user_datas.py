from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

from users.models import Profile, CustomUser


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def get_user_data(request):
    user = request.user
    user_profile = get_object_or_404(Profile, user=request.user) 
    user_datas = {
        'username': user.username,
        'email': user.email,
        'bio': user_profile.bio,
        'title': user_profile.title,
        'winrate': user_profile.winrate,
        'rank': user_profile.rank,
        'n_games_played': user_profile.n_games_played
    }
    return JsonResponse({'status': 'success', 'user': user_datas}, status=200)