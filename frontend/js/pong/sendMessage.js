import { getColorChoose } from "./getColorChoose.js";

export async function sendColor(webSocket) {
    const color = getColorChoose('cursorP1');

    if (!color)
        return ;
    await webSocket.send(JSON.stringify({
        'color': color
    }));
}