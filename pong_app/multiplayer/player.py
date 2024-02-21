class Player:
    posY = 0
    is_ready = False
    score = 0
    move = 0

    def __init__(self, name, color, room_id, posX):
        self.name = name
        self.color = color
        self.room_id = room_id
        self.posX = posX

    def resetPaddlePos(self):
        self.posY = 0

    
