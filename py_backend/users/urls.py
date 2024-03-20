from django.urls import path
from users import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
	path('logout_view/', views.logout_view, name='logout_view'),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token'),
	path('update_profile/', views.update_profile, name='update_profile'),
]