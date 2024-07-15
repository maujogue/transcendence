function removeObject(objectName, environment) {
	let object = environment.scene.getObjectByName(objectName);
	if (!object)
		return ;
	environment.scene.remove(object);
	environment.renderer.renderLists.dispose();
}

export { removeObject }