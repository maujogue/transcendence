from django.db import models
from users.models import CustomUser
from py_backend import settings

class InteractionRequest(models.Model):

    from_user = models.CharField(max_length=settings.MAX_LEN_USERNAME, unique=False, default='')
    to_user = models.CharField(max_length=settings.MAX_LEN_USERNAME, unique=False, default='')

    def isFriend(self):
        from_user = CustomUser.objects.get(username=self.from_user)
        to_user = CustomUser.objects.get(username=self.to_user)
        return from_user.friends.filter(username=to_user.username).exists()