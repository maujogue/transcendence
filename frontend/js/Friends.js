export function friendsWebsocket() {
    const webSocket = new WebSocket("ws://127.0.0.1:8080/ws/friends/");
    webSocket.onopen = function() {
        console.log('Connection established');
    }
}