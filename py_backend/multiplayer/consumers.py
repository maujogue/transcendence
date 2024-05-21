import json
import base64
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


    async def connect(self):
        print('connect')
        self.is_connected = False
        self.is_ready = False
        
        self.exchangeBeforePointsP1 = []
        self.exchangeBeforePointsP2 = []
        self.countExchange = 0
        self.lobby = await self.join_lobby()
        print('lobby ID:', self.lobby.uuid, 'connected_user:', self.lobby.connected_user)
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
        print('connected')
        print(self.lobby.connected_user)
        self.is_connected = True
        await self.accept()
        print('connection accepted')
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

    async def receive(self, text_data):
        self.lobby = await Lobby.objects.aget(uuid=self.lobby_name)
        text_data_json = json.loads(text_data)
        
        if text_data_json.get("type") == 'auth':
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
        if text_data_json.get("ready") != None:
            await self.lobby.setPlayerReady(text_data_json.get("ready"), self.player)
        if text_data_json.get("character") != None:
            self.player.character = text_data_json.get("character")
            await self.channel_layer.group_send(
                self.lobby_group_name, {
                    'type': 'pong.character_data',
                    'character': self.player.character,
                    'sender': self.channel_name,
                    'name': self.player.name
                }
            )
        if self.lobby.player_ready == 2 and self.lobby.game_started == False:
            await self.startGame()
        if text_data_json.get("type") == "user_info":
            await self.channel_layer.group_send(
                self.lobby_group_name, { 'type': 'pong.user_data', 'username': text_data_json.get('username'), 'avatar': text_data_json.get('avatar'), 'name': text_data_json.get('name')}
            )
        if self.lobby.game_started == True:
            if text_data_json.get("type") == "player_pos":
                await self.movePlayer(text_data_json)
            if text_data_json.get("type") == "frame" and self.lobby.game_started == True:
                await self.gameLoop()

    async def disconnect(self, close_code):
        self.lobby = await Lobby.objects.aget(uuid=self.lobby_name)
        if self.is_connected == False:
            return
        
        print(self.player.name, "is disconnected")
        print('player_connected:', self.lobby.connected_user)
        await self.lobby.disconnectUser(self.player)
        await self.channel_layer.group_send(
            self.lobby_group_name, { 'type': 'pong.status', 'message': 'disconnected', 'name': self.player.name}
        )
        if (self.lobby.game_started == True):
            await self.lobby.stopGame()
            await self.channel_layer.group_send(
                self.lobby_group_name, { 'type': 'pong.status', 'message': 'stopGame', 'name': self.player.name}
            )
        await self.channel_layer.group_discard(
            self.lobby_group_name,
            self.channel_name
        )
        if self.lobby.connected_user == 0:
            await self.lobby.adelete()
            await self.channel_layer.close()
    
    
    async def startGame(self):
        await self.channel_layer.group_send(
        self.lobby_group_name, { 
            'type': 'pong.status', 
            'message': 'start', 
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

    async def movePlayer(self, data):
        move = data.get("move")

        if move != 0 and move != 1 and move != -1:
            return
        if move != 0:
            move = 0.095 if move == 1 else -0.095
        if self.player.move == move:
            return
        self.player.move = move
        if self.player.checkCollisionBorder() == True:
            self.player.move = 0
        await self.channel_layer.group_send(
        self.lobby_group_name, { 
            'type': 'pong.player_pos',
            'name': self.player.name, 
            'move': move,
            'posY': self.player.posY
        })

    async def sendScore(self):
        await self.channel_layer.group_send (
            self.lobby_group_name, { 'type': 'pong.score', 'score': self.opp.score, 'name': self.opp.name}
        )
    
    async def sendBallData(self):
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
        if self.ball.checkIfScored(self.player):
            self.player.score += 1
            self.exchangeBeforePointsP1.append(self.countExchange)
        if self.ball.checkIfScored(self.opp):
            self.exchangeBeforePointsP2.append(self.countExchange)
            self.opp.score += 1
        await self.sendScore()
        self.ball.reset()
        await self.sendBallData()

    async def checkAllCollisions(self):
        if self.ball.checkCollisionBorder():
            self.ball.collisionBorder()
            await self.sendBallData()
        elif self.ball.checkCollisionPaddle(self.player):
            self.countExchange += 1
            self.ball.collisionPaddle(self.player)
            await self.sendBallData()
        elif self.ball.checkCollisionPaddle(self.opp):
            self.countExchange += 1
            self.ball.collisionPaddle(self.opp)
            await self.sendBallData()

    async def setGameOver(self):
        await self.lobby.stopGame()
        if self.player.name == 'player1':
            await self.createHistoryMatch()
        await self.channel_layer.group_send(
            self.lobby_group_name, { 'type': 'pong.status', 'message': 'endGame', 'name': self.player.name}
        )
    
    async def createHistoryMatch(self):
        player1 = self.player if self.player.name == 'player1' else self.opp
        player2 = self.player if self.player.name == 'player2' else self.opp
        winner = player1.user.username if player1.score > player2.score else player2.user.username
        loser = player1.user.username if player1.score < player2.score else player2.user.username
        match = Match(player1=player1.user.username, 
                      player2=player2.user.username, 
                      player1_average_exchange=sum(self.exchangeBeforePointsP1) / len(self.exchangeBeforePointsP1),
                      player2_average_exchange=sum(self.exchangeBeforePointsP2) / len(self.exchangeBeforePointsP2),
                      winner=winner,
                      loser=loser,
                      player1_score=player1.score, 
                      player2_score=player2.score)
        await match.asave()
        


    async def gameLoop(self):
        if self.player.checkCollisionBorder() == True:
            self.player.move = 0
            await self.channel_layer.group_send(
            self.lobby_group_name, { 
                'type': 'pong.player_pos',
                'name': self.player.name, 
                'move': self.player.move,
                'posY': self.player.posY
            })

        self.player.posY += self.player.move
        
        await self.checkAllCollisions()
        if self.ball.checkIfScored(self.player) or self.ball.checkIfScored(self.opp):
            await self.isScored()
        if (self.player.score == 5 or self.opp.score == 5):
            await self.setGameOver()
        self.ball.translate()

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

        if message == "endGame":
            self.resetGame()
        await self.send(text_data=json.dumps({"type": 'status', "message": message, "name": name}))

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

        if self.opp.name == name:
            self.opp.move = move
            self.opp.posY = posY
        await self.send(text_data=json.dumps({ "type": "player_pos", "move": move, "name": name, "posY": posY}))

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
        if self.player.name == name:
            self.player.score = score
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
