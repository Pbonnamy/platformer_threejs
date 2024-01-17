import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

//event listeners
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keydown', onKeyDown, false);

//constants
const INITIAL_JUMP_STRENGTH = 0.3;
const PLATFORM_SIZE = 10;
const PLAYER_SPEED = 0.5;
const PLANE_SIZE = 50;
const INITIAL_PLAYER_Y = 1.6;
const PLATFORMS = [
    //bottom left
    {
        x: -PLATFORM_SIZE / 2,
        z: PLATFORM_SIZE / 2,
        y: -PLATFORM_SIZE / 2 + 1,
    },
    //bottom right
    {
        x: PLATFORM_SIZE / 2,
        z: PLATFORM_SIZE / 2,
        y: -PLATFORM_SIZE / 2 + 2,
    },
    //top left
    {
        x: PLATFORM_SIZE / 2,
        z: -PLATFORM_SIZE / 2,
        y: -PLATFORM_SIZE / 2 + 3,
    },
    //top right
    {
        x: -PLATFORM_SIZE / 2,
        z: -PLATFORM_SIZE / 2,
        y: -PLATFORM_SIZE / 2 + 4,
    }
];

const TORCHES = [
    //bottom left
    {
        x: -PLATFORM_SIZE / 2 - 2,
        z: PLATFORM_SIZE / 2 + 2,
        y: 1.5,
    },
    //bottom right
    {
        x: PLATFORM_SIZE / 2 + 2,
        z: PLATFORM_SIZE / 2 + 2,
        y: 2.5,
    },
    //top right
    {
        x: PLATFORM_SIZE / 2 + 2,
        z: -PLATFORM_SIZE / 2 - 2,
        y: 3.5,
    },
];


//3D models loader
const modelLoader = new GLTFLoader();

//THREE.js objects
let player, plane;
let scene, camera, renderer, controls;

//variables
let yBeforeJumping = 0;
let ambientLight, pointLight;
let isJumping = false;
let jumpStrength = INITIAL_JUMP_STRENGTH;
let gravityStrength = 0.02;

export function main() {
    //setup scene
    init();
    addLights();

    //create objects
    createPlane();
    createPlatforms();
    createTree();
    createTorch();
    createPlayer();

    //render scene
    animate();
}

//resize scene on browser window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
    //scene
    scene = new THREE.Scene();

    //scene background image
    scene.background = new THREE.TextureLoader().load('src/assets/texture/night.png');
    scene.backgroundIntensity = 0.5;

    //render
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    //camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 19;
    camera.position.y = 11;

    //camera controls
    controls = new OrbitControls(camera, renderer.domElement);
}

//render scene
function animate() {
    controls.update();

    if (isJumping) {
        playerJump();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

//load player model and add it to the scene
function createPlayer() {
    modelLoader.load('src/assets/model/steve.glb', function (gltf) {
        player = gltf.scene;

        //resize player
        player.scale.set(0.1, 0.1, 0.1);

        //handle shadows
        player.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        //set player position & rotation
        player.position.y = INITIAL_PLAYER_Y;
        player.position.x = -12;
        player.position.z = 4;
        player.rotation.y = Math.PI / 2;

        //add player to the scene
        scene.add(player);
    }, undefined, function (error) {
        console.error(error);
    });
}

//create plane and add it to the scene
function createPlane() {
    //create plane geometry
    const geometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);

    //load plane texture
    const texture = new THREE.TextureLoader().load('src/assets/texture/water.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    //create plane material from texture
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });

    //create plane
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = Math.PI / 2;

    //add plane to the scene
    scene.add(plane);
}

//when keyboard key is pressed
function onKeyDown(event) {

    //check if key is allowed
    const allowedKeys = ['z', 's', 'q', 'd', ' '];
    if (!allowedKeys.includes(event.key)) {
        return;
    }

    let nextPosition = Object.assign({}, player.position);

    switch (event.key) {
        //move forward
        case 'z':
            nextPosition.z -= PLAYER_SPEED;
            player.rotation.y = Math.PI;
            break;
        //move backward
        case 's':
            nextPosition.z += PLAYER_SPEED;
            player.rotation.y = 0;
            break;
        //move left
        case 'q':
            nextPosition.x -= PLAYER_SPEED;
            player.rotation.y = -Math.PI / 2;
            break;
        //move right
        case 'd':
            nextPosition.x += PLAYER_SPEED;
            player.rotation.y = Math.PI / 2;
            break;
        //jump
        case ' ':
            if (!isJumping) {
                yBeforeJumping = player.position.y;
                isJumping = true;
            }
            break;
    }

    //check collision
    if (canMove(nextPosition)) {
        player.position.x = nextPosition.x;
        player.position.z = nextPosition.z;
    }
}

