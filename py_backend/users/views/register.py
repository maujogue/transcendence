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

    try:
        form = CustomUserCreationForm(data)
    except:
        return JsonResponse({'error': 'Error during the form creation.'}, status=400)
    
    if form.is_valid():
        user = form.save()
        user.save_account_creation_time()
        if send_confirmation_email(user, request) == False:
            return JsonResponse({'error': "Error sending the email."}, status=400)
        return JsonResponse({'status': "Please validate your email by clicking on the link we sent you."}, status=200)
    else:
        return JsonResponse({'error': form.errors}, status=400)