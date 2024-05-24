from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from users.models import CustomUser
from django.contrib.auth.decorators import login_required

from users.utils import convert_image_to_base64

@login_required
@require_http_methods(["POST"])
def get_friendslist(request):
    friendslist = []
    try:
        friendslist = request.user.friends.all()
        friends_count = len(friendslist)
        friends_list_data = [{'username': friend.username, 'avatar': convert_image_to_base64(friend.avatar)} for friend in friendslist]
        if friends_count > 0:
            return JsonResponse({'status': 'success', 'friends': friends_list_data}, status=200)
        else:
            return JsonResponse({'status': 'User have 0 friends'}, status=200)
    except CustomUser.DoesNotExist:
        return JsonResponse({'status': 'User not found'}, status=404)