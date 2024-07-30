from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from users.decorators import custom_login_required as login_required
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from stats.views import *
from users.models import CustomUser
from users.utils import convert_image_to_base64, utils_get_friendslist_data

@require_http_methods(["GET"])
@requires_csrf_token
@login_required
def get_user_data(request, username=None):
	if username:
		try:
			user = CustomUser.objects.get(username=username)
		except CustomUser.DoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'user_not_found_message'}, status=400)
	else:
		user = request.user
		
	try:
		user_datas = {
			'username': user.username,
			'tournament_username': user.tournament_username,
			'email': user.email,
			'email_is_verified': user.email_is_verified,
			'avatar': convert_image_to_base64(user.avatar),
			'banner': convert_image_to_base64(user.banner),
			'bio': user.bio,
			'is_42auth': user.is_42auth,
			'lang': user.lang,
			'friendslist': utils_get_friendslist_data(user),
			'is_online': user.is_online,
		}
		return JsonResponse({'status': 'success', 'user': user_datas}, status=200)
	except Exception as e:
		return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

