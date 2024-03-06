from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from users.models import CustomUser
from users.forms import CustomUserCreationForm, LoginForm
from .models import FriendRequest


@require_http_methods(["POST"])
def send_friend_request(request, user_id):
    to_user = get_object_or_404(CustomUser, pk=user_id)
    FriendRequest.objects.create(from_user=request.user, to_user=to_user, status='pending')
    return JsonResponse({'status': 'success'}, status=200)

@require_http_methods(["POST"])
def add_friend(self, friend):
    if not friend in self.friends.all():
        self.friends.add(friend)
        self.save()