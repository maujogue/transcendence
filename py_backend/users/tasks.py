from datetime import timedelta
from django.utils import timezone
from .models import CustomUser

def check_unverified_accounts():
    now = timezone.now()
    three_minutes_ago = now - timedelta(minutes=3)
    
    CustomUser.objects.filter(account_creation_time__lte=three_minutes_ago).delete()