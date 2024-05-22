from django.db import models
from users.models import CustomUser

class InteractionRequest(models.Model):

    from_user = models.ForeignKey(CustomUser, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='to_user', on_delete=models.CASCADE)

    def isFriend(self):
        return self.to_user.friends.filter(id=self.from_user.id).exists() or self.from_user.friends.filter(id=self.to_user.id).exists()
