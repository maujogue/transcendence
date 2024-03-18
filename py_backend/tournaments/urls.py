from django.urls import path
from tournaments import views

urlpatterns = [
    path('tournaments/', views.tournaments, name='tournaments'),
]