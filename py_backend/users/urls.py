from django.urls import path, re_path
from users.views import *
from users.views.tournament_username_available import tournament_username_available
from users.views.username_available import username_available
from users.views.update_profile_banner import update_profile_banner
from users.views.update_lang import update_lang
from users.views.check_password import check_password

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
	path('logout/', logout_view, name='logout'),
    path('get_csrf_token/', get_csrf_token, name='get_csrf_token'),
    path('update_bio/', update_profile_bio, name='update_bio'),
    path('update_password/', update_profile_password, name='update_password'),
    path('update_profile_picture/', update_profile_picture, name='update_profile_picture'),
    path('update_profile_banner/', update_profile_banner, name='update_profile_banner'),
	path('update_username/', update_profile_username, name='update_username'),
	path('update_tournament_name/', update_tournament_name, name='update_tournament_name'),
    path('update_email/', update_email, name='update_email'),
	path('update_lang/', update_lang, name='update_lang'),
    path('get_user_data/', get_user_data, name='get_user_data_current'),
	re_path(r'^get_user_data/(?P<username>[\w.@+-]+)/$', get_user_data, name='get_user_data'),
    path('username_available/', username_available, name='username_available'),
    path('email_available/', email_available, name='email_available'),
    path('confirm_email/<uidb64>/<token>/', confirm_email, name='confirm_email'),
    path('confirm_new_email/<uidb64>/<token>/<new_email>/', confirm_new_email, name='confirm_new_email'),
	path('check_user_logged_in/', check_user_logged_in_view, name='check_user_logged_in'),
    path('update_tournament_name/', update_tournament_name, name='update_tournament_name'),
	path('check_password/', check_password, name='check_password'),
    path('tournament_username_available/', tournament_username_available, name='tournament_username_available'),
]