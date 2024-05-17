import { getUserData} from "./User.js"

export function friendsWebsocket() {
    const webSocket = new WebSocket("ws://127.0.0.1:8080/ws/friends/");
    webSocket.onopen = function() {
        getUserData('friendslist').then((res) => {
            webSocket.send(JSON.stringify({
                'type': 'auth',
                'friendslist': res
            }));
        })
    }

    webSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
    }
}