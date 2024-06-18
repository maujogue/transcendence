import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import TensorBoard
from collections import deque
from tqdm import tqdm
import gymnasium as gym
import numpy as np
import os

import my_gym_env
import time
import random

DISCOUNT = 0.99
REPLAY_MEMORY_SIZE = 50_000  # How many last steps to keep for model training
MIN_REPLAY_MEMORY_SIZE = 1_000  # Minimum number of steps in a memory to start training
MINIBATCH_SIZE = 64  # How many steps (samples) to use for training
UPDATE_TARGET_EVERY = 5  # Terminal states (end of episodes)
MODEL_NAME = 'first_pong_model'
MIN_REWARD = -200  # For model save
MEMORY_FRACTION = 0.20

# Environment settings
EPISODES = 1_000

# Exploration settings
epsilon = 1  # not a constant, going to be decayed
EPSILON_DECAY = 0.99975
MIN_EPSILON = 0.001

#  Stats settings
AGGREGATE_STATS_EVERY = 15  # episodes
SHOW_PREVIEW = False

class ModifiedTensorBoard(TensorBoard):

    # Overriding init to set initial step and writer (we want one log file for all .fit() calls)
	def __init__(self, **kwargs):
		super().__init__(**kwargs)
		self.step = 1
		self.writer = tf.summary.create_file_writer(self.log_dir)

    # Overriding this method to stop creating default log writer
	# def set_model(self, model):
	# 	pass

    # Overrided, saves logs with our step number
    # (otherwise every .fit() will start writing from 0th step)
	def on_epoch_end(self, epoch, logs=None):
		self.update_stats(**logs)

    # Overrided
    # We train for one batch only, no need to save anything at epoch end
	# def on_batch_end(self, batch, logs=None):
	# 	pass

    # Overrided, so won't close writer
	# def on_train_end(self, _):
	# 	pass

	# Custom method for saving own metrics
	# Creates writer, writes custom metrics and closes writer
	def	update_stats(self, **stats):
		with self.writer.as_default():
			for key, value in stats.items():
				tf.summary.scalar(key, value, step=self.model.optimizer.iterations)
				self.writer.flush()

class DQNAgent:
	def __init__(self, model_name=None):
		#main model => gets trained every steps
		if model_name == None:
			self.model = self.create_model()
		else:
			self.model = tf.keras.models.load_model("models/" + model_name + ".keras")

		#target model => this is what we .predict against every step
		self.target_model = self.create_model()
		self.target_model.set_weights(self.model.get_weights())

		self.replay_memory = deque(maxlen=REPLAY_MEMORY_SIZE)
		self.tensorboard = ModifiedTensorBoard(log_dir=f"logs/{MODEL_NAME}-{int(time.time())}")
		self.target_update_counter = 0

	def _convert_to_np(self, state):
		return np.concatenate([
            state['agent1']['position'],
            state['agent1']['score'],
            state['agent2']['position'],
            state['agent2']['score'],
            state['ball']['position'],
            state['ball']['velocity']
        ]).astype(np.float32)
    
	def create_model(self):
		model = Sequential()
		model.add(Dense(24, input_shape=(10,), activation='relu'))
		model.add(Dense(24, activation='relu'))
		model.add(Dense(3, activation='linear'))
		model.compile(loss='mse', optimizer=Adam(learning_rate=0.001))
		return model

	def update_replay_memory(self, transition):
		transition = (self._convert_to_np(transition[0]), transition[1], transition[2], self._convert_to_np(transition[3]), transition[4])
		self.replay_memory.append(transition)

	def get_qs(self, state):
		state_np = self._convert_to_np(state)
		return self.model.predict(state_np.reshape(-1, *state_np.shape))[0]
    
	def train(self, terminal_state, step):
		if len(self.replay_memory) < MIN_REPLAY_MEMORY_SIZE:
			return

		minibatch = random.sample(self.replay_memory, MINIBATCH_SIZE)
            
		current_states = np.array([transition[0] for transition in minibatch])
		current_qs_list = self.model.predict(current_states)
            
		new_current_states = np.array([transition[3] for transition in minibatch])
		future_qs_list = self.target_model.predict(new_current_states)
            
		X = []
		y = []

		for index, (current_state, action, reward, new_current_state, done) in enumerate(minibatch):
			if not done:
				max_future_q = np.max(future_qs_list[index])
				new_q = reward + 0.99 * max_future_q
			else:
				new_q = reward

			current_qs = current_qs_list[index]
			current_qs[action] = new_q

			X.append(current_state)
			y.append(current_qs)
		
		self.model.fit(np.array(X), np.array(y), batch_size=MIN_REPLAY_MEMORY_SIZE, verbose=0, shuffle=False, callbacks=[self.tensorboard] if terminal_state else None)

		if terminal_state:
			self.target_update_counter += 1
		
		if self.target_update_counter > UPDATE_TARGET_EVERY:
			self.target_model.set_weights(self.model.get_weights())
			self.target_update_counter = 0

