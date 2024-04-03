from django.urls import path
from tournaments import views

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    path('join_tournament/<int:tournament_id>/', views.join_tournament, name='join_tournament'),
    path('quit_tournament/<int:tournament_id>/', views.quit_tournament, name='quit_tournament'),
    path('delete_tournament/<int:tournament_id>/', views.delete_tournament, name='delete_tournament'),
]