import { getUserData} from "./User.js"

export function friendsWebsocket() {
    const webSocket = new WebSocket("ws://127.0.0.1:8080/ws/friends/");
    webSocket.onopen = function() {
        getUserData('username').then((res) => {
            webSocket.send(JSON.stringify({
                'type': 'auth',
                'username': res
            }));
        })
    }

    webSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type == "auth")
            alert(data.username);
    }
}