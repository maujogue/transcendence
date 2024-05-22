import random
from .models import TournamentMatch, Lobby

def generate_bracket(tournament):
    participants = list(tournament.participants.all)
    random.shuffle(participants)

    matchups = []
    while len(participants) >= 2:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=f"Round 1",
            player_1=participants.pop(),
            player_2=participants.pop(),
            lobby=match_lobby
        )
        matchups.append(match)
    
    if participants:
        match_lobby = Lobby.objects.create()
        match =TournamentMatch.objects.create(
            round=f"Round 1",
            player_1=participants.pop(),
            lobby=match_lobby
        )
        matchups.append(match)
    
    return matchups


"""
step 1: launch the tournament when it's full
step 2: generate the bracket
step 3: I send at each consumer of the player their opponent and ID of the lobby
step 4: After the games, I receive the results and update the bracket, and start again until we have a winner
step 5: I use a web-socket to send a json of the names and scores so the front can show it in direct
"""

"""
class model tournamentmatch okay

"""