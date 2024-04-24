import * as THREE from 'three';

async function createBall(environment) {
    const geometry = new THREE.SphereGeometry( 0.20 );
    const material = new THREE.MeshBasicMaterial( {
        color: 0xebdb34
     } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(0, 0, -18.1);
    environment.camera.updateMatrixWorld();
    let direction = new THREE.Vector3(0.055, 0, 0);
    return {
        "direction": direction,
        "mesh": sphere
    };
}

export { createBall }