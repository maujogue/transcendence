from django.core.mail import send_mail

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import requires_csrf_token

from django.middleware.csrf import get_token


from django.contrib.auth import logout, update_session_auth_hash, authenticate, login as auth_login
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm

from users.forms import CustomUserCreationForm
from users.utils import validation_register, username_is_unique, email_is_unique

from . import forms
import json
import magic


@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'error': "Invalid JSON format"}, status=406)
    valid_request = validation_register(data)
    if valid_request:
        return JsonResponse({"error": valid_request}, status=400)

    form = CustomUserCreationForm(data)
    if form.is_valid():
        form.save()
        return JsonResponse({"status": "success"}, status=200)
    else:
        return JsonResponse({"error": form.errors}, status=400)



@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'error': "Invalid JSON format"}, status=406)
    form = forms.LoginForm(data)

    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            auth_login(request, user)
            user_info = {
                'username': user.username,
                'email': user.email,
                'title': user.title,
                'bio': user.bio,
                'winrate': user.winrate,
                'rank': user.rank,
                'n_games_played': user.n_games_played
            }
            return JsonResponse({"status": "success", "user": user_info}, status=200)

    return JsonResponse({"error": "Wrong username or password."}, status=400)


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def logout_view(request):
    logout(request)
    return JsonResponse({"status": "success"}, status=200)


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_username(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'error': "Invalid JSON format"}, status=406)
    username = data.get('username')

    if username:
        is_unique, error_message = username_is_unique(username)
        if not is_unique:
            return JsonResponse({'error': error_message}, status=400)
        request.user.username = username
        request.user.save()
    return JsonResponse({"status": "Your username has been correctly updated."}, status=200)


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_bio(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'error': "Invalid JSON format"}, status=406)
    bio = data.get('bio')

    if bio or bio == '':
        request.user.bio = bio
        request.user.save()
    return JsonResponse({"status": "Your bio has been correctly updated."}, status=200)


@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_password(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'error': "Invalid JSON format"}, status=406)
    new_password1 = data.get('new_password1')
    new_password2 = data.get('new_password2')

    if new_password1 and new_password2:
        if new_password1 == new_password2:
            hashed_password = make_password(new_password1)
            request.user.password = hashed_password
            request.user.save()
            return JsonResponse({"status": "Your password has been correctly updated."}, status=200)
        else:
            return JsonResponse({'status': 'Passwords do not match.'}, status=400)
    else:
        return JsonResponse({'status': 'One password is missing.'}, status=400)
    

@require_http_methods(["POST"])
@login_required
@requires_csrf_token
def update_profile_picture(request):
    uploaded_file = request.FILES.get("image")
    if uploaded_file and uploaded_file.size > 5242880: # 5MB
        return JsonResponse({'errors': "File size exceeds the limit"}, status=400)
    if uploaded_file is None:
        return JsonResponse({"errors": "No file provided"}, status=401)
    mime = magic.Magic()
    file_type = mime.from_buffer(uploaded_file.read(1024))
    if 'image' not in  file_type:
        return JsonResponse({'errors': "Invalid file type"}, status=402)
    user_profile = get_object_or_404(Profile, user=request.user)
    if user_profile and check_if_preset_picture(user_profile.profile_picture.path) == False:
        default_storage.delete(user_profile.profile_picture.path)
    user_profile.profile_picture = uploaded_file
    user_profile.save()
    return JsonResponse({"status": "success"}, status=200)


@require_http_methods(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token}, status=200)

