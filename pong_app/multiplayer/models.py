from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async


class Room(models.Model):
    code = models.CharField(max_length=255, unique=True)
    connected_user = models.IntegerField(default=0)
    player_ready = models.IntegerField(default=0)
    game_started = models.BooleanField(default=False)

    async def setPlayerReady(self, isReady, player):
        if isReady == 'true':
            self.player_ready += 1
            player.is_ready = True
        else:
            self.player_ready -= 1
            player.is_ready = False
        await self.asave(update_fields=['player_ready'])
    
    async def disconnectUser(self, player):
        if self.connected_user != 0:
            self.connected_user -= 1
        if player.is_ready == True:
            self.player_ready -= 1
        await self.asave(update_fields=['connected_user', 'player_ready'])

    async def stopGame(self):
        self.game_started = False
        await self.asave(update_fields=['game_started'])

    async def startGame(self):
        self.game_started = True
        await self.asave(update_fields=['game_started'])
