from django.urls import path
from friends import views

urlpatterns = [
	path('send_request/<int:user_id>/', views.send_request, name='send_request'),
	path('accept_friend/<int:request_id>/', views.accept_friend, name='accept_friend'),
	path('remove_friend/<int:request_id>/', views.remove_friend, name='remove_friend'),
]