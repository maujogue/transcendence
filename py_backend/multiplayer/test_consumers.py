from django.test import TestCase
from channels.testing import WebsocketCommunicator
from multiplayer.consumers import PongConsumer
from users.models import CustomUser
from multiplayer.models import Lobby

class PongConsumerTestCase(TestCase):
    async def test_send_player_data(self):
        # Create a test lobby and player
        lobby = Lobby.objects.create()
        player = CustomUser.objects.create(username='player1')
        
        # Create a websocket communicator
        communicator = WebsocketCommunicator(PongConsumer.as_asgi(), "/ws/pong/")
        connected, _ = await communicator.connect()
        
        # Set the player and lobby in the consumer
        consumer = PongConsumer()
        consumer.player = player
        consumer.lobby = lobby
        
        # Call the send_player_data method
        await consumer.send_player_data()
        
        # Receive the message from the consumer
        response = await communicator.receive_json_from()
        
        # Check if the message is correct
        self.assertEqual(response['type'], 'player_data')
        self.assertEqual(response['name'], player.name)
        self.assertEqual(response['character'], player.character)
        
        # Disconnect the communicator
        await communicator.disconnect()
    
    async def test_join_lobby(self):
        # Create a test lobby and player
        lobby = Lobby.objects.create(connected_user=1)
        player = CustomUser.objects.create(username='player1')
        
        # Create a websocket communicator
        communicator = WebsocketCommunicator(PongConsumer.as_asgi(), "/ws/pong/")
        connected, _ = await communicator.connect()
        
        # Set the player and lobby in the consumer
        consumer = PongConsumer()
        consumer.player = player
        
        # Call the join_lobby method
        result = await consumer.join_lobby()
        
        # Check if the lobby is found or created
        if lobby.connected_user == 1:
            self.assertEqual(result, lobby)
        else:
            self.assertIsInstance(result, Lobby)
        
        # Disconnect the communicator
        await communicator.disconnect()
    
    # Add more test cases for other methods...