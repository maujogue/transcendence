from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from friends.models import InteractionRequest
from django.contrib.auth.decorators import login_required

@login_required
@require_http_methods(["POST"])
def remove(request, request_id):
    try:
        remove_request = InteractionRequest.objects.get(id=request_id)
    except InteractionRequest.DoesNotExist:
        return JsonResponse({'status': 'Remove request not found'}, status=404)

    if request.user.username != remove_request.from_user.username:
        return JsonResponse({'status': 'error'}, status=400)
    if remove_request.isFriend():
        remove_request.from_user.friends.remove(remove_request.to_user)
        remove_request.to_user.friends.remove(remove_request.from_user)
        remove_request.delete()
        return JsonResponse({'status': 'success'}, status=200)
    else:
        return JsonResponse({'status': 'Users are not friends'}, status=400)