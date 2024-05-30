import { getUserData} from "./User.js"

let webSocket = new WebSocket("ws://127.0.0.1:8080/ws/friends/");

export function friendsWebsocket() {
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
        if (data.type === 'receive_friend_request') {
            showAlert("RECEIVE")
        }
    };    
}

async function sendWebSocketMessage(message) {
    if (webSocket.readyState === webSocketbSocket.OPEN) {
        webSocket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not open');
    }
}

export { sendWebSocketMessage };