from django.contrib import admin
from django.urls import path
from users import views
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView



urlpatterns = [
    path('register/', views.register, name='register'),
    path('is_register/', views.is_register, name='is_register'),
    path('is_authenticated/', views.is_authenticated, name='is_authenticated'),
    path('login/', views.login, name='login'),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token')
]