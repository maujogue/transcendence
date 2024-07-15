from .models import CustomUser

def check_unverified_accounts():
    CustomUser.objects.filter(email_is_verified=False).delete()