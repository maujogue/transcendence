from django.urls import path
from tournaments import views

urlpatterns = [
    path('create/', views.create_tournament, name='create_tournament'),
    path('joint/<int:tournament_id>/', views.join_tournament, name='join_tournament'),
    path('quit/<int:tournament_id>/', views.quit_tournament, name='quit_tournament'),
    path('delete/<int:tournament_id>/', views.delete_tournament, name='delete_tournament'),
]