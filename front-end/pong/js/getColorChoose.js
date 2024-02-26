function getColorChoose(id) {
    const cursor = document.getElementById(id);
    if (!cursor)
        return ;
    return (cursor.parentNode.style.background)
}

export { getColorChoose }