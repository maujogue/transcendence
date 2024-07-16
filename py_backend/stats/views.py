from difflib import ndiff
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from users.models import CustomUser
from .models import Match
import json

def user_exists(func):
    def wrapper(request, user, *args, **kwargs):
        try:
            userAuth = CustomUser.objects.get(username=user)
        except CustomUser.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        return func(request, userAuth, *args, **kwargs)
    return wrapper

@require_http_methods(["GET"])
@user_exists
def get_all_user_matchs(request, user):
    matches = Match.objects.filter(player1=user.id) | Match.objects.filter(player2=user.id)
    matchs_json = create_match_list(matches)
    return JsonResponse({"matchs": matchs_json}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_point_scored_per_match(request, user):
    matchs = Match.objects.filter(player1=user.id) | Match.objects.filter(player2=user.id)
    if matchs.count() == 0:
        return JsonResponse({"average_scored_per_match": 0, "average_conceded_per_match": 0}, status=200)
    total_score = 0
    total_score_against = 0
    for match in matchs:
        if match.player1 == user:
            total_score += match.player1_score
            total_score_against += match.player2_score
        else:
            total_score += match.player2_score
            total_score_against += match.player1_score
    return JsonResponse({
        "average_scored_per_match": round(total_score / matchs.count(), 2),
        "average_conceded_per_match": round(total_score_against / matchs.count(), 2),
        }, status=200)

@require_http_methods(["GET"])
@user_exists
def get_user_winrate(request, user):
    matchsWin = Match.objects.filter(winner=user.id).count()
    matchsTotal = Match.objects.count()
    if (matchsTotal == 0):
        return JsonResponse({"winrate": 0}, status=200)
    return JsonResponse({"winrate": round(matchsWin / matchsTotal * 100)}, status=200)

def get_username_with_id(id):
    try:
        return CustomUser.objects.get(id=id).tournament_username
    except CustomUser.DoesNotExist:
        return 'null'
    
def create_match_json(match):
    return {
        'id': match.id,
        'lobby_id': match.lobby_id,
        'player1': get_username_with_id(match.player1),
        'player2': get_username_with_id(match.player2),
        'player1_score': match.player1_score,
        'player2_score': match.player2_score,
        'player1_average_exchange': match.player1_average_exchange,
        'player2_average_exchange': match.player2_average_exchange,
        'winner': get_username_with_id(match.winner),
        'loser': get_username_with_id(match.loser),
        'date': match.date
    }

def create_match_list(matches):
    matchs_json = []
    for match in matches:
        match_json = create_match_json(match)
        matchs_json.append(match_json)
    return matchs_json



@require_http_methods(["GET"])
@user_exists
def get_user_win_matchs(request, user):
    matches = Match.objects.filter(winner=user.id)
    matchs_json = create_match_list(matches)
    return JsonResponse({"matchs": matchs_json}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_average_exchange_before_goal(request, user):
    matchs = Match.objects.filter(player1=user.id) | Match.objects.filter(player2=user.id)
    if matchs.count() == 0:
        return JsonResponse({"average_exchange_before_goal": 0}, status=200)
    total_exchange = 0
    for match in matchs:
        if match.player1 == user:
            total_exchange += match.player1_average_exchange
        else:
            total_exchange += match.player2_average_exchange
    return JsonResponse({"average_exchange_before_goal": round(total_exchange / matchs.count(), 2)}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_user_win_streak(request, user):
    matches = Match.objects.filter(player1=user.id) | Match.objects.filter(player2=user.id)
    matches.order_by('date')
    max_series_length = 0 
    current_series_length = 0 

    for match in matches:
        if match.winner == user:
            current_series_length += 1
        else:
            max_series_length = max(max_series_length, current_series_length)  
            current_series_length = 0 
    max_series_length = max(max_series_length, current_series_length)

    return JsonResponse({"win_streak": max_series_length}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_user_loose_matchs(request, user):
    matches = Match.objects.filter(loser=user.id)
    matchs_json = create_match_list(matches)
    return JsonResponse({"matchs": matchs_json}, status=200)

@require_http_methods(["GET"])
def get_all_matchs(request):
    matches = Match.objects.all()
    matchs_json = create_match_list(matches)
    return JsonResponse({"matchs": matchs_json}, status=200)