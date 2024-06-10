import random
from .models import Tournament, TournamentMatch, Lobby

def create_tournament_match(tournament, playerList):
    match_lobby = Lobby.objects.create()
    player1 = playerList.pop()
    player2 = playerList.pop() if len(playerList) > 0 else None
    winner = player1 if player2 is None else None
    match = TournamentMatch.objects.create(
        round=tournament.current_round,
        player1=player1,
        player2=player2,
        winner=winner,
        lobby_id=match_lobby.uuid
    )
    print("create tournament match: ", match)
    tournament.matchups.add(match)
    tournament.save()

def get_round_winners(tournament):
    winners = []
    for match in tournament.matchups.filter(round=tournament.current_round - 1):
        if match.winner == match.player1:
            winners.append(match.player1)
        else:
            winners.append(match.player2)
    return winners

def generate_bracket(tournament):
    print('generate bracket:', tournament.name)
    if tournament.current_round == 1:
        participants = list(tournament.participants.values_list('tournament_username', flat=True))
    else:
        participants = get_round_winners(tournament)
    random.shuffle(participants)

    while len(participants) >= 1:
        create_tournament_match(tournament, participants)
    
    tournament.save()
