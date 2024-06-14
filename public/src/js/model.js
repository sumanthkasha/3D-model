import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// Add 3d model to html element
const container = document.getElementById('model');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();

// AxesHelper adds the x, y and z axis lines at the position
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// Set up multiple lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2.5, 4, 10).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1000);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// set camera position
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(12, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
renderer.setClearColor(0xbdddd8); //background color can be configured using hex color code
renderer.outputEncoding = THREE.sRGBEncoding;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0, 1, 0);

let mixer;

//Core_15_003, BFlex_5_8_002
const fbxLoader = new FBXLoader();
fbxLoader.load(
    '/src/models/BFlex_5_8_002.FBX', // Load fbx file/model
    (object) => {
        object.scale.multiplyScalar(0.1); // Scaling should be configured
        
        // object.scale.y *= -1; // invert the fbx model/image

        // object.position.set(0, 0, 0); // To place the object at the center of the scene use (0, 0, 0)
        object.position.set(4, 0, 4); 
        // object.position.set(0, 1, 0); 

        // Rotate the object
        object.rotation.set(Math.PI / 1, 0, 0); // Set rotation for x, y, and z axes

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

    if (mixer) mixer.update(clock.getDelta());
    render();
}

function render() {
    renderer.render(scene, camera);
}

animate();
