from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required

from py_backend import settings
from django.http import JsonResponse

from users.utils import decode_json_body



@require_http_methods(["POST"])
@requires_csrf_token
@login_required
def update_profile_bio(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    bio = data.get('bio')

    if bio and len(bio) > settings.MAX_LEN_TEXT:
        return JsonResponse({'status': "Your bio is too long."}, status=400) 
    if bio or bio == '':
        request.user.bio = bio
        request.user.save()
        return JsonResponse({'status': "Your bio has been correctly updated !"}, status=200)
    return JsonResponse({'status': "Missing bio."}, status=400)