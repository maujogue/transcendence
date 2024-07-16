from .models import CustomUser

def check_unverified_accounts():
    try:
        CustomUser.objects.filter(email_is_verified=False).delete()
    except:
        return