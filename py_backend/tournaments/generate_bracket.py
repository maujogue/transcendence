# import random

# def generate_bracket(tournament):
#     participants = list(tournament.participants.all)
#     random.shuffle(participants)

#     matchups = []
#     while len(participants) >= 2:
#         player1 = participants.pop()
#         player2 = participants.pop()
#         matchups.append((player1, player2))
    
#     if participants:
#         matchups.append((participants.pop(), None))
    
#     return matchups


"""
step 1: launch the tournament when it's full
step 2: generate the bracket
step 3: I send at each consumer of the player their opponent and ID of the lobby
step 4: After the games, I receive the results and update the bracket, and start again until we have a winner
step 5: I use a web-socket to send a json of the names and scores so the front can show it in direct
"""