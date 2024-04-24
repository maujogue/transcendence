from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from users.forms import CustomUserCreationForm
from users.utils import validation_register, decode_json_body


@require_http_methods(["POST"])
def register(request):
    data = decode_json_body(request)
    if isinstance(data, JsonResponse):
        return data
    
    valid_request = validation_register(data)
    if valid_request:
        return JsonResponse({'error': valid_request}, status=400)

    form = CustomUserCreationForm(data)
    if form.is_valid():
        form.save()
        return JsonResponse({'status': "You are now register !"}, status=200)
    else:
        return JsonResponse({'error': form.errors}, status=400)