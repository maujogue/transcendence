import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from .models import Room
from multiplayer.ball import Ball
from multiplayer.player import Player

class PongConsumer(AsyncWebsocketConsumer):

    async def send_player_data(self):
        await self.send(text_data=json.dumps({
            'type': 'player_data',
            'name': self.player.name,
            'color': self.player.color
        }))

    
    async def create_room(self):
        try: 
            self.room = await Room.objects.aget(code=self.room_name)
        except Room.DoesNotExist:
            self.room = Room(code=self.room_name)
            await self.room.asave()
    
    async def create_player(self):
        name = 'player1' if self.room.connected_user == 1 else 'player2'
        oppName = 'player2' if name == 'player1' else 'player1'
        posX = -9.50 if name == 'player1' else 9.50
        oppPosX = 9.50 if name == 'player1' else -9.50
        self.player = Player(name, color='rgb(255, 255, 255)', room_id=self.room.code, posX=posX)
        self.opp = Player(oppName, color='rgb(255, 255, 255)', room_id=self.room.code, posX=oppPosX)
    
    async def sendColor(self, text_data_json):
        color = text_data_json["color"]
        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'pong.data', 
                'color': color, 
                'sender': self.channel_name, 
                'name': self.player.name
                }
        )

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['lobby']
        self.is_connected = False
        self.is_ready = False
        
        print('roomName:', self.room_name)
        await self.create_room()
        self.room = await Room.objects.aget(code=self.room_name)
        print('connected_user:', self.room.connected_user)
        if self.room.connected_user >= 2:
            return await self.close()
        self.ball = Ball()
        self.room.connected_user += 1
        await self.create_player()
        await self.room.asave(update_fields=['connected_user'])
        self.room_group_name = 'room_%s' % self.room_name
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        print('connected')
        print(self.room.connected_user)
        self.is_connected = True
        await self.accept()
        await self.send_player_data()
        await self.channel_layer.group_send(
            self.room_group_name, { 'type': 'pong.status', 'message': 'connected', 'name': self.player.name}
        )

    async def disconnect(self, close_code):
        self.room = await Room.objects.aget(code=self.room_name)
        if self.is_connected == False:
            return
        
        print(self.player.name, "is disconnected")
        await self.room.disconnectUser(self.player)
        await self.channel_layer.group_send(
            self.room_group_name, { 'type': 'pong.status', 'message': 'disconnected', 'name': self.player.name}
        )
        if (self.room.game_started == True):
            await self.room.stopGame()
            await self.channel_layer.group_send(
                self.room_group_name, { 'type': 'pong.status', 'message': 'stopGame', 'name': self.player.name}
            )
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    
    async def startGame(self):
        await self.channel_layer.group_send(
        self.room_group_name, { 
            'type': 'pong.status', 
            'message': 'start', 
            'name': self.player.name
            }
        )
        await self.channel_layer.group_send(
        self.room_group_name, {
                'type': 'pong.ball_data',
                'posX': self.ball.posX,
                'posY': self.ball.posY,
                'dirX': self.ball.dirX,
                'dirY': self.ball.dirY
            }
        )
        await self.room.startGame()

    async def movePlayer(self, data):
        move = data.get("move")

        if move != 0 and move != 1 and move != -1:
            return
        if move != 0:
            move = 0.095 if move == 1 else -0.095
        if data.get("posY") != None:
            self.player.posY = data.get("posY")
        self.player.move = move
        await self.channel_layer.group_send(
        self.room_group_name, { 
            'type': 'pong.player_pos',
            'name': self.player.name, 
            'move': move,
            'posY': self.player.posY
        })

    async def sendScore(self):
        self.opp.score += 1

        await self.channel_layer.group_send (
            self.room_group_name, { 'type': 'pong.score', 'score': self.opp.score, 'name': self.opp.name}
        )
        if (self.player.score == 2 or self.opp.score == 2):
            print('endGame')
            await self.room.stopGame()
            await self.channel_layer.group_send(
                self.room_group_name, { 'type': 'pong.status', 'message': 'endGame', 'name': self.player.name}
            )
    
    async def sendBallData(self):
        await self.channel_layer.group_send(
            self.room_group_name, { 
                'type': 'pong.ball_data', 
                'posX': self.ball.posX, 
                'posY': self.ball.posY, 
                'dirX': self.ball.dirX, 
                'dirY': self.ball.dirY
            }
        )
    
    async def isScored(self):
        await self.sendScore()
        self.ball.reset()
        await self.sendBallData()
        return

    async def checkAllCollisions(self):
        if self.ball.checkCollisionBorder():
            self.ball.collisionBorder()
            await self.sendBallData()
        elif self.ball.checkCollisionPaddle(self.player):
            self.ball.collisionPaddle(self.player)
            await self.sendBallData()
        elif self.ball.checkCollisionPaddle(self.opp):
            self.ball.collisionPaddle(self.opp)
            await self.sendBallData()

    async def gameLoop(self):
        if self.player.move != 0:
            self.player.posY += self.player.move
        
        await self.checkAllCollisions()
        if self.ball.checkIfScored(self.player) or self.ball.checkIfScored(self.opp):
            await self.isScored()
            return
        self.ball.translate()

    async def receive(self, text_data):
        self.room = await Room.objects.aget(code=self.room_name)
        text_data_json = json.loads(text_data)
        
        if text_data_json.get("ready") != None:
            await self.room.setPlayerReady(text_data_json.get("ready"), self.player)
        if text_data_json.get("color") != None and self.room.game_started == False:
            self.player.color = text_data_json.get("color")
            await self.sendColor(text_data_json)
        if (self.room.player_ready == 2 and self.room.game_started == False):
            await self.startGame()
        if (self.room.game_started == True):
            if text_data_json.get("type") == "player_pos":
                await self.movePlayer(text_data_json)
            if (text_data_json.get("type") == "frame"):
                await self.gameLoop()
                    
    async def pong_status(self, event):
        message = event["message"]
        name = event["name"]

        await self.send(text_data=json.dumps({"type": "status", "message": message, "name": name}))

    async def pong_data(self, event): 
        color = event["color"]
        name = event["name"]

        if self.channel_name != event["sender"]:
            await self.send(text_data=json.dumps({ "color_data": color, "name": name}))

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
