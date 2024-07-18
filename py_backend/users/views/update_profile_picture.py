from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required
from django.core.files.images import get_image_dimensions
from django.http import JsonResponse

from users.utils import image_extension_is_valid

import pylibmagic # needed for jrenault's macbook
import magic


@require_http_methods(["POST"])
@requires_csrf_token
@login_required
def update_profile_picture(request):
    uploaded_file = request.FILES.get("image")
    
    if not image_extension_is_valid(uploaded_file.name):
        return JsonResponse({'error': "invalid_file_type_message"}, status=400)

    if uploaded_file and uploaded_file.size > 5242880: # 5MB
        return JsonResponse({'error': "file_too_big_message"}, status=400)
    
    if uploaded_file is None:
        return JsonResponse({'error': "no_file_message"}, status=400)
    
    mime = magic.Magic()
    file_type = mime.from_buffer(uploaded_file.read(1024))
    if 'image' not in file_type:
        return JsonResponse({'error': "invalid_file_message"}, status=400)
    
    try:
        get_image_dimensions(uploaded_file)
    except Exception as e:
        return JsonResponse({'error': "invalid_file_message"}, status=400)
    try:
        request.user.avatar = uploaded_file
        request.user.save()
        return JsonResponse({'status': "profile_picture_updated_message"}, status=200)
    except Exception as e:
        request.user.avatar = "avatar.jpg"
        request.user.save()
        return JsonResponse({'error': "error_updating_profile_picture_message"}, status=400)
