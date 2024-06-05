from django.dispatch import receiver

import random
from .models import Tournament, TournamentMatch, Lobby

def generate_bracket(tournament):
    participants = list(tournament.participants.all())
    random.shuffle(participants)

    while len(participants) >= 2:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=1,
            player_1=participants.pop(),
            player_2=participants.pop(),
            lobby=match_lobby
        )
        print("generate_bracket: ", match)
        tournament.matchups.add(match)
    
    if participants:
        print("odd")
        match_lobby = Lobby.objects.create()
        match =TournamentMatch.objects.create(
            round=1,
            player_1=participants.pop(),
            lobby=match_lobby
        )
        tournament.matchups.add(match)
    tournament.save()

def update_bracket(tournament, current_round):
    print("update bracket !")
    winners = []
    for match in tournament.matchups.filter(round=current_round):
        if match.winner == match.player_1.username:
            winners.append(match.player_1)
        else:
            winners.append(match.player_2)
    
    while len(winners) >= 2:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=current_round + 1,
            player_1=winners.pop(),
            player_2=winners.pop(),
            lobby=match_lobby
        )
        tournament.matchups.add(match)
    
    if winners:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=current_round + 1,
            player_1=winners.pop(),
            player_2=winners.pop(),
            lobby=match_lobby
        )
        tournament.matchups.add(match)

    tournament.save()