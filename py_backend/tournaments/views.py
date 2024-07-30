from django.http import JsonResponse
import random
import string

from django.contrib.auth import get_user_model
from users.decorators import custom_login_required as login_required
from django.views.decorators.http import require_http_methods
from users.utils import decode_json_body

from django.core.exceptions import ValidationError
from django.db import IntegrityError

from .models import Tournament

import json

CustomUser = get_user_model()

@login_required
@require_http_methods(["POST"])
def create_tournament(request):
	data = decode_json_body(request)
	if isinstance(data, JsonResponse):
		return data
	
	name = data.get('name')
	max_players = data.get('max_players')
	if not name or not max_players:
		return JsonResponse({"errors": "missing_name_or_max_players"},
				status=400)
	try:
		max_players = int(max_players)
	except:
		return JsonResponse({"errors": "invalid_number_of_players"},
					status=400)
	try:
		if not name:
			return JsonResponse({"errors": "tournament_name_required"},
						status=400)
		
		if len(name) > 15:
			return JsonResponse({"errors": "tournament_name_length"},
						status=400)
		
		if not name.isalnum():
			return JsonResponse({"errors": "tournament_name_alpha_num"},
						status=400)

		if not max_players in range(2, 9):
			return JsonResponse({"errors": "invalid_number_of_players"}, status=400)
	except:
		return JsonResponse({"errors": "unexe"}, status=400)

	try:
		tournament = Tournament.objects.create(
			name=name,
			max_players=max_players,
		)
		tournament.participants.add(request.user)
	except IntegrityError as e:
		if 'unique constraint' in str(e).lower():
			return JsonResponse({"errors": "tournament_name_taken"},
					status=400)
		return JsonResponse({"errors": "tournament_could_not_create"},
					status=400)

	tournamentJSON = {
		"id": tournament.id,
		"name": tournament.name,
		"max_players": tournament.max_players,
		"participants": [p.tournament_username for p in tournament.participants.all()],

	}
	return JsonResponse({"message": "tournament_create_success", "tournament": tournamentJSON},
					status=201)

@require_http_methods(["GET"])
def list_tournaments(request):
	try:
		tournaments = Tournament.objects.all().filter(started=False)
		tournaments = [{"id": t.id, "name": t.name, "max_players": t.max_players,
						"participants": [p.tournament_username for p in t.participants.all()]}
						for t in tournaments]
		return JsonResponse({"tournaments": tournaments},
						status=200)
	except:
		return JsonResponse({"errors": "tournament_list_failure"}, status=400)

@require_http_methods(["GET"])
def list_participants(request, tournament_id):
	try:
		tournament = Tournament.objects.get(pk=tournament_id)
	except Tournament.DoesNotExist:
		return JsonResponse({"errors": "tournament_not_found"},
					status=404)
	try:
		participants = [p.tournament_username for p in tournament.participants.all()]
		return JsonResponse({"participants": participants},
						status=200)
	except:
		return JsonResponse({"errors": "tournament_list_participants_failure"}, status=400)
	
@login_required
@require_http_methods(["POST"])
def join_tournament(request, tournament_id):
	try:
		tournament = Tournament.objects.get(pk=tournament_id)
	except Tournament.DoesNotExist:
		return JsonResponse({"errors": "tournament_not_found"},
					status=404)

	try:
		if tournament.participants.filter(pk=request.user.pk).exists():
			return JsonResponse({"errors": "user_already_in_tournament"},
						status=400)
		if tournament.participants.count() >= tournament.max_players:
			return JsonResponse({"errors": "tournament_full"},
						status=400)

		tournament.participants.add(request.user)

		return JsonResponse({"message": "tournament_joined_success", "id": tournament.id},
						status=200)
	except:
		return JsonResponse({"errors": "tournament_joined_failure"}, status=400)

@login_required
@require_http_methods(["POST"])
def quit_tournament(request, tournament_id):
	try:
		tournament = Tournament.objects.get(pk=tournament_id)
	except Tournament.DoesNotExist:
		return JsonResponse({"errors": "tournament_not_found"},
					status=404)

	try:
		if not tournament.participants.filter(pk=request.user.pk).exists():
			return JsonResponse({"errors": "user_not_in_tournament", "id": tournament.id},
						status=400)

		tournament.participants.remove(request.user)
		if tournament.participants.count() == 0:
			tournament.delete()
			return JsonResponse({"message": "quit_delete_tournament_success", "id": tournament.id},
						status=200)
		return JsonResponse({"message": "quit_tournament_success", "id": tournament.id},
						status=200)
	except:
		return JsonResponse({"errors": "tournament_quit_failure"}, status=400)

@login_required
@require_http_methods(["DELETE"])
def delete_tournament(request, tournament_id):
	try:
		tournament = Tournament.objects.get(pk=tournament_id)
	except Tournament.DoesNotExist:
		return JsonResponse({"errors": "tournament_not_found"},
					status=404)
	tournament.delete()
	return JsonResponse({"message": "delete_tournament_success"},
					status=200)

@login_required
@require_http_methods(["GET"])
def check_if_tournament_joined(request, username):
	try:
		user = CustomUser.objects.get(username=username)
	except CustomUser.DoesNotExist:
		return JsonResponse({"errors": "user_not_found_message"},
					status=404)
	
	try:
		tournaments = Tournament.objects.filter(participants=user, finished=False)
		if not tournaments:
			return JsonResponse({"message": "user_not_in_any_tournament", "joined": False},
						status=200)
		for tournament in tournaments:
			if not tournament.check_if_player_is_disqualified(user.tournament_username):
				tournamentJSON = {"id": tournament.id, "name": tournament.name, "max_players": tournament.max_players,
								"participants": [p.username for p in tournament.participants.all()]}
				return JsonResponse({"message": "User has joined a tournament.", "tournament": tournamentJSON, "joined": True},
							status=200)
		return JsonResponse({"message": "user_in_a_tournament", "joined": False}, status=200)
	except:
		return JsonResponse({"errors": "tournament_could_not_create"}, status=400)


@require_http_methods(["GET"])
def return_all_user_tournaments(request, username):
	try:
		user = CustomUser.objects.get(username=username)
	except CustomUser.DoesNotExist:
		return JsonResponse({"errors": "user_not_found_message"},
					status=404)
	try:
		tournaments = Tournament.objects.filter(participants=user, finished=True)
		if not tournaments:
			return JsonResponse({"message": "user_not_in_any_tournament", "joined": False},
						status=200)
		
		tournaments_data = [{
				"id": tournament.id,
				"name": tournament.name,
				"max_players": tournament.max_players,
				"participants": [participant.username for participant in tournament.participants.all()],
				"finished": tournament.finished
			}
			for tournament in tournaments
		]
		return JsonResponse({"tournaments": tournaments_data},
						status=200)
	except:
		return JsonResponse({"errors": "tournament_could_not_create"}, status=400)

@require_http_methods(["GET"])
def return_receipt_address(request, tournament_id):
	try:
		tournament = Tournament.objects.get(pk=tournament_id)
	except Tournament.DoesNotExist:
		return JsonResponse({"errors": "Tournament not found."},
					status=404)
	return JsonResponse({"receipt_address": tournament.receipt_address},
					status=200)
