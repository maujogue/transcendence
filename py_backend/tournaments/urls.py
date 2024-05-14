from django.urls import path
from tournaments import views

urlpatterns = [
    path('create/', views.create_tournament, name='create_tournament'),
    path('list/', views.list_tournaments, name='list_tournaments'),
    path('<int:tournament_id>/participants/', views.list_participants, name='list_participants'),
    path('join/<int:tournament_id>/', views.join_tournament, name='join_tournament'),
    path('quit/<int:tournament_id>/', views.quit_tournament, name='quit_tournament'),
    path('delete/<int:tournament_id>/', views.delete_tournament, name='delete_tournament'),
]