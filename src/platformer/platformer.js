import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keydown', onKeyDown, false);

const INITIAL_JUMP_STRENGHT = 0.3;
const PLATFORM_SIZE = 5;
const CUBE_SPEED = 0.5;

let cube, plane;
let scene, camera, renderer, controls;
let ambientLight, pointLight;
let isJumping = false;
let jumpStrength = INITIAL_JUMP_STRENGHT;
let gravityStrength = 0.02;

const platforms = [
    {
        height: 1,
        x: 0,
        z: -PLATFORM_SIZE,
    },
    {
        height: 2,
        x: PLATFORM_SIZE,
        z: -PLATFORM_SIZE
    },
    {
        height: 3,
        x: PLATFORM_SIZE,
        z: -PLATFORM_SIZE * 2,
    },
    {
        height: 4,
        x: 0,
        z: -PLATFORM_SIZE * 2,
    }
];

export function main() {
    init();
    createCube();
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
    camera.position.z = 5;
    camera.position.y = 2.5;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
}

function animate() {
    controls.update();

    if (isJumping) {
        cubeJump();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    cube.geometry.computeBoundingBox();
    cube.castShadow = true;
    cube.position.y = 0.5;
    scene.add(cube);
}

function createPlane() {
    const geometry = new THREE.PlaneGeometry(30, 30);
    const texture = new THREE.TextureLoader().load('src/assets/water.jpg');
    const material = new THREE.MeshBasicMaterial({
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
            cube.position.z -= CUBE_SPEED;
            break;
        case 's':
            cube.position.z += CUBE_SPEED;
            break;
        case 'q':
            cube.position.x -= CUBE_SPEED;
            break;
        case 'd':
            cube.position.x += CUBE_SPEED;
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
            cube.position.z -= CUBE_SPEED;
            break;
        case 'pull':
            cube.position.z += CUBE_SPEED;
            break;
        case 'left':
            cube.position.x -= CUBE_SPEED;
            break;
        case 'right':
            cube.position.x += CUBE_SPEED;
            break;
        case 'lift':
            if (!isJumping) {
                isJumping = true;
            }
            break;
    }
}

function cubeJump() {
    cube.position.y += jumpStrength;
    jumpStrength -= gravityStrength;

    if (cube.position.y <= 0.5) {
        isJumping = false;
        cube.position.y = 0.5;
        jumpStrength = INITIAL_JUMP_STRENGHT;
    }
}

function addLight() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffffff, 10);
    scene.add(pointLight);
    pointLight.position.set(1, 3, 0);
    pointLight.castShadow = true;
}

function createPlatforms() {
    for (const platform of platforms) {
        const geometry = new THREE.BoxGeometry(PLATFORM_SIZE, platform.height, PLATFORM_SIZE);
        const material = new THREE.MeshPhongMaterial({color: 0xff0000});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = platform.x
        mesh.position.y = platform.height / 2;
        mesh.position.z = platform.z;
        mesh.castShadow = true;
        platform.object = mesh;
        scene.add(mesh);
    }
}
