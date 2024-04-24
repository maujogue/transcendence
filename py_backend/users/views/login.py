from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as auth_login

from users.utils import decode_json_body
from users import forms


@require_http_methods(["POST"])
def login(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    form = forms.LoginForm(data)

    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            auth_login(request, user)
            user_info = {
                'username': user.username,
                'email': user.email,
                'title': user.title,
                'bio': user.bio,
                'winrate': user.winrate,
                'rank': user.rank,
                'n_games_played': user.n_games_played
            }
            return JsonResponse({'status': "You are now logged in !", "user": user_info}, status=200)
    return JsonResponse({'error': "Wrong username or password."}, status=400)