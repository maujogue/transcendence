from datetime import timedelta
from django.utils import timezone
from .models import CustomUser

def check_unverified_accounts():
    now = timezone.now()
    five_minutes_ago = now - timedelta(minutes=5)
    
    CustomUser.objects.filter(account_creation_time__lte=five_minutes_ago).delete()