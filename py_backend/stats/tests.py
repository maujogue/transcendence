from django.test import TestCase
from users.models import CustomUser
from stats.models import Match
from django.test import TestCase, Client
from django.urls import reverse

# Create your tests here.
class UserWinrateViewTest(TestCase):
    def setUp(self):
        self.userWithoutMatch = CustomUser.objects.create_user(username="userWithoutMatch", email="test2@test2.com", password="test")
        self.user1 = CustomUser.objects.create_user(username="user1", email="test@test.com", password="test")
        self.user2 = CustomUser.objects.create_user(username="user2", email="test2@test.com", password="test")
        self.match1 = Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        self.match2 = Match.objects.create(player1=self.user2.id, player2=self.user1.id, winner=self.user2.id, loser=self.user1.id, player1_score=3, player2_score=1)

    def test_get_user_winrate(self):
        client = Client()

        response = client.get(reverse('winrate', kwargs={'user': self.user1.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('winrate', response.json())

    def test_get_user_without_match(self):
        client = Client()

        response = client.get(reverse('matchs', kwargs={'user': self.userWithoutMatch.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('matchs', response.json())

    def test_get_user_winrate_user_not_found(self):
        client = Client()

        response = client.get(reverse('winrate', kwargs={'user': 'non_existing_user'}))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {'error': 'User not found'})
    
class MatchsTest(TestCase):
    def setUp(self):
        self.userWithoutMatch = CustomUser.objects.create_user(username="userWithoutMatch", email="test2@test2.com", password="test")
        self.user1 = CustomUser.objects.create_user(username="user1", email="test@test.com", password="test")
        self.user2 = CustomUser.objects.create_user(username="user2", email="test2@test.com", password="test")
        self.match = Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        self.match1 = Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        self.match2 = Match.objects.create(player1=self.user2.id, player2=self.user1.id, winner=self.user2.id, loser=self.user1.id, player1_score=3, player2_score=1)

    def test_get_user_matchs(self):
        client = Client()

        response = client.get(reverse('matchs', kwargs={'user': self.user1.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('matchs', response.json())

    def test_get_user_win_matchs(self):
        client = Client()

        response = client.get(reverse('win_matchs', kwargs={'user': self.user1.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('matchs', response.json())
    
    def test_get_user_win_streak(self):
        client = Client()

        Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        Match.objects.create(player1=self.user1.id, player2=self.user2.id, winner=self.user1.id, loser=self.user2.id, player1_score=3, player2_score=1)
        response = client.get(reverse('win_streak', kwargs={'user': self.user1.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('win_streak', response.json())

    def test_get_user_loose_matchs(self):
        client = Client()

        response = client.get(reverse('loose_matchs', kwargs={'user': self.user1.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('matchs', response.json())

    def test_get_user_without_match(self):
        client = Client()

        response = client.get(reverse('matchs', kwargs={'user': self.userWithoutMatch.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('matchs', response.json())

    def test_user_not_found(self):
        client = Client()

        response = client.get(reverse('matchs', kwargs={'user': 'non_existing_user'}))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {'error': 'User not found'})
    
    def test_get_all_matchs(self):
        client = Client()

        response = client.get(reverse('all_matchs'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('matchs', response.json())

    def test_get_average_exchange_before_goal(self):
        client = Client()

        response = client.get(reverse('average_exchange_before_goal', kwargs={'user': self.user1.username}))
        self.assertEqual(response.status_code, 200)
        self.assertIn('average_exchange_before_goal', response.json())
