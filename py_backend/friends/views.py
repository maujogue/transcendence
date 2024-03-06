from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from users.models import CustomUser
from users.forms import CustomUserCreationForm, LoginForm
from friends.models import FriendRequest


@require_http_methods(["POST"])
def send_friend_request(request, user_id):
	from_user = request.user
	to_user = CustomUser.objects.get(id=user_id)
	created = FriendRequest.objects.get_or_create(
		from_user = from_user,
		to_user = to_user)
	if created:
		return JsonResponse({'status': 'success'}, status=200)
	return JsonResponse({'status': 'error'}, status=400)
