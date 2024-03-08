from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from users.models import CustomUser
from users.forms import CustomUserCreationForm, LoginForm
from friends.models import FriendRequest
from django.contrib.auth.decorators import login_required


@login_required
@require_http_methods(["POST"])
def send_friend_request(request, user_id):
    from_user = request.user
    to_user = CustomUser.objects.get(id=user_id)
    friend_request, created = FriendRequest.objects.get_or_create(
        from_user=from_user,
        to_user=to_user)
    if created:
        response_data = {'id': friend_request.id, 'status': 'success'}
        return JsonResponse(response_data, status=200)
    return JsonResponse({'status': 'error'}, status=400)


@login_required
@require_http_methods(["POST"])
def accept_friend_request(request, request_id):
	friend_request = FriendRequest.objects.get(id=request_id)

	if friend_request.to_user != request.user:
		friend_request.to_user.friends.add(friend_request.from_user)
		friend_request.from_user.friends.add(friend_request.to_user)
		friend_request.delete()
		return JsonResponse({'status': 'success'}, status=200)
	else:
		return JsonResponse({'status': 'error'}, status=400)