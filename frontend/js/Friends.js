import { getUserData} from "./User.js"
import { showAlert } from "./Utils.js";

const notificationHandlers = {
    'friend_request_to_user': () => showAlert(`You just receive a friend request from ${data.from_user}`, true),
    'friend_request_from_user': () => showAlert(`You just send a friend request to ${data.to_user}`, true),
    'accept_request': () => showAlert(`${data.to_user} accepted your friend request`, true),
    'user_exist': status => showAlert(status === 'failure'? "This user does not exist." : "", false),
    'already_friends': () => showAlert(`You are already friends with ${data.to_user}`, false),
    'remove_friend': () => showAlert(`You have deleted ${data.to_user} from your friends`, true)
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
    };    
}

async function sendFriendsWebSocketMessage(message) {
    if (wsFriends && wsFriends.readyState === wsFriends.OPEN) {
        if (message.type === 'auth') {
            auth(message.username);
        }
        sendToConsumer(message);
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

async function sendToConsumer(message){
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'from_user': message.from_user,
        'to_user': message.to_user,
    }));
}

async function printNotification(data) {
    const handler = notificationHandlers[data.type];
    if (handler) {
        handler.call(this, data);
    }
}

export { sendFriendsWebSocketMessage };