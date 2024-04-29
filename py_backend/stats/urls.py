from django.urls import path
from users.views import *
from . import views

urlpatterns = [
    path('<str:username>/winrate', views.get_user_winrate, name='winrate'),
    path('<str:username>/matchs', views.get_all_user_matchs, name='matchs'),
    path('<str:username>/matchs/win', views.get_user_win_matchs, name='win_matchs'),
    path('<str:username>/matchs/loose', views.get_user_loose_matchs, name='loose_matchs'),
    path('matchs', views.get_all_matchs, name='all_matchs'),
]