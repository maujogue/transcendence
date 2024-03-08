from django.urls import path
from friends import views

urlpatterns = [
    path('send_friend_request/<int:user_id>/', views.send_friend_request, name='send_friend_request'),
	 path('accept_friend_request/<int:request_id>/', views.accept_friend_request, name='accept_friend_request'),
]