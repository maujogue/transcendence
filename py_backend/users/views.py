from django.core.mail import send_mail

from django.contrib.auth import authenticate, login as auth_login

from django.http import JsonResponse

from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import requires_csrf_token

from django.middleware.csrf import get_token

from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

from users.forms import CustomUserCreationForm, UpdateUserForm, UpdateProfileForm
from users.utils import validation_register, username_is_unique

from . import forms
import json


@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
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
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
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


@login_required
@require_http_methods(["POST"])
@requires_csrf_token
def logout_view(request):
    logout(request)
    return JsonResponse({"status": "success"}, status=200)


@login_required
@require_http_methods(["POST"])
@requires_csrf_token
def update_profile(request):
    if request.content_type == 'application/json':
        try:
            data = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
        username = data.get('username')
        bio = data.get('bio')
        avatar = data.get('avatar')
    else:
        return JsonResponse(data={'errors': "Unsupported content type"}, status=415)
    
    if username:
        is_unique, error_message = username_is_unique(username)
        if not is_unique:
            return JsonResponse({'error': error_message}, status=400)
        request.user.username = username
        request.user.save()
    if bio or bio == '':
        request.user.bio = bio
        request.user.save()
    if avatar:
        request.user.avatar = avatar
        request.user.save()
    return JsonResponse({"status": "success"}, status=200)


@require_http_methods(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token}, status=200)

