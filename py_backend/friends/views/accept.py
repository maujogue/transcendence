from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from friends.models import InteractionRequest
from django.contrib.auth.decorators import login_required

@login_required
@require_http_methods(["POST"])
def accept(request, request_id):
    try:
        friend_request = InteractionRequest.objects.get(id=request_id)
    except InteractionRequest.DoesNotExist:
        return JsonResponse({'message': 'Friend request not found'}, status=404)
    
    if request.user.username != friend_request.from_user.username:
        return JsonResponse({'message': 'error'}, status=400)
    if friend_request.to_user != request.user:
        friend_request.to_user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(friend_request.to_user)
        friend_request.delete()
        return JsonResponse({'message': 'success'}, status=200)
    else:
        return JsonResponse({'message': 'error'}, status=400)