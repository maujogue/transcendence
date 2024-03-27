from django.shortcuts import render
from .models import Tournament
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods

@login_required
@require_http_methods(["POST"])
def create_tournament(request):
    print(f"name: {request.name}")
    print(f"password: {request.password}")
    print(f"is_private: {request.is_private}")
    print(f"max players: {request.max_players}")
    print(f"host name: {request.host_name}")
    return JsonResponse("Tournament data printed to console.")