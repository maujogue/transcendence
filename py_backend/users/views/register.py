from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

from users.forms import CustomUserCreationForm
from users.utils import validation_register, decode_json_body, send_confirmation_email


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
        user = form.save()
        if send_confirmation_email(user, request) == False:
            return JsonResponse({'error': "error_sending_email_message"}, status=400)
        return JsonResponse({'status': "validate_email_message"}, status=200)
    else:
        return JsonResponse({'error': form.errors}, status=400)