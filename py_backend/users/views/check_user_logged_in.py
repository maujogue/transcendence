from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import requires_csrf_token
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.sessions.models import Session
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


def is_user_logged_in(username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return False
    
    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    for session in sessions:
        data = session.get_decoded()
        if str(user.pk) == str(data.get('_auth_user_id')):
            return True
    return False

@require_http_methods(["POST"])
@requires_csrf_token
def check_user_logged_in_view(request, username):
    is_logged_in = is_user_logged_in(username)
    return JsonResponse({'is_logged_in': is_logged_in})
