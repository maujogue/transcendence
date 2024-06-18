from django.urls import path
from users.views import *

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
	path('logout/', logout_view, name='logout'),
    path('get_csrf_token/', get_csrf_token, name='get_csrf_token'),
    path('update_bio/', update_profile_bio, name='update_bio'),
    path('update_password/', update_profile_password, name='update_password'),
    path('update_profile_picture/', update_profile_picture, name='update_profile_picture'),
	path('update_username/', update_profile_username, name='update_username'),
    path('update_email/', update_email, name='update_email'),
    path('get_user_data/', get_user_data, name='get_user_data'),
    path('username_available/', username_available, name='username_available'),
    path('email_available/', email_available, name='email_available'),
	path('game_state/', game_state_view, name='game_state'),
	path('action/', action_view, name='action'),
	path('reset_game/', reset_game_view, name='reset_game'),
	path('reward/', reward_view, name='reward'),
    path('confirm_email/<uidb64>/<token>/', confirm_email, name='confirm_email'),
    path('confirm_new_email/<uidb64>/<token>/<new_email>/', confirm_new_email, name='confirm_new_email'),
]