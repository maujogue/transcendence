import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

from users.models import CustomUser
from stats.models import Match
from multiplayer.models import Lobby
from .models import Tournament, TournamentMatch
from .bracket import generate_bracket

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('connected: ', self.scope['user'])
        self.match = None
        self.tournament = await self.get_tournament()
        if self.tournament is None:
            return await self.close()
        await self.accept()
        await self.channel_layer.group_add(
            self.tournament.name,
            self.channel_name
        )
        if self.tournament.finished:
            await self.send_tournament_end()
        elif not self.tournament.started:
            await self.send_participants_list()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json.get('type') == 'auth':
            await self.auth(text_data_json)
        if text_data_json.get('type') == 'status':
            await self.handler_status(text_data_json.get('status'))
        if text_data_json.get('type') == 'bracket':
            bracket = await sync_to_async(self.tournament.get_tournament_bracket)()
            await self.send(text_data=json.dumps({'type': 'bracket', 'bracket': bracket}))
        if text_data_json.get('type') == 'getRanking':
            await self.send_tournament_ranking()

    async def disconnect(self, close_code):
        print('tournament disconnected')
        participants = await self.get_tournament_participants()
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.participants',
                'participants': participants
            }
        )
        await self.channel_layer.group_discard(
            self.tournament.name,
            self.channel_name
        )

    async def handler_status(self, status):
        print('tournament status: ', status)
        if status == 'endGame':
            await self.endGame()

    async def endGame(self):
        if not await self.validate_foreign_keys():
            return
        print('tournament: endGame')
        await self.set_match_info()
        await self.match_is_over()
        print(f'{self.scope["user"].tournament_username} match is over, {self.match.winner} wins!')
        if self.match.winner == self.scope['user'].tournament_username:
            await self.send(text_data=json.dumps({'type': 'status', 'status': 'waiting'}))
        if self.match.winner == self.scope['user'].tournament_username and await self.check_if_all_matches_finished():
            await self.advance_in_tournament()
        else:
            bracket = await sync_to_async(self.tournament.get_tournament_bracket)()
            await self.send(text_data=json.dumps({'type': 'bracket', 'bracket': bracket}))


    async def match_is_over(self):
        print('match is over')
        self.match = await self.get_player_match(self.scope['user'].tournament_username)
        if not self.match:
            return
        self.match.finished = True
        await self.match.asave()

    async def auth(self, text_data_json):
        username = text_data_json.get('username')
        user = await self.authenticate_user_with_username(username)
        if user:
            self.scope["user"] = user
            self.match = await self.get_player_match(self.scope['user'].tournament_username)
            await self.send(text_data=json.dumps({"type": "auth", "status": "success"}))
            await self.check_tournament_start()
            await self.check_if_disqualified()
        else:
            await self.send(text_data=json.dumps({"type":"auth", "status": "failed"}))

    async def set_tournament_over(self):
        print('tournament is over')
        self.tournament.finished = True
        await self.tournament.asave()
        await self.send_tournament_end()

    async def generate_round(self):
        print(f'{self.scope["user"].tournament_username}: generating round {self.tournament.current_round}')
        await sync_to_async(generate_bracket)(self.tournament)
        await self.send_bracket(True)
        await self.send_all_matchups()

    async def advance_in_tournament(self):
        print(f'{self.scope["user"].tournament_username}: all match in round {self.tournament.current_round} are finished')
        print('max_round: ', self.tournament.max_round)
        await self.tournament.increase_round()
        if self.tournament.current_round <= self.tournament.max_round:
            await self.generate_round()
        else:
            await self.set_tournament_over()

    async def check_if_all_matches_finished(self):
        self.tournament = await self.get_tournament()
        all_matches = await sync_to_async(list)(self.tournament.matchups.filter(round=self.tournament.current_round))
        print(f'all_matches: {all_matches}, are finished: {all(matches.finished for matches in all_matches)}')
        if all(matches.finished for matches in all_matches) and len(all_matches) > 0:
            return True
        return False
    
    async def create_history_match(self, lobby):
        try:
            self.match = await Match.objects.aget(lobby_id=str(lobby.uuid))
            return
        except Match.DoesNotExist:
            winner = lobby.player1 if lobby.player1 else lobby.player2
            if not winner:
                winner = self.match.player1
            loser = self.match.player2 if winner == self.match.player1 else self.match.player1

            match = Match(  lobby_id=str(lobby.uuid),
                            player1=self.match.player1, 
                            player2=self.match.player2, 
                            player1_average_exchange=0,
                            player2_average_exchange=0,
                            winner=winner,
                            loser=loser,
                            player1_score=0, 
                            player2_score=0)
            await match.asave()
    
    
    async def check_if_match_is_started(self):
        await asyncio.sleep(10)
        try:
            lobby = await Lobby.objects.aget(pk=self.match.lobby_id)
            print(f'lobby: {lobby}')
            if not lobby.game_started:
                print('match cancelled')
                self.send(text_data=json.dumps({'type': 'status', 'status': 'match_cancelled'}))
                await self.create_history_match(lobby)
                await self.endGame()
        except Lobby.DoesNotExist:
            print("lobby does not exist")
            return

    async def set_match_info(self):
        print(f'{self.scope["user"].tournament_username} set match info, lobby_id: {self.match.lobby_id}')
        try:
            match = await Match.objects.aget(lobby_id=str(self.match.lobby_id))
            self.match.player1 = match.player1
            self.match.player2 = match.player2
            self.match.score_player_1 = match.player1_score
            self.match.score_player_2 = match.player2_score
            self.match.winner = match.winner
            loser = match.player1 if match.winner == match.player2 else match.player2
            await self.match.asave()
            await self.send_disqualified(loser)
            await self.remove_lobby()
        except Match.DoesNotExist:
            print("set match info: Match does not exist")
            return
        
    async def remove_lobby(self):
        try:
            lobby = await Lobby.objects.aget(pk=self.match.lobby_id)
            await lobby.adelete()
            print('lobby deleted')
        except Lobby.DoesNotExist:
            print("lobby does not exist")
            return
        
    async def launch_tournament(self):
        print('launch tournament')
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.status',
                'status': 'start'
            }
        )
        self.tournament.started = True
        await sync_to_async(self.tournament.save)()
        await self.generate_round()
    
    @database_sync_to_async
    def is_tournament_full(self):
        if self.tournament.participants.count() == self.tournament.max_players:
            return True
        return False
    
    async def check_tournament_start(self):
        if await self.is_tournament_full() and not self.tournament.started:
            await self.launch_tournament()
        elif self.tournament.started:
            if self.match:
                await self.send_self_matchup()
            else:
                await self.send_bracket(False)
    
    async def validate_foreign_keys(self):
        try:
            if not self.match:
                self.match = await self.get_player_match(self.scope['user'].tournament_username)
            tournament = await Tournament.objects.aget(id=self.scope['url_route']['kwargs']['tournament_id'])
            match = await TournamentMatch.objects.aget(lobby_id=self.match.lobby_id)
            return True
        except Tournament.DoesNotExist:
            print("Tournament does not exist")
            return False
        except TournamentMatch.DoesNotExist:
            print("Match does not exist")
            return False
        
    async def check_if_disqualified(self):
        if await sync_to_async(self.tournament.check_if_player_is_disqualified)(self.scope['user']):
            await self.send(text_data=json.dumps({'type': 'status', 'status': 'disqualified'}))
        else:
            print('not disqualified')

    async def get_player_match(self, username):
        self.tournament = await self.get_tournament()
        return await sync_to_async(self.tournament.get_matches_by_player)(username)

    def get_match_infos(self, match):
        return {
            'lobby_id': str(match.lobby_id),
            'player_1': match.player1,
            'player_2': match.player2 if match.player2 else None,
            'round': match.round
        }
    
    @database_sync_to_async
    def get_tournament(self):
        try:
            return Tournament.objects.get(pk=self.scope['url_route']['kwargs']['tournament_id'])
        except Tournament.DoesNotExist:
            return None

    @database_sync_to_async
    def get_tournament_participants(self):
        return [p.tournament_username for p in self.tournament.participants.all()]
    
    @database_sync_to_async
    def authenticate_user_with_username(self, username):
        try:
            return CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return None
        
    async def send_self_matchup(self):
        self.match = await self.get_player_match(self.scope['user'].tournament_username)
        if self.match and not self.match.finished and self.match.player2:
            match_infos = self.get_match_infos(self.match)
            await self.send(text_data=json.dumps({'type': 'matchup', 'match': match_infos}))

    async def send_all_matchups(self):
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.matchups'
            }
        )

    async def send_disqualified(self, username):
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.status',
                'status': 'disqualified',
                'username': username
            }
        )

    async def send_bracket(self, forAll):
        bracket = await sync_to_async(self.tournament.get_tournament_bracket)()
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.bracket',
                'bracket': bracket,
                'forAll': forAll
            }
        )

    async def send_participants_list(self):
        participants = await self.get_tournament_participants()
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.participants',
                'participants': participants
            }
        )

    async def send_tournament_end(self):
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.status',
                'status': 'endTournament'
            }
        )

    async def send_tournament_ranking(self):
        winner = await sync_to_async(self.tournament.get_winner)()
        ranking = await sync_to_async(self.tournament.get_ranking)()
        await self.send(text_data=json.dumps({'type': 'ranking', 'winner': winner, 'ranking': ranking}))
    
    async def tournament_participants(self, event):
        await self.send(
            text_data=json.dumps({'type': 'participants', 'participants': event['participants']}))
        
    async def tournament_matchups(self, event):
        self.match = await self.get_player_match(self.scope['user'].tournament_username)
        print(f'{self.scope["user"].tournament_username} match: ', self.match)
        if self.match:
            if not self.match.finished and self.match.player2:
                match_infos = self.get_match_infos(self.match)
                await self.send(text_data=json.dumps({'type': 'matchup', 'match': match_infos}))
                asyncio.create_task(self.check_if_match_is_started())
            else:
                await self.send(text_data=json.dumps({'type': 'status', 'status': 'waiting'}))
                

    async def tournament_status(self, event):
        print('status: ', event['status'])
        if event['status'] == 'disqualified':
            if event['username'] == self.scope['user'].tournament_username:
                print('disqualified: ', event['username'])
                await self.send(text_data=json.dumps({'type': 'status', 'status': 'disqualified'}))
        elif event['status'] == 'endTournament':
            await self.send(text_data=json.dumps({'type': 'status', 'status': 'endTournament'}))
            await self.send_tournament_ranking()
        else:
            await self.send(text_data=json.dumps({'type': 'status', 'status': event['status']}))



    async def tournament_bracket(self, event):
        print(f'bracket: {self.scope["user"].tournament_username} {event["bracket"]}, forAll: {event["forAll"]}')
        if event['forAll'] or not await sync_to_async(self.tournament.check_if_player_is_in_match)(self.scope['user'].tournament_username):
            await self.send(text_data=json.dumps({'type': 'bracket', 'bracket': event['bracket']}))
        if event['forAll']:
            await asyncio.sleep(10)