from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse

from users.utils import decode_json_body
from users.models import CustomUser
from users.decorators import custom_login_required as login_required


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_tournament_name(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    tournament_username = data.get('username')
    if tournament_username:
        converted_username = tournament_username.lower()
        response = CustomUser.objects.filter(tournament_username=converted_username).exists()
        if response:
            return JsonResponse({'error': 'Username is already used.'}, status=400)
        request.user.tournament_username = tournament_username
        request.user.save()
        return JsonResponse({'status': "Your tournament username has been correctly updated !"}, status=200)
    return JsonResponse({'error': 'Missing username.'}, status=400)