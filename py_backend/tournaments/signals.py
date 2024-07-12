import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Tournament
from asgiref.sync import async_to_sync
from .blockchain import set_data_on_blockchain

# Configure logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=Tournament)
def set_signal_for_blockchain(sender, instance, **kwargs):
    if kwargs.get('created', False):
        return  # Skip if the instance is just created

    # Get the previous state of the instance from the database
    previous = Tournament.objects.get(pk=instance.pk)
    
    if not previous.finished and instance.finished:
        logger.info(f"Tournament {instance.pk} finished. Triggering blockchain function.")
        async_to_sync(set_data_on_blockchain)(instance)
    else:
        logger.info(f"Tournament {instance.pk} save ignored. No change in finished state.")
