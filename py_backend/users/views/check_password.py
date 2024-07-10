from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth import authenticate

from users.utils import decode_json_body
from users import forms


@require_http_methods(["POST"])
def check_password(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    form = forms.LoginForm(data)

    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(username=username, password=password)
        if user:
            return JsonResponse({'status': "Password valid"}, status=200)
    return JsonResponse({'error': "Wrong password"}, status=400)