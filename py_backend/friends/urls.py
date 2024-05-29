from django.urls import path
from friends import views

urlpatterns = [
	path('send_request/<str:username>/', views.send_request, name='send_request'),
	path('accept/<int:request_id>/', views.accept, name='accept'),
	path('remove/<str:username/', views.remove, name='remove'),
	path('get_friendslist/', views.get_friendslist, name='get_friendslist'),
]