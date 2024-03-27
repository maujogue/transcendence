from django.shortcuts import render
from django.http import JsonResponse

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods

from django.core.exceptions import ValidationError
from django.db import IntegrityError

from .models import Tournament

import json


@login_required
@require_http_methods(["POST"])
def create_tournament(request):
	try:
		data = json.loads(request.body.decode("utf-8"))
	except json.JSONDecodeError:
		return JsonResponse(data = {'errors': "Invalid JSON format"}, status = 406)
		
	name = data.get('name')
	max_players = data.get('max_players')
	is_private = data.get('is_private')
	password = data.get('password')

	if not name or not isinstance(max_players, int) or max_players not in range(2, 33):
		return JsonResponse({"errors": "Invalid tournament data"}, status = 400)

	try:
		tournament = Tournament.objects.create(
			name=name,
			max_players=max_players,
			is_private=is_private,
			password=password if is_private else None,
			host=request.user
		)
	except IntegrityError:
		return JsonResponse({"errors": "Tournament could not be created"}, status = 400)
	return JsonResponse({"message": "Tournament created successfully", "id": tournament.id}, status=201)
		
	# return JsonResponse({'status': 'success'}, status=200)
	# return JsonResponse({"error": "Invalid request"}, status=400)