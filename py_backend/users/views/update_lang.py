from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required, is_in_game
from django.http import JsonResponse
from users.utils import decode_json_body, lang_is_valid


@require_http_methods(['POST'])
@requires_csrf_token
@login_required
@is_in_game
def update_lang(request):
    try:
        data = decode_json_body(request)
        if isinstance(data, JsonResponse):
            return data
        
        lang = data.get('lang')
        is_valid_lang = lang_is_valid(lang)
        if not is_valid_lang:
            return JsonResponse({'status': 'error', 'message': 'Invalid language'}, status=400)

        if lang and request.user.is_authenticated:
            user = request.user
            user.lang = lang
            user.save()
            return JsonResponse({'status': 'success', 'message': 'Language updated successfully'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid language or user not authenticated'}, status=400)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
