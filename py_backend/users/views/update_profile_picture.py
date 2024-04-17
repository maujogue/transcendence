from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from users.models import Profile

import magic


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_picture(request):
    uploaded_file = request.FILES.get("image")
    if uploaded_file and uploaded_file.size > 5242880: # 5MB
        return JsonResponse({'errors': "File size exceeds the limit."}, status=400)
    
    if uploaded_file is None:
        return JsonResponse({"errors": "No file provided."}, status=401)
    
    mime = magic.Magic()
    file_type = mime.from_buffer(uploaded_file.read(1024))
    if 'image' not in  file_type:
        return JsonResponse({'errors': "Invalid file type."}, status=402)
    
    user_profile = get_object_or_404(Profile, user=request.user)
    user_profile.avatar = uploaded_file
    user_profile.save()
    return JsonResponse({"status": "Your profile picture has been correctly updated !"}, status=200)