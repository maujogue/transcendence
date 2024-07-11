from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse

from users.utils import decode_json_body, tournament_username_is_unique
from users.models import CustomUser
from users.decorators import custom_login_required as login_required


@require_http_methods(["POST"])
@requires_csrf_token
@login_required
def update_tournament_name(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    tournament_username = data.get('username')
    is_unique, is_unique_error = tournament_username_is_unique(tournament_username)
    if not is_unique:
        return JsonResponse({'status': is_unique_error}, status=400)

    if tournament_username:
        response = CustomUser.objects.filter(tournament_username__iexact=tournament_username)
        if response:
            return JsonResponse({'error': 'Username is already used.'}, status=400)
        request.user.tournament_username = tournament_username
        request.user.save()
        return JsonResponse({'status': "Your tournament username has been correctly updated !"}, status=200)
    return JsonResponse({'error': 'Missing username.'}, status=400)