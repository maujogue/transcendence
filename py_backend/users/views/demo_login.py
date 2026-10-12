# DEMO ONLY: one-click login used to test the website.
# Disabled unless DEMO_MODE=True in .env.
import random

from django.conf import settings
from django.contrib.auth import login as auth_login
from django.http import Http404, JsonResponse
from django.views.decorators.http import require_http_methods

from users.models import CustomUser, generate_random_pseudo
from users.utils import convert_image_to_base64


def generate_demo_username():
	while True:
		username = "Demo_" + generate_random_pseudo(random.randint(2, 3))
		if not CustomUser.objects.filter(username=username).exists():
			return username


@require_http_methods(["POST"])
def demo_login(request):
	if not settings.DEMO_MODE:
		raise Http404()

	username = generate_demo_username()
	user = CustomUser(username=username, email=f"{username.lower()}@demo.local")
	user.set_unusable_password()
	user.email_is_verified = True
	user.save()

	auth_login(request, user)
	request.session['active_session'] = True

	user_info = {
		'username': user.username,
		'email': user.email,
		'avatar': convert_image_to_base64(user.avatar),
		'bio': user.bio,
		'is_42auth': user.is_42auth,
		'is_online': user.is_online,
		'lang': user.lang,
	}
	return JsonResponse({'status': "logged_in", "user": user_info}, status=200)
