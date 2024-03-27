from django.contrib import admin
from users.models import CustomUser
from users.models import Profile


admin.site.register(CustomUser)
admin.site.register(Profile)