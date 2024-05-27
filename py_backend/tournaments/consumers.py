import json
import base64

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from asgiref.sync import sync_to_async

from .models import Tournament, TournamentMatch
from .signals import tournament_started

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tournament = await self.get_tournament()
        if self.tournament is None:
            return await self.close()
        await self.accept()
        await self.channel_layer.group_add(
            self.tournament.name,
            self.channel_name
        )
        participants = await self.get_tournament_participants()
        await self.channel_layer.group_send(
            self.tournament.name,
            {
                'type': 'tournament.participants',
                'participants': participants
            }
        )
        print("in connect")
        tournament_started.connect(self.tournament_started_handler)


    async def receive(self, text_data):
        print("receive")
        text_data_json = json.loads(text_data)
        if text_data_json.get('type') == 'auth':
            await self.send(text_data=json.dumps({ "type": "auth", "status": "success"}))
        print(text_data_json)


    async def disconnect(self, close_code):
        print('disconnected')
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
        tournament_started.disconnect(self.tournament_started_handler)

    @database_sync_to_async
    def get_tournament(self):
        try:
            return Tournament.objects.get(pk=self.scope['url_route']['kwargs']['tournament_id'])
        except Tournament.DoesNotExist:
            return None

    @database_sync_to_async
    def get_tournament_participants(self):
        return [p.tournament_username for p in self.tournament.participants.all()]

    async def tournament_participants(self, event):
        await self.send(
            text_data=json.dumps({'type': 'participants', 'participants': event['participants']}))
    
    @database_sync_to_async
    def get_player_match(self, user):
        return TournamentMatch.objects.filter(player_1=user).first()

    async def tournament_started_handler(self, sender, **kwargs):
        print("beginning of function")
        tournament = kwargs['tournament']
        if tournament.id == self.tournament.id:
            match = await self.get_player_match(self.scope['user'])
            if match:
                print("is in the match if")
                match_infos = {
                    'match_id': match.id,
                    'player_1': match.player_1.username,
                    'player_2': match.player_2.username if match.player_2 else None,
                    'round': match.round
                }
                await self.send(text_data=json.dumps({
                    'type': 'match_start',
                    'match': match_infos
                }))