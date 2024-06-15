from django.urls import path
from friends import views

urlpatterns = [
	path('send_request/<str:username>/', views.send_request, name='send_request'),
	path('remove/<str:friend_username>/', views.remove, name='remove'),
]