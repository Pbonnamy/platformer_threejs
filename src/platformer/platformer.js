import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keydown', onKeyDown, false);

const INITIAL_JUMP_STRENGTH = 0.3;
const PLATFORM_SIZE = 10;
const PLAYER_SPEED = 0.5;
const PLANE_SIZE = 50;
const INITIAL_PLAYER_Y = 1.6;

const modelLoader = new GLTFLoader();

let player, plane;
let yBeforeJumping = 0;
let scene, camera, renderer, controls;
let ambientLight, pointLight;
let isJumping = false;
let jumpStrength = INITIAL_JUMP_STRENGTH;
let gravityStrength = 0.02;

const platforms = [
    {
        x: -PLATFORM_SIZE/2,
        z: PLATFORM_SIZE/2,
        y: -PLATFORM_SIZE/2 + 1,
    },
    {
        x: PLATFORM_SIZE/2,
        z: PLATFORM_SIZE/2,
        y: -PLATFORM_SIZE/2 + 2,
    },
    {
        x: PLATFORM_SIZE/2,
        z: -PLATFORM_SIZE/2,
        y: -PLATFORM_SIZE/2 + 3,
    },
    {
        x: -PLATFORM_SIZE/2,
        z: -PLATFORM_SIZE/2,
        y: -PLATFORM_SIZE/2 + 4,
    }
];

export function main() {
    init();
    createPlayer();
    createPlane();
    createPlatforms();
    createTrees();
    createTorches();
    addLight();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 10;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
}

function animate() {
    controls.update();

    if (isJumping) {
        playerJump();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function createPlayer() {
    modelLoader.load('src/assets/model/steve.glb', function (gltf) {
        player = gltf.scene;
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        player.position.y = INITIAL_PLAYER_Y;
        player.position.x = -12;
        player.position.z = 4;
        player.rotation.y = Math.PI / 2;
        player.scale.set(0.1, 0.1, 0.1);

        scene.add(player);
    }, undefined, function (error) {
        console.error(error);
    });
}

function createPlane() {
    const geometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const texture = new THREE.TextureLoader().load('src/assets/texture/water.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI / 2;

    scene.add(plane);
}

function onKeyDown(event) {

    let nextPosition = Object.assign({}, player.position);

    switch (event.key) {
        case 'z':
            nextPosition.z -= PLAYER_SPEED;
            player.rotation.y = Math.PI;
            break;
        case 's':
            nextPosition.z += PLAYER_SPEED;
            player.rotation.y = 0;
            break;
        case 'q':
            nextPosition.x -= PLAYER_SPEED;
            player.rotation.y = -Math.PI / 2;
            break;
        case 'd':
            nextPosition.x += PLAYER_SPEED;
            player.rotation.y = Math.PI / 2;
            break;
        case ' ':
            if (!isJumping) {
                yBeforeJumping = player.position.y;
                isJumping = true;
            }
            break;
    }

    if (canMove(nextPosition)) {
        player.position.x = nextPosition.x;
        player.position.z = nextPosition.z;
    }
}

export function onEventReceived(event, intensity) {
    let nextPosition = Object.assign({}, player.position);

    switch (event) {
        case 'push':
            nextPosition.z -= intensity;
            player.rotation.y = Math.PI;
            break;
        case 'pull':
            nextPosition.z += intensity;
            player.rotation.y = 0;
            break;
        case 'left':
            nextPosition.x -= intensity;
            player.rotation.y = -Math.PI / 2;
            break;
        case 'right':
            nextPosition.x += intensity;
            player.rotation.y = Math.PI / 2;
            break;
        case 'lift':
            if (!isJumping) {
                yBeforeJumping = player.position.y;
                isJumping = true;
            }
            break;
    }

    if (canMove(nextPosition)) {
        player.position.x = nextPosition.x;
        player.position.z = nextPosition.z;
    }
}

function playerJump() {
    player.position.y += jumpStrength;
    jumpStrength -= gravityStrength;

    if (player.position.y <= yBeforeJumping) {
        isJumping = false;
        player.position.y = yBeforeJumping;
        jumpStrength = INITIAL_JUMP_STRENGTH;
    }
}

function addLight() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffffff, 500);
    scene.add(pointLight);
    pointLight.position.set(5, 20, 0);
    pointLight.castShadow = true;
}

function createPlatforms() {
    for (const platform of platforms) {
        const geometry = new THREE.BoxGeometry(PLATFORM_SIZE, PLATFORM_SIZE, PLATFORM_SIZE);
        const topTexture = new THREE.TextureLoader().load('src/assets/texture/top.png');
        const sideTexture = new THREE.TextureLoader().load('src/assets/texture/side.png');

        const material = [
            new THREE.MeshPhongMaterial({map: sideTexture}),
            new THREE.MeshPhongMaterial({map: sideTexture}),
            new THREE.MeshPhongMaterial({map: topTexture}),
            new THREE.MeshPhongMaterial({map: topTexture}),
            new THREE.MeshPhongMaterial({map: sideTexture}),
            new THREE.MeshPhongMaterial({map: sideTexture}),
        ]
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = platform.x;
        mesh.position.y = platform.y;
        mesh.position.z = platform.z;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        platform.object = mesh;
        scene.add(mesh);
    }
}

function createTrees() {
    modelLoader.load('src/assets/model/tree.glb', function (gltf) {
        const tree = gltf.scene;
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        tree.position.y = -1;
        tree.position.x = -PLATFORM_SIZE/2-1;
        tree.position.z = -PLATFORM_SIZE/2;
        tree.rotation.y = Math.PI / 2;
        tree.scale.set(10, 10, 10);

        scene.add(tree);
    }, undefined, function (error) {
        console.error(error);
    });
}

function createTorches() {
    modelLoader.load('src/assets/model/torch.glb', function (gltf) {
        const torch = gltf.scene;
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        torch.position.y = 2.5;
        torch.position.x = PLATFORM_SIZE/2+2;
        torch.position.z = PLATFORM_SIZE/2+2;
        torch.rotation.y = Math.PI / 2;

        scene.add(torch);
    }, undefined, function (error) {
        console.error(error);
    });
}

function canMove(nextPosition) {
    for (const platform of platforms) {
        if (nextPosition.x >= platform.x - PLATFORM_SIZE / 2
            && nextPosition.x <= platform.x + PLATFORM_SIZE / 2
            && nextPosition.z >= platform.z - PLATFORM_SIZE / 2
            && nextPosition.z <= platform.z + PLATFORM_SIZE / 2) {
            //is on platform
            if (Math.round(player.position.y - INITIAL_PLAYER_Y) < platform.y + PLATFORM_SIZE / 2) {
                console.log(player.position.y - INITIAL_PLAYER_Y, platform.y + PLATFORM_SIZE / 2);
                //is under platform
                return false;
            } else {
                //is on platform
                if (isJumping) {
                    yBeforeJumping = platform.y + PLATFORM_SIZE / 2 + INITIAL_PLAYER_Y;
                } else {
                    player.position.y = platform.y + PLATFORM_SIZE / 2 + INITIAL_PLAYER_Y;
                }
                return true;
            }
        }
    }

    player.position.y = INITIAL_PLAYER_Y;

    return true;
}
