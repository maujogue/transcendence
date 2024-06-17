from django.urls import path
from friends import views

urlpatterns = [
	path('remove/<str:friend_username>/', views.remove, name='remove'),
]