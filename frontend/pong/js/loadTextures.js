import * as THREE from 'three'

async function load3DTextures(folderName) {
    const textureLoader = new THREE.TextureLoader();

    const tileBaseColor = textureLoader.load('./pong/assets/models/' + folderName + '/basecolor.jpg')
    const tileNormal = textureLoader.load('./pong/assets/models/' + folderName + '/normal.jpg');
    const tileHeight = textureLoader.load('./pong/assets/models/' + folderName + '/height.png');
    const tileMetallic = textureLoader.load('./pong/assets/models/' + folderName + '/metallic.jpg');
    const tileAmbientOcclusion = textureLoader.load('./pong/assets/models/' + folderName + '/ambientOcclusion.jpg');
    const tileRoughness = textureLoader.load('./pong/assets/models/' + folderName + '/roughness.jpg');
    
    return ({
        'baseColor': tileBaseColor,
        'normal': tileNormal,
        'height': tileHeight,
        'metallic': tileMetallic,
        'ambientOcclusion': tileAmbientOcclusion,
        'roughness': tileRoughness
    })
}

async function createTexturedMaterial(folderName) {
    const textures = await load3DTextures(folderName);
    const material = new THREE.MeshStandardMaterial({
        map: textures.baseColor,
        normalMap: textures.normal,
        displacementMap: textures.height,
        displacementScale: 0.1,
        aoMap: textures.ambientOcclusion,
        roughnessMap: textures.roughness,
        metalnessMap: textures.metallic
    });
    return (material);
}

export { createTexturedMaterial, load3DTextures }