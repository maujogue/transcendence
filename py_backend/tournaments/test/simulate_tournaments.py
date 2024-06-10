from users.models import CustomUser

async def create_fake_participants(tournament, num_participants):
    for i in range(num_participants):
        user = CustomUser.objects.create(
            username=f"fake_player_{i}",
            tournament_username=f"fake_player_{i}",
            email=f"fake_player_{i}@example.com",
            password="password123"
        )
        tournament.participants.add(user)
    await tournament.save()

