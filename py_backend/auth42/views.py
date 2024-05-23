import requests
from requests.auth import HTTPBasicAuth
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

def login_with_42(request):
    params = {
        'client_id': settings.FORTY_TWO_UID,
        'redirect_uri': settings.FORTY_TWO_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'public'
    }
    url = f"https://api.intra.42.fr/oauth/authorize?{urlencode(params)}"
    return redirect(url)

def get_42_token(request):
    UID = settings.FORTY_TWO_UID
    SECRET = settings.FORTY_TWO_SECRET
    token_url = "https://api.intra.42.fr/oauth/token"
    
    response = requests.post(
        token_url,
        data={
            'grant_type': 'client_credentials'
        },
        auth=HTTPBasicAuth(UID, SECRET)
    )
    
    if response.status_code == 200:
        token = response.json().get('access_token')
        return JsonResponse({'access_token': token})
    else:
        return JsonResponse({'error': 'Unable to obtain token'}, status=response.status_code)


def oauth_callback(request):
    code = request.GET.get('code')
    token_url = 'https://api.intra.42.fr/oauth/token'
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': settings.FORTY_TWO_UID,
        'client_secret': settings.FORTY_TWO_SECRET,
        'code': code,
        'redirect_uri': settings.FORTY_TWO_REDIRECT_URI,
    }
    
    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()
    access_token = token_json.get('access_token')
    
    user_info_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    user_info_response = requests.get(user_info_url, headers=headers)
    user_info = user_info_response.json()
    
    username = user_info.get('login')
    email = user_info.get('email')
    
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    
    login(request, user)
    return redirect('/dash')  # Redirect to your home page or another page