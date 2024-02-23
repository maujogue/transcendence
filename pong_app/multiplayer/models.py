from django.db import models

class Room(models.Model):
    code = models.CharField(max_length=255, unique=True)
    connected_user = models.IntegerField(default=0)
    player_ready = models.IntegerField(default=0)
    game_started = models.BooleanField(default=False)
    player1Present = models.BooleanField(default=False)
    player2Present = models.BooleanField(default=False)

    async def setPlayerReady(self, isReady, player):
        if isReady == 'true':
            self.player_ready += 1
            player.is_ready = True
        else:
            self.player_ready -= 1
            player.is_ready = False
        print('player_ready:', self.player_ready)
        await self.asave(update_fields=['player_ready'])
    
    async def disconnectUser(self, player):
        if self.connected_user != 0:
            self.connected_user -= 1
        if player.is_ready == True:
            self.player_ready -= 1
        if self.connected_user == 0:
            self.player_ready = 0
        if player.name == 'player1':
            self.player1Present = False
        else:
            self.player2Present = False
        await self.asave()

    async def stopGame(self):
        self.player_ready = 0
        self.game_started = False
        await self.asave()

    async def startGame(self):
        self.game_started = True
        await self.asave(update_fields=['game_started'])
