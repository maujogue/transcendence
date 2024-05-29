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
        return JsonResponse({'status': 'Custom User not found'}, status=404)
    friend_request, created = InteractionRequest.objects.get_or_create(
        from_user=from_user,
        to_user=to_user,)
    if created:
        response_data = {'id': friend_request.id, 'from_user_username': request.user.username, 'status': 'success'}
        return JsonResponse(response_data, status=200)
    return JsonResponse({'status': 'error'}, status=400)