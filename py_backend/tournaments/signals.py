from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Tournament
import asyncio
from .blockchain import set_data_on_blockchain

@receiver(post_save, sender=Tournament)
def set_signal_for_blockchain(sender, instance, **kwargs):
    if instance.finished:
        # Ensure the async function is run in an event loop
        asyncio.run(set_data_on_blockchain(instance))
