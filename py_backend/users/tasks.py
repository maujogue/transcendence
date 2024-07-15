from datetime import timedelta
from django.utils import timezone
from .models import CustomUser
from py_backend import settings

def check_unverified_accounts():
    now = timezone.now()
    five_minutes_ago = now - timedelta(minutes=settings.CHECK_UNVERIFIED_ACCOUNT_DELAY)
    
    CustomUser.objects.filter(account_creation_time__lte=five_minutes_ago).delete()