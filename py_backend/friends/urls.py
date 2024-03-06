from django.urls import path
from friends import views

urlpatterns = [
    path('send_friend_request/<int:user_id>/', views.send_friend_request, name='send_friend_request'),
	path('add_friend/<int:user_id>/', views.add_friend, name='add_friend'),
]