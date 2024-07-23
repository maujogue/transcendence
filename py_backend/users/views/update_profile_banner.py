from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required, is_in_game
from django.core.files.images import get_image_dimensions
from django.http import JsonResponse

from users.utils import image_extension_is_valid

import magic
from PIL import Image


@require_http_methods(["POST"])
@requires_csrf_token
@login_required
@is_in_game
def update_profile_banner(request):
    uploaded_file = request.FILES.get("image")
    
    if not image_extension_is_valid(uploaded_file.name):
        return JsonResponse({'error': "Invalid image type."}, status=400)

    if uploaded_file and uploaded_file.size > 5242880: # 5MB
        return JsonResponse({'error': "File size exceeds the limit."}, status=400)
    
    if uploaded_file is None:
        return JsonResponse({'error': "No file provided."}, status=400)
    
    mime = magic.Magic()
    file_type = mime.from_buffer(uploaded_file.read(1024))
    if 'image' not in file_type:
        return JsonResponse({'error': "Invalid file."}, status=400)
    
    try:
        get_image_dimensions(uploaded_file)
    except Exception as e:
        return JsonResponse({'error': "Invalid file."}, status=400)
    try:
        Image.open(uploaded_file)
        request.user.banner = uploaded_file
        request.user.save()
        return JsonResponse({'status': "profile_banner_updated_message"}, status=200)
    except Exception as e:
        return JsonResponse({'error': "error_updating_profile_banner_message"}, status=400)