//when mental command is received
export function onEventReceived(event, intensity) {

    //check if event is allowed
    const allowedEvents = ['push', 'pull', 'left', 'right', 'lift'];
    if (!allowedEvents.includes(event)) {
        return;
    }

    let nextPosition = Object.assign({}, player.position);

    switch (event) {
        //move forward
        case 'push':
            nextPosition.z -= intensity;
            player.rotation.y = Math.PI;
            break;
        //move backward
        case 'pull':
            nextPosition.z += intensity;
            player.rotation.y = 0;
            break;
        //move left
        case 'left':
            nextPosition.x -= intensity;
            player.rotation.y = -Math.PI / 2;
            break;
        //move right
        case 'right':
            nextPosition.x += intensity;
            player.rotation.y = Math.PI / 2;
            break;
        //jump
        case 'lift':
            if (!isJumping) {
                yBeforeJumping = player.position.y;
                isJumping = true;
            }
            break;
    }

    //check collision
    if (canMove(nextPosition)) {
        player.position.x = nextPosition.x;
        player.position.z = nextPosition.z;
    }
}

//handle player jump
function playerJump() {
    player.position.y += jumpStrength;
    jumpStrength -= gravityStrength;

    if (player.position.y <= yBeforeJumping) {
        isJumping = false;
        player.position.y = yBeforeJumping;
        jumpStrength = INITIAL_JUMP_STRENGTH;
    }
}

//add light to the scene
function addLights() {
    //ambient light
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
}

//create platforms and add them to the scene
function createPlatforms() {
    for (const platform of PLATFORMS) {
        //platform geometry
        const geometry = new THREE.BoxGeometry(PLATFORM_SIZE, PLATFORM_SIZE, PLATFORM_SIZE);

        //platform texture
        const topTexture = new THREE.TextureLoader().load('src/assets/texture/top.png');
        const sideTexture = new THREE.TextureLoader().load('src/assets/texture/side.png');

        //platform material from texture
        const material = [
            new THREE.MeshPhongMaterial({map: sideTexture}),
            new THREE.MeshPhongMaterial({map: sideTexture}),
            new THREE.MeshPhongMaterial({map: topTexture}),
            new THREE.MeshPhongMaterial({map: topTexture}),
            new THREE.MeshPhongMaterial({map: sideTexture}),
            new THREE.MeshPhongMaterial({map: sideTexture}),
        ]

        //create platform
        const mesh = new THREE.Mesh(geometry, material);

        //platform position
        mesh.position.x = platform.x;
        mesh.position.y = platform.y;
        mesh.position.z = platform.z;

        //platform shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        //add platform to the scene
        scene.add(mesh);
    }
}

//create tree and add it to the scene
function createTree() {
    modelLoader.load('src/assets/model/tree.glb', function (gltf) {
        const tree = gltf.scene;

        //resize tree
        tree.scale.set(10, 10, 10);

        //handle shadows
        tree.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        //tree position & rotation
        tree.position.y = -1;
        tree.position.x = -PLATFORM_SIZE / 2 - 1;
        tree.position.z = -PLATFORM_SIZE / 2;
        tree.rotation.y = Math.PI / 2;

        //add tree to the scene
        scene.add(tree);
    }, undefined, function (error) {
        console.error(error);
    });
}

//create torch and add it to the scene
function createTorch() {
    for (const torchPosition of TORCHES) {
        modelLoader.load('src/assets/model/torch.glb', function (gltf) {
            const torch = gltf.scene;

            //handle shadows
            torch.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            //torch position & rotation
            torch.position.y = torchPosition.y;
            torch.position.x = torchPosition.x;
            torch.position.z = torchPosition.z;

            //add torch to the scene
            scene.add(torch);
        }, undefined, function (error) {
            console.error(error);
        });

        const torchLight = new THREE.PointLight(0xffffffdddd, 50);
        torchLight.position.set(torchPosition.x, torchPosition.y + 3, torchPosition.z);
        torchLight.castShadow = true;
        scene.add(torchLight);
    }
}

//check if player can move to next position
function canMove(nextPosition) {
    for (const platform of PLATFORMS) {
        if (nextPosition.x >= platform.x - PLATFORM_SIZE / 2
            && nextPosition.x <= platform.x + PLATFORM_SIZE / 2
            && nextPosition.z >= platform.z - PLATFORM_SIZE / 2
            && nextPosition.z <= platform.z + PLATFORM_SIZE / 2) {

            //player is on platform
            if (Math.round(player.position.y - INITIAL_PLAYER_Y) < platform.y + PLATFORM_SIZE / 2) {
                //player is under platform
                return false;
            } else {
                //player is above platform
                if (isJumping) {
                    yBeforeJumping = platform.y + PLATFORM_SIZE / 2 + INITIAL_PLAYER_Y;
                } else {
                    player.position.y = platform.y + PLATFORM_SIZE / 2 + INITIAL_PLAYER_Y;
                }
                return true;
            }
        }
    }

    //player is not on platform
    player.position.y = INITIAL_PLAYER_Y;

    //check if player is out of the plane
    return !(nextPosition.x > PLANE_SIZE / 2 || nextPosition.x < -PLANE_SIZE / 2
        || nextPosition.z > PLANE_SIZE / 2 || nextPosition.z < -PLANE_SIZE / 2);
}
