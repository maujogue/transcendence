from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as auth_login

from users.utils import decode_json_body, convert_image_to_base64
from users import forms


@require_http_methods(["POST"])
def login_view(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    form = forms.LoginForm(data)

    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            if not user.email_is_verified:
                return JsonResponse({'error': "Your email is not verified yet."}, status=400)

            if hasattr(request.user, 'session_key') and user.session_key != None or user.is_online:
                return JsonResponse({'error': "You are already logged in somewhere else."}, status=400)
            
            auth_login(request, user)

            user.session_key = request.session.session_key
            user.is_42auth = False
            user.is_online = True
            user.save()

            user_info = {
                'username': user.username,
                'email': user.email,
                'avatar': convert_image_to_base64(user.avatar),
                'title': user.title,
                'bio': user.bio,
                'winrate': user.winrate,
                'rank': user.rank,
                'n_games_played': user.n_games_played,
                'is_42auth': user.is_42auth,
                'is_online': user.is_online,
                'lang': user.lang,
            }
            return JsonResponse({'status': "You are now logged in !", "user": user_info}, status=200)
    return JsonResponse({'error': "Wrong username or password."}, status=400)