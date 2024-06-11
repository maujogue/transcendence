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

        if (data.type === 'friend_request') {
            showAlert("You just receive a friend request from " + data.from_user + " !", true);
        }
        if (data.type === 'user_exist') {
            showAlert("This user does not exist.")
        }
    };    
}

async function sendwsFriendsMessage(message) {
    if (wsFriends && wsFriends.readyState === wsFriends.OPEN) {

        if (message.type === 'auth') {
            wsFriends.send(JSON.stringify({
                'type': message.type,
                'username': message.username,
            }));
        }
        if (message.type === 'friend_request') {
            wsFriends.send(JSON.stringify({
                'type': message.type,
                'from_user': message.from_user,
                'to': message.to,
            }));
        }
        if (message.type === 'user_exist') {
            wsFriends.send(JSON.stringify({
                'type': message.type,
                'username': message.username,
            }));
        }

    } else {
        console.error('WebSocket is not open');
    }
}

export { sendWebSocketMessage };