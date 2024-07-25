import { charactersNames } from "./varGlobal.js";

function getColorChoose(id) {
    const cursor = document.getElementById(id);
    if (!cursor)
        return ;
    return (cursor.parentNode.style.background)
}

function getCharacterChoose(id) {
    const cursor = document.getElementById(id);
    if (!cursor)
        return ;

    const parent = cursor.parentNode.id;
	const parentNumber = parent[parent.length - 1];
    return (charactersNames[parentNumber]);
}

export { getColorChoose, getCharacterChoose }