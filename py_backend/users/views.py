from django.core.mail import send_mail

from django.contrib.auth import authenticate, login as auth_login

from django.http import JsonResponse

from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie

from django.middleware.csrf import get_token

from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required

from users.forms import CustomUserCreationForm, UpdateProfileForm
from users.utils import validation_register

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
            return JsonResponse({"status": "success"}, status=200)

    return JsonResponse({"error": "error"}, status=400)

@login_required
@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"status": "success"}, status=200)


@login_required
@require_http_methods(["POST"])
def update_profile(request):
    profile_picture_form = UpdateProfileForm(request.POST, request.FILES, instance=request.user.profile)

    if profile_picture_form.is_valid():
        new_picture = profile_picture_form.save()
        new_picture.user = request.user
        if 'picture' in request.FILES:
                new_picture.picture = request.FILES['picture']
        new_picture.save()
        return JsonResponse({'status': 'success'}, status=200)
    else:
        return JsonResponse({'status': 'error'}, status=400)


@require_http_methods(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token}, status=200)