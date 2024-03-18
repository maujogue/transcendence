class Player:
    posY = 0
    is_ready = False
    score = 0
    move = 0

    def __init__(self, name, character, lobby_id, posX):
        self.name = name
        self.character = character
        self.lobby_id = lobby_id
        self.posX = posX

    def resetPaddlePos(self):
        self.posY = 0

    def checkCollisionBorder(self): 
        if self.move > 0 and self.posY + 1 >= 6.25:
            return True
        elif self.move < 0 and self.posY - 1 <= -6.25:
            return True
        else:
            return False

    def movePlayer(self, move):
        if self.checkCollisionBorder() == False:
            self.posY += move

    
