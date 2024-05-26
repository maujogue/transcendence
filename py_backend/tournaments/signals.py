from django.dispatch import Signal

tournament_started = Signal(providing_args=["tournament"])