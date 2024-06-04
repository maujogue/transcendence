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
            player1=participants.pop().tournament_username,
            player2=participants.pop().tournament_username,
            lobby_id=match_lobby.uuid
        )
        tournament.matchups.add(match)
    
    if participants:
        match_lobby = Lobby.objects.create()
        match =TournamentMatch.objects.create(
            round=f"Round 1",
            player1=participants.pop().tournament_username,
            lobby_id=match_lobby.uuid
        )
        tournament.matchups.add(match)
    tournament.save()
