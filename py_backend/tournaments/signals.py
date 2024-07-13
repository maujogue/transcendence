import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Tournament
from asgiref.sync import sync_to_async
from .blockchain import set_data_on_blockchain

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Tournament)
def cache_tournament_state(sender, instance, **kwargs):
    if not instance.pk:
        # New instance, nothing to compare
        instance._previous_finished_state = None
    else:
        # Fetch the existing instance from the database
        previous = Tournament.objects.filter(pk=instance.pk).first()
        if previous:
            instance._previous_finished_state = previous.finished
        else:
            instance._previous_finished_state = None

@receiver(post_save, sender=Tournament)
def set_signal_for_blockchain(sender, instance, **kwargs):
    if kwargs.get('created', False):
        logger.info(f"Tournament {instance.pk} created. Ignoring signal.")
        return  # Skip if the instance is just created

    previous_finished_state = getattr(instance, '_previous_finished_state', None)
    logger.info(f"Tournament {instance.pk} previous finished state: {previous_finished_state}")
    logger.info(f"Tournament {instance.pk} current finished state: {instance.finished}")

    if previous_finished_state is None or (not previous_finished_state and instance.finished):
        logger.info(f"Tournament {instance.pk} finished. Triggering blockchain function.")
        set_data_on_blockchain(instance)
    else:
        logger.info(f"Tournament {instance.pk} save ignored. No change in finished state.")
