import { getUserData} from "./User.js"
import { showAlert } from "./Utils.js";

const notificationHandlers = {
    'friend_request_to_user': (data) => showAlert(`You just receive a friend request from ${data.from_user} !`, true),
    'friend_request_from_user': (data) => showAlert(`You just send a friend request to ${data.to_user} !`, true),
    'accept_request': (data) => showAlert(`${data.to_user} accepted your friend request !`, true),
    'user_exist': () => showAlert("This user does not exist.", false),
    'already_friends': (data) => showAlert(`You are already friends with ${data.to_user}.`, false),
    'remove_friend': (data) => showAlert(`You have deleted ${data.to_user} from your friends.`, true),
    // 'friendslist': () => showAlert(`FRIENDSLIST`, true),
};

let wsFriends;

export async function friendsWebsocket(username) {
    wsFriends = new WebSocket("ws://127.0.0.1:8080/ws/friends/");
    wsFriends.onopen = function() {
        wsFriends.send(JSON.stringify({
            'type': 'auth',
            'username': username,
        }));
    }

    wsFriends.onmessage = (event) => {
        const data = JSON.parse(event.data);
        printNotification(data);

        if (data.type === 'friendslist') {
            var friendslist = data.friends;
            printFriendslist(friendslist);
        }
            
    };    
}

async function sendFriendsWebSocketMessage(message) {
    if (wsFriends && wsFriends.readyState === wsFriends.OPEN) {
        if (message.type === 'auth') {
            auth(message.username);
        } else if (message.type === 'get_friendslist') {
            sendGetFriendsListToConsumer(message);
        } else if (message.type === 'get_current_user_requests') {
            sendGetCurrentUserRequests(message);
        } else
            sendFriendRequestToConsumer(message);
    } else {
        console.error('WebSocket is not open');
    }
}

async function auth(username) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'username': username,
    }));
}

async function sendGetFriendsListToConsumer(message) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'current_user': message.current_user,
    }));
}

async function sendGetCurrentUserRequests(message) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'from_user': message.from_user,
        'send': message.send,
    }));
}

async function sendFriendRequestToConsumer(message) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'from_user': message.from_user,
        'to_user': message.to_user,
    }));
}

async function printFriendslist(friendslist) {
    const length = Object.keys(friendslist).length;
    console.log("Length of the dictionary:", length);
}

async function printNotification(data) {
    const handler = notificationHandlers[data.type];
    if (handler && data) {
        handler.call(this, data);
    }
}

export { sendFriendsWebSocketMessage };