from django.urls import path
from users.views import *

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
	path('logout/', logout_view, name='logout'),
    path('get_csrf_token/', get_csrf_token, name='get_csrf_token'),
    path('update_bio/', update_profile_bio, name='update_bio'),
    path('update_password/', update_profile_password, name='update_password'),
    path('update_profile_picture/', update_profile_picture, name='update_profile_picture'),
	path('update_username/', update_profile_username, name='update_username'),
    path('get_user_data/', get_user_data, name='get_user_data'),
    path('unique_username/', unique_username, name='unique_username'),
]