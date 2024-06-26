import * as THREE from 'three';

function createBall(environment) {
    const geometry = new THREE.SphereGeometry( 0.20 );
    const material = new THREE.MeshBasicMaterial( {
        color: 0xebdb34
     } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(0, 0, 0.9).unproject(environment.camera);
    environment.camera.updateMatrixWorld();
    let direction = new THREE.Vector2(0.055, 0);
    return {
        "direction": direction,
        "mesh": sphere
    };
}

export { createBall }