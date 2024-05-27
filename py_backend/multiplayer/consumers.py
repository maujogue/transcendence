import json
import base64
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Lobby
from multiplayer.ball import Ball
from multiplayer.player import Player
from users.models import CustomUser
from stats.models import Match

class PongConsumer(AsyncWebsocketConsumer):

    async def send_player_data(self):
        await self.send(text_data=json.dumps({
            'type': 'player_data',
            'name': self.player.name,
            'character': self.player.character
        }))

    async def join_lobby(self):
        async for lobby in Lobby.objects.filter(connected_user=1):
            return lobby
        lobby = Lobby()
        await lobby.asave()
        return lobby
    
    async def create_player(self):
        name = 'player1' if self.lobby.player1Present == False else 'player2'
        if name == 'player1':
            self.lobby.player1Present = True
        else:
            self.lobby.player2Present = True
        oppName = 'player2' if name == 'player1' else 'player1'
        posX = -9.50 if name == 'player1' else 9.50
        oppPosX = 9.50 if name == 'player1' else -9.50
        self.player = Player(name, character='chupacabra', lobby_id=self.lobby.uuid, posX=posX)
        self.opp = Player(oppName, character='chupacabra', lobby_id=self.lobby.uuid, posX=oppPosX)
        await self.lobby.asave()

    async def connect(self):
        self.max_points = 3
        self.is_connected = False
        self.is_ready = False
        
        self.exchangeBeforePointsP1 = []
        self.exchangeBeforePointsP2 = []
        self.countExchange = 0
        self.lobby = await self.join_lobby()
        self.lobby_name = self.lobby.uuid
        if self.lobby.connected_user >= 2:
            return await self.close()
        self.ball = Ball()
        await self.create_player()
        self.lobby.connected_user += 1
        self.lobby.player_ready += 1
        await self.lobby.asave(update_fields=['connected_user', 'player_ready'])
        self.lobby_group_name = 'lobby_%s' % self.lobby.uuid
        await self.channel_layer.group_add(
            self.lobby_group_name,
            self.channel_name
        )
        self.is_connected = True
        await self.accept()
        await self.send_player_data()
        if self.lobby.connected_user == 2:
            await self.channel_layer.group_send(
                self.lobby_group_name, { 'type': 'pong.ask_character', 'name': self.player.name}
            )
            await self.channel_layer.group_send(
                self.lobby_group_name, { 'type': 'pong.ask_user', 'name': self.player.name}
            )
            await self.startGame()
            
    async def authenticate_user_with_username(self, username):
        try:
            user = await CustomUser.objects.aget(username=username)
            return user
        except CustomUser.DoesNotExist:
            return None
        
    async def authenticate_user(self, text_data_json):
        username = text_data_json['username']
        user = await self.authenticate_user_with_username(username)
        if user is not None:
            self.scope['user'] = user
            await self.send(text_data=json.dumps({ "type": "auth", "status": "success"}))
        else:
            await self.send(text_data=json.dumps({ "type": "auth", "status": "failed"}))
        await self.channel_layer.group_send(
            self.lobby_group_name, { 'type': 'pong.user_info', 'user': self.scope['user'], 'name': self.player.name}
        )

    async def set_character(self, text_data_json):
        self.player.character = text_data_json.get("character")
        await self.channel_layer.group_send(
            self.lobby_group_name, {
                'type': 'pong.character_data',
                'character': self.player.character,
                'sender': self.channel_name,
                'name': self.player.name
            }
        )

    async def sendCharacter(self, text_data_json):
        character = text_data_json["character"]
        await self.channel_layer.group_send(
            self.lobby_group_name, {
                'type': 'pong.data', 
                'character': character, 
                'sender': self.channel_name, 
                'name': self.player.name
                }
        )

    async def receive(self, text_data):
        self.lobby = await Lobby.objects.aget(uuid=self.lobby_name)
        text_data_json = json.loads(text_data)
        if text_data_json.get("type") == 'auth':
            await self.authenticate_user(text_data_json)
        if text_data_json.get("ready"):
            await self.lobby.setPlayerReady(text_data_json.get("ready"), self.player)
        if text_data_json.get("character"):
            await self.set_character(text_data_json)
        if self.lobby.player_ready == 2 and not self.lobby.game_started:
            await self.startGame()
        if text_data_json.get("type") == "user_info":
            await self.channel_layer.group_send(
                self.lobby_group_name, { 'type': 'pong.user_data', 'username': text_data_json.get('username'), 'avatar': text_data_json.get('avatar'), 'name': text_data_json.get('name')}
            )
        if self.lobby.game_started:
            if text_data_json.get("type") == "player_pos":
                await self.getPlayerMove(text_data_json)

    async def disconnect(self, close_code):
        self.lobby = await Lobby.objects.aget(uuid=self.lobby_name)
        if self.is_connected == False:
            return

        try:
            await self.lobby.disconnectUser(self.player)
            await self.channel_layer.group_send(
                self.lobby_group_name, {  'type': 'pong.status', 'status': 'disconnected', 'message': f"{self.scope['user']} is disconnected", 'name': self.player.name}
            )
            if (self.lobby.game_started == True):
                await self.lobby.stopGame()
                await self.channel_layer.group_send(
                    self.lobby_group_name, { 'type': 'pong.status', 'status': 'stop', 'message': f"Connection lost with {self.scope['user']}", 'name': self.player.name}
                )
            await self.channel_layer.group_discard(
                self.lobby_group_name,
                self.channel_name
            )
            if self.lobby.connected_user == 0:
                await self.lobby.adelete()
                await self.channel_layer.close()
        except Exception as e:
            print(e)
    
    
    async def startGame(self):
        await self.channel_layer.group_send(
        self.lobby_group_name, { 
            'type': 'pong.status',
            'status': 'start',
            'message': 'Game is starting!',
            'name': self.player.name
            }
        )
        await self.channel_layer.group_send(
        self.lobby_group_name, {
                'type': 'pong.ball_data',
                'posX': self.ball.posX,
                'posY': self.ball.posY,
                'dirX': self.ball.dirX,
                'dirY': self.ball.dirY
            }
        )
        await self.lobby.startGame()

    async def gameLoop(self):
        self.lobby = await Lobby.objects.aget(uuid=self.lobby_name)
        while self.lobby.game_started:
            await self.movePlayer()
            if self.player.name == 'player1':
                await self.checkAllCollisions()
            self.ball.translate()
            if (self.ball.checkIfScored(self.player) or self.ball.checkIfScored(self.opp)):
                await self.isScored()
            if self.player.score == self.max_points or self.opp.score == self.max_points:
                await self.setGameOver()
                break
            await self.sendBallData()
            await self.sendPlayerMove()
            await asyncio.sleep(1 / 60)

    async def getPlayerMove(self, data):
        move = data.get("move")

        if move != 0 and move != 1 and move != -1:
            return
        if move != 0:
            move = 0.125 if move == 1 else -0.125
        if self.player.move == move:
            return
        self.player.move = move
        if self.player.checkCollisionBorder() == True:
            self.player.move = 0

    async def sendScore(self, player):
        player.score += 1
        await self.channel_layer.group_send (
            self.lobby_group_name, { 'type': 'pong.score', 'score': player.score, 'name': player.name}
        )
    
    async def sendBallData(self):
        if not self.player.name == 'player1':
            return
        await self.channel_layer.group_send(
            self.lobby_group_name, { 
                'type': 'pong.ball_data', 
                'posX': self.ball.posX, 
                'posY': self.ball.posY, 
                'dirX': self.ball.dirX, 
                'dirY': self.ball.dirY
            }
        )
    
    async def isScored(self):
        self.player.resetPaddlePos()
        self.opp.resetPaddlePos()
        ballDirX = self.ball.dirX

        if not self.player.name == 'player1':
            return 
        if self.ball.checkIfScored(self.player):
            await self.sendScore(self.opp)
            ballDirX = -0.080
            self.exchangeBeforePointsP1.append(self.countExchange)
        if self.ball.checkIfScored(self.opp):
            await self.sendScore(self.player)
            ballDirX = 0.080
            self.exchangeBeforePointsP2.append(self.countExchange)
        self.ball.reset()
        self.ball.dirX = ballDirX
        await self.sendBallData()

    async def collision(self, player):
        self.countExchange += 1
        self.ball.collisionPaddle(player)

    async def checkAllCollisions(self):
        if self.ball.checkCollisionBorder():
            self.ball.collisionBorder()
        elif self.ball.checkCollisionPaddle(self.player):
            await self.collision(self.player)
        elif self.ball.checkCollisionPaddle(self.opp):
            await self.collision(self.opp)

    async def setGameOver(self):
        await self.lobby.stopGame()
        if self.player.name == 'player1':
            await self.createHistoryMatch()
        await self.channel_layer.group_send(
            self.lobby_group_name, { 'type': 'pong.status', 'status': 'endGame', 'message': 'The game is over', 'name': self.player.name}
        )

    def calculateAverageExchange(self, exchangeBeforePoint):
        if len(exchangeBeforePoint) == 0 or sum(exchangeBeforePoint) == 0:
            return 0
        return sum(exchangeBeforePoint) / len(exchangeBeforePoint)
    
    async def createHistoryMatch(self):
        player1 = self.player if self.player.name == 'player1' else self.opp
        player2 = self.player if self.player.name == 'player2' else self.opp
        winner = player1.user.username if player1.score > player2.score else player2.user.username
        loser = player1.user.username if player1.score < player2.score else player2.user.username
        match = Match(player1=player1.user.username, 
                      player2=player2.user.username, 
                      player1_average_exchange=self.calculateAverageExchange(self.exchangeBeforePointsP1),
                      player2_average_exchange=self.calculateAverageExchange(self.exchangeBeforePointsP2),
                      winner=winner,
                      loser=loser,
                      player1_score=player1.score, 
                      player2_score=player2.score)
        await match.asave()
    
    async def sendPlayerMove(self):
        await self.channel_layer.group_send(
            self.lobby_group_name, { 
                'type': 'pong.player_pos',
                'move': self.player.move,
                'name': self.player.name,
                'posY': self.player.posY
            })
        
    async def movePlayer(self):
        if self.player.checkCollisionBorder():
            self.player.move = 0
        self.player.posY += self.player.move

    def resetGame(self):
        self.player.score = 0
        self.opp.score = 0
        self.ball.reset()
        self.player.resetPaddlePos()
        self.opp.resetPaddlePos()
        self.player.is_ready = False
        self.opp.is_ready = False

                    
    async def pong_status(self, event):
        message = event["message"]
        name = event["name"]
        status = event["status"]   

        if status == "endGame":
            self.resetGame()
        await self.send(text_data=json.dumps({"type": 'status', 'status': status ,"message": message, "name": name}))
        if status == 'start':
            asyncio.create_task(self.gameLoop())

    async def pong_character_data(self, event): 
        if (self.player.name == event["name"]):
            self.opp.character = event["character"]
        if (self.player.name != event["name"]):
            await self.send(text_data=json.dumps({ "type": "character_data", "character": event["character"], "name": event["name"]}))
    
    async def pong_user_data(self, event):
        avatar = event["avatar"]
        username = event["username"]
        name = event["name"]
        if (self.player.name != event["name"]):
            await self.send(text_data=json.dumps({ "type": "user_info", "avatar": avatar, "username": username, "name": name}))

    async def pong_player_pos(self, event):
        move = event["move"]
        name = event["name"]
        posY = event["posY"]

        if  name == "player2":
            self.opp.move = move
            self.opp.posY = posY
        if name == "player1":
            await self.send(text_data=json.dumps({ "type": "player_pos", "move": move, "name": name, "posY": posY}))
            await self.send(text_data=json.dumps({ "type": "player_pos", "move": self.opp.move, "name": "player2", "posY": self.opp.posY}))

    async def pong_ball_data(self, event):
        posX = event["posX"]
        posY = event["posY"]
        dirX = event["dirX"]
        dirY = event["dirY"]

        self.ball.posX = posX
        self.ball.posY = posY
        self.ball.dirX = dirX
        self.ball.dirY = dirY

        await self.send(text_data=json.dumps({ "type": "ball_data", "posX": posX, "posY": posY, "dirX": dirX, "dirY": dirY}))

    async def pong_score(self, event):
        name = event["name"]
        score = event["score"]

        self.player.resetPaddlePos()
        await self.send(text_data=json.dumps({ "type": "score", "score": score, "name": name}))

    async def pong_ask_character(self, event):
        name = event["name"]

        await self.send(text_data=json.dumps({ "type": "ask_character", "name": name}))
    
    async def pong_ask_user(self, event):
        name = event["name"]

        await self.send(text_data=json.dumps({ "type": "ask_user", "name": name}))
    
    async def pong_user_info(self, event):
        avatar = event["user"].avatar
        username = event["user"].username
        name = event["name"]
        with open(avatar.path, "rb") as avatar:
            encoded_string = base64.b64encode(avatar.read()).decode('utf-8')
        if self.player.name == name:
            self.player.user = event["user"]
        else:
            self.opp.user = event["user"]

        await self.send(text_data=json.dumps({ "type": "user_info", "avatar": encoded_string, "username": username, "name": name}))
