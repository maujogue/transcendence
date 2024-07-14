from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Tournament
from .blockchain import set_data_on_blockchain

# import logging
import threading

# logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Tournament)
def cache_tournament_state(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_finished_state = None
    else:
        previous = Tournament.objects.filter(pk=instance.pk).first()
        instance._previous_finished_state = previous.finished if previous else None

def get_receipt_address(instance):
    transaction_receipt = set_data_on_blockchain(instance)
    if transaction_receipt:
        instance.receipt_address = transaction_receipt['transactionHash'].hex()
        instance.save(update_fields=['receipt_address'])

@receiver(post_save, sender=Tournament)
def set_signal_for_blockchain(sender, instance, **kwargs):
    if kwargs.get('created', False):
        # logger.info(f"Tournament {instance.pk} created. Ignoring signal.")
        return
    previous_finished_state = getattr(instance, '_previous_finished_state', None)

    if previous_finished_state is None or (not previous_finished_state and instance.finished):
        # logger.info(f"Tournament {instance.pk} finished. Triggering blockchain function.")
        threading.Thread(target=get_receipt_address, args=(instance,)).start()
    # else:
    #     logger.info(f"Tournament {instance.pk} save ignored. No change in finished state.")
