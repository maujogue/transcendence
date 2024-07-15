import { logout } from "../../ApiCalls.js";
import { getUserData } from "../../User.js"
import { showAlert } from "../../Utils.js";
import { fillInbox, initUserRequests } from "./friendList.js";
import { fillFriendsList } from "./friendList.js";
import { hostname } from "../../Router.js";
import { checkIfWebsocketIsOpen } from "../../pong/handlerMessage.js";

let currentUser;
let wsFriends;

export async function friendsWebsocket() {
	wsFriends = new WebSocket(`wss://${hostname}:8000/ws/friends/`);
	wsFriends.onopen = async function () {
		currentUser = await getUserData('username');
		auth();
		getCurrentUserRequests();
		getFriendsList();
	}

	wsFriends.onmessage = (event) => {
		const data = JSON.parse(event.data);
		wsMessageRouter(data);
	};

	wsFriends.onclose = (event) => {
		logout()
	}
}

async function auth() {
	sendMessage('auth', {'username': currentUser});
}

async function getFriendsList() {
	sendMessage('get_friendslist', {'username': currentUser});
}

async function getCurrentUserRequests() {
	sendMessage('get_current_user_requests', {'user': currentUser, 'send': 'true'});
}

async function getUserRequests(username) {
	if (!checkUsername(username))
		return;
	sendMessage('get_user_requests', {'user': username, 'send': 'true'});
}

async function sendFriendRequest(username) {
	if (!checkUsername(username))
		return;
	sendMessage('friend_request', {'from_user': currentUser, 'to_user': username});
}

async function acceptFriendRequest(fromUser) {
	if (!checkUsername(fromUser))
		return;
	sendMessage('accept_request', {'from_user': fromUser, 'to_user': currentUser});
}

async function declineFriendRequest(fromUser) {
	if (!checkUsername(fromUser))
		return;
	sendMessage('decline_request', {'from_user': fromUser, 'to_user': currentUser});
}

async function removeFriend(toUser) {
	if (!checkUsername(toUser))
		return;
	sendMessage('remove_friend', {'from_user': currentUser, 'to_user': toUser});
}


async function sendMessage(type, payload) {
	if (!checkIfWebsocketIsOpen(wsFriends))
		return ;
	const message = JSON.stringify({type, ...payload });
	wsFriends.send(message);
}

async function wsMessageRouter(data) {
	const handlers = {
		'friend_request_to_user': (data) => {
			getCurrentUserRequests();
			showAlert(`You just receive a friend request from ${data.from_user} !`, true)
		},
		'friend_request_from_user': () => {},
		'user_himself': () => showAlert("You cannot send a friend request to yourself.", false),
		'user_do_not_exist': () => showAlert("This user does not exist.", false),
		'request_already_sent': () => showAlert(`You already sent a friend request to this user.`, false),
		'already_friends': (data) => showAlert(`You are already friends with ${data.to_user}.`, false),
		'refresh_friends': () => {
			getCurrentUserRequests();
			getFriendsList();
		},
		'friendslist': async (data) => await fillFriendsList(data),
		'get_current_user_requests': (data) => fillInbox(data),
		'get_user_requests': (data) => initUserRequests(data),
		'friend_accepted_from_user': (data) => showAlert(`${data.to_user} accepted your friend request !`, true),
	};
	const handler = handlers[data.type];
	if (handler && data) {
		handler.call(this, data);
	}
}

function closeWs () {
	if (wsFriends) {
		wsFriends.close();
	}
}

function checkUsername(username) {
	if (username && username != "") {
		return true;
	}
	return false;
}

export { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, closeWs, getUserRequests };