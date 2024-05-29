from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from users.models import CustomUser
from friends.models import InteractionRequest
from django.contrib.auth.decorators import login_required

@login_required
@require_http_methods(["POST"])
def send_request(request, username):
    from_user = request.user
    try:
        to_user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return JsonResponse({'message': 'Custom User not found'}, status=404)
    if request.user.username == username:
        return JsonResponse({'message': 'Cannot send a request to himself.'}, status=400)

    friend_request, created = InteractionRequest.objects.get_or_create(
        from_user=from_user,
        to_user=to_user)
    if friend_request.isFriend():   
        return JsonResponse({'message': 'Users are already friends'}, status=400)
    if created:
        response_data = {'id': friend_request.id, 'from_user_username': request.user.username, 'message': 'success'}
        return JsonResponse(response_data, status=200)
    return JsonResponse({'message': 'Request already send.'}, status=400)