# For stats
ep_rewards_agent1 = [0]
ep_rewards_agent2 = [0]

# For more repetitive results
# random.seed(1)
# np.random.seed(1)
# tf.set_random_seed(1)

# Memory fraction, used mostly when trai8ning multiple agents
#gpu_options = tf.GPUOptions(per_process_gpu_memory_fraction=MEMORY_FRACTION)
#backend.set_session(tf.Session(config=tf.ConfigProto(gpu_options=gpu_options)))

# Create models folder
if not os.path.isdir('models'):
    os.makedirs('models')

env = gym.make("PongEnv-v0")
agent1 = DQNAgent("first_pong_model____10.00max____0.48avg__-10.00min__1718678390")
agent2 = DQNAgent("first_pong_model____10.00max___-0.48avg__-10.00min__1718678390")

# Iterate over episodes
for episode in tqdm(range(1, EPISODES + 1), ascii=True, unit='episodes'):

    # Update tensorboard step every episode
    agent1.tensorboard.step = episode
    agent2.tensorboard.step = episode

    # Restarting episode - reset episode reward and step number
    episode_reward_agent1 = 0
    episode_reward_agent2 = 0
    step = 1

    # Reset environment and get initial state
    current_state, info = env.reset()

    # Reset flag and start iterating until episode ends
    done = False
    while not done:

        # This part stays mostly the same, the change is to query a model for Q values
        if np.random.random() > epsilon:
            # Get action from Q table
            action1 = np.argmax(agent1.get_qs(current_state))
            action2 = np.argmax(agent2.get_qs(current_state))
        else:
            # Get random action
            action1 = np.random.randint(0, env.unwrapped.ACTION_SPACE_SIZE)
            action2 = np.random.randint(0, env.unwrapped.ACTION_SPACE_SIZE)

        action = [action1, action2]
        new_state, reward, done, trunc, info = env.step(action)

        # Transform new continous state to new discrete state and count reward
        episode_reward_agent1 += reward
        episode_reward_agent2 += (reward * -1)

        if SHOW_PREVIEW and not episode % AGGREGATE_STATS_EVERY:
            env.render()

        # Every step we update replay memory and train main network
        agent1.update_replay_memory((current_state, action, reward, new_state, done))
        agent1.train(done, step)
        agent2.update_replay_memory((current_state, action, reward * -1, new_state, done))
        agent2.train(done, step)

        current_state = new_state
        step += 1

    # Append episode reward to a list and log stats (every given number of episodes)
    ep_rewards_agent1.append(episode_reward_agent1)
    if not episode % AGGREGATE_STATS_EVERY or episode == 1:
        average_reward = sum(ep_rewards_agent1[-AGGREGATE_STATS_EVERY:])/len(ep_rewards_agent1[-AGGREGATE_STATS_EVERY:])
        min_reward = min(ep_rewards_agent1[-AGGREGATE_STATS_EVERY:])
        max_reward = max(ep_rewards_agent1[-AGGREGATE_STATS_EVERY:])
        agent1.tensorboard.update_stats(reward_avg=average_reward, reward_min=min_reward, reward_max=max_reward, epsilon=epsilon)
        # Save model, but only when min reward is greater or equal a set value
        if min_reward >= MIN_REWARD:
            agent1.model.save(f'models/{MODEL_NAME}__{max_reward:_>7.2f}max_{average_reward:_>7.2f}avg_{min_reward:_>7.2f}min__{int(time.time())}.keras')
    
    ep_rewards_agent2.append(episode_reward_agent2)
    if not episode % AGGREGATE_STATS_EVERY or episode == 1:
        average_reward = sum(ep_rewards_agent2[-AGGREGATE_STATS_EVERY:])/len(ep_rewards_agent2[-AGGREGATE_STATS_EVERY:])
        min_reward = min(ep_rewards_agent2[-AGGREGATE_STATS_EVERY:])
        max_reward = max(ep_rewards_agent2[-AGGREGATE_STATS_EVERY:])
        agent2.tensorboard.update_stats(reward_avg=average_reward, reward_min=min_reward, reward_max=max_reward, epsilon=epsilon)
        # Save model, but only when min reward is greater or equal a set value
        if min_reward >= MIN_REWARD:
            agent2.model.save(f'models/{MODEL_NAME}__{max_reward:_>7.2f}max_{average_reward:_>7.2f}avg_{min_reward:_>7.2f}min__{int(time.time())}.keras')

    # Decay epsilon
    if epsilon > MIN_EPSILON:
        epsilon *= EPSILON_DECAY
        epsilon = max(MIN_EPSILON, epsilon)
