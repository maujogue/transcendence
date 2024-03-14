import { getColorChoose, getCharacterChoose } from "./getColorChoose.js";

export async function sendColor(webSocket) {
    const color = getColorChoose('cursorP1');

    if (!color)
        return ;
    await webSocket.send(JSON.stringify({
        'color': color
    }));
}

export async function sendCharacter(webSocket) {
    const character = getCharacterChoose('cursorP1');
    if (!character)
        return ;
    console.log('sendCharacter', character);
    await webSocket.send(JSON.stringify({
        'character': character
    }));
}