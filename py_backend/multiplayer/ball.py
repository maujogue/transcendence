
class Ball:
    posX = 0
    posZ = 0
    dirX = 0.055
    dirZ = 0

    def translate(self):
        self.posX += self.dirX
        self.posZ += self.dirZ

    def checkCollisionBorder(self):
        if self.dirZ > 0 and self.posZ >= 6.25:
            return True
        if self.dirZ < 0 and self.posZ <= -6.25:
            return True
        # if (self.posY <= -0.9 or self.posY >= 0.9):
        #     return True
        return False
    
    def collisionBorder(self):
        if self.dirX > 0:
            self.dirX += 0.01
        else:
            self.dirX -= 0.01 
        self.dirZ *= -1

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
            self.dirX += 0.01
        elif self.dirX < 0 and self.dirX > -0.55:
            self.dirX -= 0.01
        center = player.posZ
        self.dirZ = 0.1 * (self.posZ - center)
    
    def checkIfScored(self, player):
        if player.name == "player1" and self.posX <= -10:
            return True
        if player.name == "player2" and self.posX >= 10:
            return True
        return False
    
    def reset(self):
        self.posX = 0
        self.posZ = 0
        self.dirX = 0.055
        self.dirZ = 0

