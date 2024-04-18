from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

from django.http import JsonResponse

from users.utils import decode_json_body
from users.models import Profile



@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_bio(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    user_profile = get_object_or_404(Profile, user=request.user) 
    bio = data.get('bio')

    if bio or bio == '':
        user_profile.bio = bio
        request.user.save()
    return JsonResponse({"status": "Your bio has been correctly updated !"}, status=200)