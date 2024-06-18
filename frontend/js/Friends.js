import { getUserData} from "./User.js"
import { showAlert } from "./Utils.js";

let wsFriends;

export function friendsWebsocket(username) {
    console.log("socket on");
    wsFriends = new WebSocket("ws://127.0.0.1:8080/ws/friends/");
    wsFriends.onopen = function() {
        wsFriends.send(JSON.stringify({
            'type': 'auth',
            'username': username,
        }));
    }

    wsFriends.onmessage = (event) => {
        const data = JSON.parse(event.data);
        wsMessageRouter(data);
    };    
}

async function sendFriendsWebSocketMessage(message) {
    const messageHandlers = {
        auth: auth,
        'get_friendslist': sendGetFriendsListToConsumer,
        'get_current_user_requests': sendGetCurrentUserRequests,
        'get_friend_online_status': getFriendOnlineStatus,
        default: sendFriendRequestToConsumer
    };

    if (wsFriends && wsFriends.readyState === wsFriends.OPEN) {
        const handler = messageHandlers[message.type] || messageHandlers.default;
        await handler(message);
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

async function getFriendOnlineStatus(message) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'friend': message.friend,
    }));
}

async function wsMessageRouter(data) {
    console.log('type =', data.type);

    const notificationHandlers = {
        'friend_request_to_user': (data) => showAlert(`You just receive a friend request from ${data.from_user} !`, true),
        'friend_request_from_user': (data) => showAlert(`You just send a friend request to ${data.to_user} !`, true),
        'accept_request': (data) => showAlert(`${data.to_user} accepted your friend request !`, true),
        // 'user_himself': () => showAlert("You ")
        'user_exist': () => showAlert("This user does not exist.", false),
        'already_friends': (data) => showAlert(`You are already friends with ${data.to_user}.`, false),
        'remove_friend': (data) => showAlert(`You have deleted ${data.to_user} from your friends.`, true),
        'friendslist': (data) => printFriendslist(data),
        'get_current_user_requests': (data) => fillInbox(data),
    };

    const handler = notificationHandlers[data.type];
    if (handler && data) {
        handler.call(this, data);
    }
}

async function printFriendslist(data) {
    var friendslist = data.friends;

    const length = Object.keys(friendslist).length;
    console.log("Length of the dictionary:", length);

    for (let step = 0; step < length; step++) {
        console.log('#', step, ': name =', friendslist[step].username, ': status =', friendslist[step].status);
    }
}

async function fillInbox(data) {
    var requestsList = data.friend_requests;

    console.log(data);
}

export { sendFriendsWebSocketMessage };