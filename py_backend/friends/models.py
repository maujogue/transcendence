from django.db import models
from users.models import CustomUser

class InteractionRequest(models.Model):

    PENDING = 'pending'
    ACCEPTED = 'accepted'

    STATUS_CHOICES = [
        (PENDING, 'pending'),
        (ACCEPTED, 'accepted'),
    ]

    from_user = models.ForeignKey(CustomUser, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='to_user', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    def isFriend(self):
        return self.to_user.friends.filter(id=self.from_user.id).exists() or self.from_user.friends.filter(id=self.to_user.id).exists()
