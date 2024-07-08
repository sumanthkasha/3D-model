import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

function initialize3DModel(containerId, fbxFilePath, backgroundColor = 0xbdddd8, modelScale = 0.1, modelPosition = [0, 0, 0], modelRotation = [0, 0, 0], showAxesHelper = false, scaleX = 1, scaleY = 1, scaleZ = 1, keyboardControls = true) {
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    // Set up multiple lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2.5, 4, 10).normalize();
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1000);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Optional: Add axes helper
    if (showAxesHelper) {
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    }

    // Set camera position
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(backgroundColor);
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0, 1, 0);

    let mixer;
    let model;

    const fbxLoader = new FBXLoader();
    fbxLoader.load(
        fbxFilePath, // Load fbx file/model
        (object) => {
            model = object;
            object.scale.set(scaleX * modelScale, scaleY * modelScale, scaleZ * modelScale);
            object.position.set(...modelPosition); // To place the object at the specified position
            object.rotation.set(...modelRotation); // Set rotation for x, y, and z axes

            // Center the object
            const box = new THREE.Box3().setFromObject(object);
            const boxCenter = box.getCenter(new THREE.Vector3());
            controls.target.copy(boxCenter);
            controls.update();

            mixer = new THREE.AnimationMixer(object);
            let animationAction = mixer.clipAction(object.animations[0]);
            animationAction.play();
            scene.add(object);
        },
        undefined,
        (error) => {
            console.error("Error loading the model:", error);
        }
    );

    if (keyboardControls) {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    const moveSpeed = 0.1;
    const rotateSpeed = 0.02;

    const keysPressed = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Shift: false,
        W: false,
        S: false,
    };

    // If key is pressed, it updates the keysPressed object to mark the corresponding key as being pressed.
    function onKeyDown(event) { 
        if (keysPressed.hasOwnProperty(event.key)) {
            keysPressed[event.key] = true;
        }
    }

    // If key is released, it updates the keysPressed object to mark the corresponding key as no longer being pressed.
    function onKeyUp(event) { 
        if (keysPressed.hasOwnProperty(event.key)) {
            keysPressed[event.key] = false;
        }
    }

    function updateModelMovement() {
        if (model) {
            if (keysPressed.ArrowUp) model.position.z -= moveSpeed;
            if (keysPressed.ArrowDown) model.position.z += moveSpeed;

            if (keysPressed.ArrowLeft) model.rotation.y += rotateSpeed;
            if (keysPressed.ArrowRight) model.rotation.y -= rotateSpeed;
            
            if (keysPressed.ArrowUp && keysPressed.Shift) model.position.y += moveSpeed;
            if (keysPressed.ArrowDown && keysPressed.Shift) model.position.y -= moveSpeed;

            if (keysPressed.W && keysPressed.Shift) model.position.x += moveSpeed;
            if (keysPressed.S && keysPressed.Shift) model.position.x -= moveSpeed;
        }
    }

    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        render();
    }
    window.addEventListener('resize', onWindowResize, false);

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        updateModelMovement();
        if (mixer) mixer.update(clock.getDelta());
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    animate();
}

initialize3DModel(
    'model',                 // Container ID
    '/src/models/BFlex_5_8_002.FBX', // FBX file path
    0xbdddd8,                // Background color
    0.2,                     // Model scale
    [4, 0, 4],               // Model position
    [Math.PI / 1, 0, 0],     // Model rotation
    false,                   // Show axes helper
    0.5, 0.5, 0.5,           // Optional scale values for x, y, z (uniform scale)
    true                     // Enable keyboard controls
);

// initialize3DModel(
//     'model',                 // Container ID
//     '/src/models/Core_15_003.FBX', // FBX file path
//     0xbdddd8,                // Background color
//     0.1,                     // Model scale
//     [4, 0, 4],               // Model position
//     [0, 0, 0],               // Model rotation
//     true,                    // Show axes helper
//     -1, 1, -1,                // Optional scale values for x, y, z (uniform scale)
//     true                     // Enable keyboard controls
// );

