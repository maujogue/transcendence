from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from users.models import CustomUser
from friends.models import FriendRequest
from django.contrib.auth.decorators import login_required


@login_required
@require_http_methods(["POST"])
def send_request(request, user_id):
    from_user = request.user
    try:
        to_user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse({'status': 'Custom User not found'}, status=404)
    interaction_request, created = FriendRequest.objects.get_or_create(
        from_user=from_user,
        to_user=to_user)
    if created:
        response_data = {'id': interaction_request.id, 'status': 'success'}
        return JsonResponse(response_data, status=200)
    return JsonResponse({'status': 'error'}, status=400)


@login_required
@require_http_methods(["POST"])
def accept_friend(request, request_id):
    try:
        friend_request = FriendRequest.objects.get(id=request_id)
    except FriendRequest.DoesNotExist:
        return JsonResponse({'status': 'Friend request not found'}, status=404)
    
    if not friend_request.isFriend():
        if friend_request.to_user != request.user:
            friend_request.to_user.friends.add(friend_request.from_user)
            friend_request.from_user.friends.add(friend_request.to_user)
            friend_request.delete()
            return JsonResponse({'status': 'success'}, status=200)
        else:
            return JsonResponse({'status': 'error'}, status=400)
    else:
        return JsonResponse({'status': 'Users are already friends'}, status=400)


@login_required
@require_http_methods(["POST"])
def remove_friend(request, request_id):
    try:
        remove_request = FriendRequest.objects.get(id=request_id)
    except FriendRequest.DoesNotExist:
        return JsonResponse({'status': 'Remove request not found'}, status=404)

    if remove_request.isFriend():
        remove_request.from_user.friends.remove(remove_request.to_user)
        remove_request.to_user.friends.remove(remove_request.from_user)
        return JsonResponse({'status': 'success'}, status=200)
    else:
        return JsonResponse({'status': 'Users are not friends'}, status=400)


@login_required
@require_http_methods(["POST"])
def get_friendslist(request):
    try:
        friendslist = request.user.friends.all()
        friends_count = len(friendslist)
        friends_list_data = [{'username': friend.username} for friend in friendslist]
        if friends_count > 0:
            return JsonResponse({'status': 'success', 'friends': friends_list_data}, status=200)
        else:
            return JsonResponse({'status': 'User have 0 friends'}, status=200)
    except CustomUser.DoesNotExist:
        return JsonResponse({'status': 'User not found'}, status=404)