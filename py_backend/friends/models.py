from django.db import models
from users.models import CustomUser
from py_backend import settings

class InteractionRequest(models.Model):

    from_user = models.CharField(max_length=settings.MAX_LEN_USERNAME, unique=False, default='')
    to_user = models.CharField(max_length=settings.MAX_LEN_USERNAME, unique=False, default='')

    def isFriend(self):
        return self.to_user.friends.filter(id=self.from_user.id).exists() or self.from_user.friends.filter(id=self.to_user.id).exists()
