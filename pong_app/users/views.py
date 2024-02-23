from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from users.models import CustomUser
from users.forms import CustomUserCreationForm, LoginForm
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from . import forms
import json

def home(request):
    return HttpResponse('<h1>Hello Django!</h1>')


def check_if_email_is_unique(email):
    try:
        user = CustomUser.objects.get(email=email)
        return False
    except CustomUser.DoesNotExist:
        return True


@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
    email = data.get('email')
    if check_if_email_is_unique(email) == False:
        return JsonResponse({"error": "This email is already used"}, status=400)

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


@require_http_methods(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token}, status=200)

@require_http_methods(["POST"])
def tournament(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
    
    print(data)
    return JsonResponse({"status": "success"}, status=200)
