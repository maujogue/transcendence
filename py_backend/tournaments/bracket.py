from django.dispatch import receiver

import random
from .models import Tournament, TournamentMatch, Lobby



def generate_bracket(tournament):
    participants = list(tournament.participants.all())
    random.shuffle(participants)

    while len(participants) >= 2:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=f"Round 1",
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
            round=f"Round 1",
            player_1=participants.pop(),
            lobby=match_lobby
        )
        tournament.matchups.add(match)
    tournament.save()
