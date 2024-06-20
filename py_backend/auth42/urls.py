from django.urls import path
from .views import get_42_token, login_with_42, oauth_callback

urlpatterns = [
    path('get_42_token/', get_42_token, name='get_42_token'),
    path('login_with_42/', login_with_42, name='get_42_token'),
	path('callback/', oauth_callback, name='oauth_callback'),
]
