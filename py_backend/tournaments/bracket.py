import random
from .models import Tournament, TournamentMatch, Lobby

def generate_bracket(tournament):
    participants = list(tournament.participants.values_list('tournament_username', flat=True))
    random.shuffle(participants)

    while len(participants) >= 2:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=1,
            player1=participants.pop(),
            player2=participants.pop(),
            lobby_id=match_lobby.uuid
        )
        tournament.matchups.add(match)
    
    if participants:
        match_lobby = Lobby.objects.create()
        match =TournamentMatch.objects.create(
            round=1,
            player1=participants.pop(),
            lobby_id=match_lobby.uuid
        )
        tournament.matchups.add(match)
    tournament.save()

def update_bracket(tournament):
    print("update bracket !")
    winners = []
    for match in tournament.matchups.filter(round=tournament.current_round):
        print(f"match.winner: {match.winner}")
        if match.winner == match.player1:
            winners.append(match.player1)
        else:
            winners.append(match.player2)
    
    next_round = tournament.current_round + 1

    while len(winners) >= 2:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=next_round,
            player1=winners.pop(),
            player2=winners.pop(),
            lobby_id=match_lobby.uuid
        )
        tournament.matchups.add(match)
    
    if winners:
        match_lobby = Lobby.objects.create()
        match = TournamentMatch.objects.create(
            round=next_round,
            player1=winners.pop(),
            player2=winners.pop(),
            lobby_id=match_lobby.uuid
        )
        tournament.matchups.add(match)

    tournament.current_round = next_round
    tournament.save()