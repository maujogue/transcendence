function getColorChoose(id) {
    const cursor = document.getElementById(id);
    return (cursor.parentNode.style.background)
}

export { getColorChoose }