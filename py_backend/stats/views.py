from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from users.models import CustomUser
from .models import Match

def user_exists(func):
    def wrapper(request, username, *args, **kwargs):
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        return func(request, user, *args, **kwargs)
    return wrapper

@require_http_methods(["GET"])
@user_exists
def get_all_user_matchs(request, username):
    matchs = Match.objects.filter(player1=username) | Match.objects.filter(player2=username)
    return JsonResponse({"matchs": list(matchs.values())}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_user_winrate(request, username):
    matchsWin = Match.objects.filter(winner=username).count()
    matchsLoose = Match.objects.filter(loser=username).count()
    if matchsLoose == 0:
        return JsonResponse({"winrate": 100}, status=200)
    if matchsWin == 0:
        return JsonResponse({"winrate": 0}, status=200)
    return JsonResponse({"winrate": (matchsWin / matchsLoose) * 100}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_user_win_matchs(request, username):
    matchs = Match.objects.filter(winner=username)
    return JsonResponse({"matchs": list(matchs.values())}, status=200)

@require_http_methods(["GET"])
@user_exists
def get_user_loose_matchs(request, username):
    matchs = Match.objects.filter(loser=username)
    return JsonResponse({"matchs": list(matchs.values())}, status=200)

@require_http_methods(["GET"])
def get_all_matchs(request):
    matchs = Match.objects.all()
    return JsonResponse({"matchs": list(matchs.values())}, status=200)
