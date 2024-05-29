from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from users.models import CustomUser


@login_required
@require_http_methods(["POST"])
def remove(request, friend_username):
    try:
        user1 = CustomUser.objects.get(username=request.user.username)
        user2 = CustomUser.objects.get(username=friend_username)
    except CustomUser.DoesNotExist:
        return JsonResponse({'message': 'Custom User not found'}, status=404)
    
    if user1.friends.filter(id=user2.id).exists() and user2.friends.filter(id=user1.id).exists():
        user1.friends.remove(user2)
        user2.friends.remove(user1)
        return JsonResponse({'message': 'success'}, status=200)
    return JsonResponse({'message': 'Users are not friends'}, status=400)
