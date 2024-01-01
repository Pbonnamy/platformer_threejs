import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keydown', onKeyDown, false);

const INITIAL_JUMP_STRENGTH = 0.3;
const INITAL_PLAYER_Y = 1.6;
const PLATFORM_SIZE = 8;
const PLAYER_SPEED = 0.5;
const PLANE_SIZE = 40;

let player, plane;
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
    const loader = new GLTFLoader();
    loader.load('src/assets/steve.glb', function (gltf) {
        player = gltf.scene;
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        player.position.y = INITAL_PLAYER_Y;
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
    const texture = new THREE.TextureLoader().load('src/assets/water.jpg');
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
    switch (event.key) {
        case 'z':
            player.position.z -= PLAYER_SPEED;
            player.rotation.y = Math.PI;
            break;
        case 's':
            player.position.z += PLAYER_SPEED;
            player.rotation.y = 0;
            break;
        case 'q':
            player.position.x -= PLAYER_SPEED;
            player.rotation.y = -Math.PI / 2;
            break;
        case 'd':
            player.position.x += PLAYER_SPEED;
            player.rotation.y = Math.PI / 2;
            break;
        case ' ':
            if (!isJumping) {
                isJumping = true;
            }
            break;
    }
}

export function onEventReceived(event) {
    switch (event) {
        case 'push':
            player.position.z -= PLAYER_SPEED;
            player.rotation.y = Math.PI;
            break;
        case 'pull':
            player.position.z += PLAYER_SPEED;
            player.rotation.y = 0;
            break;
        case 'left':
            player.position.x -= PLAYER_SPEED;
            player.rotation.y = -Math.PI / 2;
            break;
        case 'right':
            player.position.x += PLAYER_SPEED;
            player.rotation.y = Math.PI / 2;
            break;
        case 'lift':
            if (!isJumping) {
                isJumping = true;
            }
            break;
    }
}

function playerJump() {
    player.position.y += jumpStrength;
    jumpStrength -= gravityStrength;

    if (player.position.y <= INITAL_PLAYER_Y) {
        isJumping = false;
        player.position.y = INITAL_PLAYER_Y;
        jumpStrength = INITIAL_JUMP_STRENGTH;
    }
}

function addLight() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffffff, 100);
    scene.add(pointLight);
    pointLight.position.set(5, 10, 0);
    pointLight.castShadow = true;
}

function createPlatforms() {
    for (const platform of platforms) {
        const geometry = new THREE.BoxGeometry(PLATFORM_SIZE, PLATFORM_SIZE, PLATFORM_SIZE);
        const topTexture = new THREE.TextureLoader().load('src/assets/top.png');
        const sideTexture = new THREE.TextureLoader().load('src/assets/side.png');

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
        platform.object = mesh;
        scene.add(mesh);
    }
}
