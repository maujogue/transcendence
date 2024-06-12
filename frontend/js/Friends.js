import { getUserData} from "./User.js"
import { showAlert } from "./Utils.js";

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
        if (message.type === 'friend_request') {
            friendRequest(message);
        }
    } else {
        console.error('WebSocket is not open');
    }
}

async function auth(username) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'username': message.username,
    }));
}

async function friendRequest(message) {
    wsFriends.send(JSON.stringify({
        'type': message.type,
        'from_user': message.from_user,
        'to_user': message.to_user,
    }));
}

async function printNotification(data) {
    if (data.type === 'friend_request_to_user') {
        showAlert("You just receive a friend request from " + data.from_user + " !", true);
    }
    if (data.type === 'friend_request_from_user') {
        showAlert("You just send a friend request to " + data.to_user + " !", true);
    }
    if (data.type === 'user_exist' && data.status === 'failure') {
        showAlert("This user does not exist.", false)
    }
    if (data.type === 'already_friends') {
        showAlert("You are already friends with " + data.to_user + " !", false)
    }
}

export { sendFriendsWebSocketMessage };