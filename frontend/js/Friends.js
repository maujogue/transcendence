import { getUserData} from "./User.js"
import { showAlert } from "./Utils.js";

let webSocket = new WebSocket("ws://127.0.0.1:8080/ws/friends/");

export async function friendsWebsocket() {
    webSocket.onopen = function() {
        getUserData('friendslist').then((res) => {
            webSocket.send(JSON.stringify({
                'type': 'auth',
                'friendslist': res
            }));
        })
    }

    webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'friend_request') {
            console.log("OK1");
            showAlert("You just receive a friend request from " + data.from_user + " !", true);
        }
    };    
}

async function sendWebSocketMessage(message) {
    if (webSocket.readyState === webSocket.OPEN) {
        webSocket.send(JSON.stringify({
            'type': message.type,
            'from_user': message.from_user,
            'to': message.to,
        }));
    } else {
        console.error('WebSocket is not open');
    }
}

export { sendWebSocketMessage };