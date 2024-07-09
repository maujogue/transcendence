from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required
from django.http import JsonResponse
from users.utils import decode_json_body

@require_http_methods(['POST'])
@requires_csrf_token
@login_required
def update_lang(request):
    try:
        data = decode_json_body(request)
        if isinstance(data, JsonResponse):
            return data

        lang = data.get('lang')

        if lang and request.user.is_authenticated:
            user = request.user
            if len(lang) > 2:
                lang = lang[:2]
            user.lang = lang
            user.save()
            return JsonResponse({'status': 'success', 'message': 'Language updated successfully'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid language or user not authenticated'}, status=400)

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
