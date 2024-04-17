from django.urls import path
from users import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
	path('logout/', views.logout_view, name='logout'),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token'),
	path('update_username/', views.update_profile_username, name='update_username'),
    path('update_bio/', views.update_profile_bio, name='update_bio'),
    path('update_password/', views.update_profile_password, name='update_password'),
]