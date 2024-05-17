
class Ball:
    posX = 0
    posY = 0
    posY = 0
    dirX = 0.055
    dirY = 0

    def translate(self):
        self.posX += self.dirX
        self.posY += self.dirY

    def checkCollisionBorder(self):
        if self.dirY > 0 and self.posY >= 6.25:
            return True
        if self.dirY < 0 and self.posY <= -6.25:
            return True
        # if (self.posY <= -0.9 or self.posY >= 0.9):
        #     return True
        return False
    
    def collisionBorder(self):
        if self.dirX > 0:
            self.dirY += 0.02
        else:
            self.dirY -= 0.02 
        self.dirY *= -1

    def checkCollisionPaddle(self, player):
        badDir = player.posX * self.dirX < 0
        if badDir == True: 
            return False
        isOnPaddle = False
        if player.name == "player2" and self.posX >= player.posX and self.posX <= player.posX + 0.5:
            isOnPaddle = True
        if player.name == "player1" and self.posX <= player.posX and self.posX >= player.posX - 0.5:
            isOnPaddle = True
        if (isOnPaddle and self.posY >= player.posY - 1 and self.posY <= player.posY + 1):
            return True
        return False
    
    def collisionPaddle(self, player):
        self.dirX *= -1
        if self.dirX > 0 and self.dirX < 0.55:
            self.dirX += 0.009
        elif self.dirX < 0 and self.dirX > -0.55:
            self.dirX -= 0.009
        center = player.posY
        self.dirY = 0.08 * (self.posY - center)
    
    def checkIfScored(self, player):
        if player.name == "player1" and self.posX <= -12:
            return True
        if player.name == "player2" and self.posX >= 12:
            return True
        return False
    
    def reset(self):
        self.posX = 0
        self.posY = 0
        self.dirX = 0.055
        self.dirY = 0

