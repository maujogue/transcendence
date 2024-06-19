import { getUserData } from "../../User.js"
import { showAlert } from "../../Utils.js";
import { fillInbox } from "./friendList.js";
import { fillFriendsList } from "./friendList.js";

let currentUser;
let wsFriends;

export async function friendsWebsocket() {
	console.log("socket on");
	wsFriends = new WebSocket("ws://127.0.0.1:8080/ws/friends/");
	wsFriends.onopen = async function () {
		currentUser = await getUserData('username');
		auth();
		getFriendsList();
		getCurrentUserRequests();
	}

	wsFriends.onmessage = (event) => {
		const data = JSON.parse(event.data);
		wsMessageRouter(data);
	};
}

function checkWs() {
	if (wsFriends && wsFriends.readyState === wsFriends.OPEN) {
		return true;
	}
	return false;
}

async function auth() {
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'auth',
			'username': currentUser,
		}));
	}
}

async function getFriendsList() {
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'get_friendslist',
			'current_user': currentUser,
		}));
	}
}

async function getCurrentUserRequests() {
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'get_current_user_requests',
			'user': currentUser,
			'send': 'true',
		}));
	}
}

async function sendFriendRequest(username) {
	console.log('username', username);
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'friend_request',
			'from_user': currentUser,
			'to_user': username,
		}));
	}
}

async function acceptFriendRequest(fromUser) {
	console.log('sending accept request');
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'accept_request',
			'from_user': fromUser,
			'to_user': currentUser,
		}));
	}
}

async function declineFriendRequest(fromUser) {
	console.log('sending decline request');
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'decline_request',
			'from_user': fromUser,
			'to_user': currentUser,
		}));
	}
}

async function getFriendStatus(username) {
	if (checkWs()) {
		wsFriends.send(JSON.stringify({
			'type': 'get_friend_online_status',
			'friend': username,
		}));
	}
}

async function wsMessageRouter(data) {
	const notificationHandlers = {
		'friend_request_to_user': (data) => {
			fillFriendsList(data);
			fillInbox(data);	
			showAlert(`You just receive a friend request from ${data.from_user} !`, true)
		},
		'friend_request_from_user': (data) => showAlert(`You just send a friend request to ${data.to_user} !`, true),
		'accept_request': (data) => {
			console.log();
			fillFriendsList(data);
			fillInbox(data);
			showAlert(`${data.to_user} accepted your friend request !`, true)
		},
		'user_himself': () => showAlert("You cannot send a friend request to yourself.", false),
		'user_do_not_exist': () => showAlert("This user does not exist.", false),
		'request_already_sent': () => showAlert(`You already sent a friend request to this user.`, false),
		'already_friends': (data) => showAlert(`You are already friends with ${data.to_user}.`, false),
		'remove_friend': (data) => showAlert(`You have deleted ${data.to_user} from your friends.`, true),
		'friendslist': (data) => fillFriendsList(data),
		'get_current_user_requests': (data) => fillInbox(data),
	};
	const handler = notificationHandlers[data.type];
	if (handler && data) {
		handler.call(this, data);
	}
}


export { sendFriendRequest, getFriendStatus, acceptFriendRequest, declineFriendRequest };