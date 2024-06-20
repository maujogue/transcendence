from django.urls import path
from users.views import *
from . import views

urlpatterns = [
    path('<str:user>/winrate', views.get_user_winrate, name='winrate'),
    path('<str:user>/matchs', views.get_all_user_matchs, name='matchs'),
    path('<str:user>/average-scored-per-match', views.get_point_scored_per_match, name='scored-per-match'),
    path('<str:user>/matchs/win', views.get_user_win_matchs, name='win_matchs'),
    path('<str:user>/matchs/win/streak', views.get_user_win_streak, name='win_streak'),
    path('<str:user>/matchs/loose', views.get_user_loose_matchs, name='loose_matchs'),
    path('<str:user>/average-exchange-before-goal', views.get_average_exchange_before_goal, name='average_exchange_before_goal'),
    path('matchs', views.get_all_matchs, name='all_matchs'),
]