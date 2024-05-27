from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import numpy as np
import json
import pickle

try:
	with open('py_backend/AI/agent.pkl', 'rb') as file:
		agent = pickle.load(file)
except FileNotFoundError: 
	agent = None
	print('No agent found.')

@csrf_exempt
def trainAI(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		state = np.array(data['state'])
		action = data['action']
		reward = data['reward']
		next_state = np.array(data['next_state'])
		done = data['done']

		state = np.reshape(state, [1, state.shape[0]])
		next_state = np.reshape(next_state, [1, next_state.shape[0]])

		agent.remember(state, action, reward, next_state, done)

		if len(agent.memory) > 32:
			agent.replay(32)

		return JsonResponse({'status': 'training is successfull'})

@csrf_exempt
def act(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		state = np.array(data['state'])
		state = np.reshape(state, [1, state.shape[0]])
		action = agent.act(state)
		return JsonResponse({'action': int(action)})