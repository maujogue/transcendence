from django.contrib import admin
from django.urls import path
from users import views
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView



urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
	path('logout_view/', views.logout_view, name='logout_view'),
	path('tournament/', views.tournament, name='tournament'),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token'),
    path('send_friend_request/<int:user_id>/', views.send_friend_request, name='send_friend_request'),
]