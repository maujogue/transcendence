from django.db import models
from users.models import CustomUser

class FriendRequest(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='send_request', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='receive_request', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending','Pending'), ('accepted', 'Accepted'), ('rejeted', 'Rejected')])