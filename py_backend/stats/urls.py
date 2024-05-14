from django.urls import path
from users.views import *
from . import views

urlpatterns = [
    path('<str:user>/winrate', views.get_user_winrate, name='winrate'),
    path('<str:user>/matchs', views.get_all_user_matchs, name='matchs'),
    path('<str:user>/matchs/win', views.get_user_win_matchs, name='win_matchs'),
    path('<str:user>/matchs/win/streak', views.get_user_win_streak, name='win_streak'),
    path('<str:user>/matchs/loose', views.get_user_loose_matchs, name='loose_matchs'),
    path('matchs', views.get_all_matchs, name='all_matchs'),
]