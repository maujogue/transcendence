import random
from .models import Tournament, TournamentMatch, Lobby

def create_tournament_match(tournament, playerList):
    match_lobby = Lobby.objects.create()
    player1 = playerList.pop()
    player2 = playerList.pop() if len(playerList) > 0 else None
    match = TournamentMatch.objects.create(
        round=1,
        player1=player1,
        player2=player2,
        lobby_id=match_lobby.uuid
    )
    print("create tournament match: ", match)
    tournament.matchups.add(match)
    tournament.save()

def generate_bracket(tournament):
    participants = list(tournament.participants.values_list('tournament_username', flat=True))
    random.shuffle(participants)

    while len(participants) >= 1:
        create_tournament_match(tournament, participants)
    
    tournament.save()

def get_round_winners(tournament):
    winners = []
    for match in tournament.matchups.filter(round=tournament.current_round):
        if match.winner == match.player1:
            winners.append(match.player1)
        else:
            winners.append(match.player2)
    return winners


def update_bracket(tournament):
    print("update bracket")
    winners = get_round_winners(tournament)
    
    tournament.current_round =+ 1

    while len(winners) >= 1:
        create_tournament_match(tournament, winners)