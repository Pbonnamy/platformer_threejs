import * as THREE from 'three';
import { OrbitControls} from 'three/addons/controls/OrbitControls.js';

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keydown', onKeyDown, false);

const INITIAL_JUMP_STRENGHT = 0.3;

let cube, plane;
let scene, camera, renderer, controls;
let ambientLight, pointLight;
let isJumping = false;
let jumpStrength = INITIAL_JUMP_STRENGHT;
let gravityStrength = 0.02;

main();

function main() 
{
    init();
    createCube();
    createPlane();
    addLight();

    animate();
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function init() 
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x87ceeb );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;
    camera.position.y = 2.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
}   

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (isJumping) {
        cubeJump();
    }

    renderer.render(scene, camera);
}

function createCube() 
{
    const geometry = new THREE.BoxGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    cube.castShadow = true;
    cube.position.y = 0.5;
    scene.add( cube );
}

function createPlane() 
{
    const geometry = new THREE.PlaneGeometry( 500, 500 );
    const material = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI / 2;

    scene.add( plane );
}

function onKeyDown(event) {
    const speed = 0.1;
    switch (event.key) {
        case 'z':
            cube.position.z -= speed;
            break;
        case 's':
            cube.position.z += speed;
            break;
        case 'q':
            cube.position.x -= speed;
            break;
        case 'd':
            cube.position.x += speed;
            break;
        case ' ':
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



