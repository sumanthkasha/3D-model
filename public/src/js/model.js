import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

function initialize3DModel(
    containerId, 
    fbxFilePath, 
    backgroundColor = 0xbdddd8, 
    modelScale = 0.1, 
    modelPosition = [0, 0, 0], 
    modelRotation = [0, 0, 0], 
    cameraPosition = [7.5, 0, 0], 
    showAxesHelper = false, 
    scaleX = 1, 
    scaleY = 1, 
    scaleZ = 1, 
    keyboardControls = true,
    directionalLightVal = [10, 10, 10],
    pointLightVal = [10, 10, 10],
    hemiLightVal = [0, 50, 0]
) {
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    // Set up multiple lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    /**
     * Direction light: Simulates sunlight or any other distant light source that casts parallel rays in a specific direction. 
     * This light can cast shadows.
     * 
     * Analogy: Imagine the sunlight on a clear day where all shadows are parallel.
     */
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(2.5, 4, 10).normalize();
    directionalLight.position.set(...directionalLightVal).normalize();
    scene.add(directionalLight);

    /**
     * Point light: Emits light in all directions from a single point, similar to a bare light bulb. It can cast shadows.
     * 
     * Analogy: Think of a light bulb hanging from the ceiling, illuminating everything around it evenly.
     */
    const pointLight = new THREE.PointLight(0xffffff, 1000);
    pointLight.position.set(...pointLightVal);
    scene.add(pointLight);

    /**
     * Hemi light: Provides a soft, gradient light from above, typically used to simulate natural outdoor lighting, 
     * where the sky color fades into the ground color.
     * 
     * Analogy: Imagine the light on a cloudy day where the sky softly illuminates everything, with a slight color gradient from the sky to the ground.
     */
    const hemiLight = new THREE.HemisphereLight(0x4040ff, 0xff4040, 1); // skyColor, groundColor, intensity
    hemiLight.position.set(...hemiLightVal);
    scene.add(hemiLight);

    // Optional: Add axes helper
    if (showAxesHelper) {
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    }

    // Set camera position
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(...cameraPosition);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(backgroundColor);
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.domElement.addEventListener('mousedown', () => {
        container.style.cursor = 'grabbing';
    });

    renderer.domElement.addEventListener('mouseup', () => {
        container.style.cursor = 'grab'; // or 'default' if you want to revert to the default cursor
    });

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0, 1, 0);

    // Enable damping (inertia) for smooth movement
    controls.enableDamping = true; 
    controls.dampingFactor = 0.1;

    let mixer;
    let model;
    // let animationStartTime;
    // const animationDuration = 5; // Duration in seconds
    // const targetPosition = [3, 0, 0]; // Define target position
    // const targetScale = 0.2; // Define target scale

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

            // Initialize animation parameters
            // animationStartTime = performance.now();
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

        // Animate model coming from back to front and scaling
        // if (model) {
        //     const elapsedTime = (performance.now() - animationStartTime) / 1000;
        //     const progress = Math.min(elapsedTime / animationDuration, 1);

        //     // Move model along the z-axis and scale
        //     model.position.z = 4.5 - 4.5 * progress; // Adjust start and end positions
        //     model.scale.set(modelScale + (targetScale - modelScale) * progress, modelScale + (targetScale - modelScale) * progress, modelScale + (targetScale - modelScale) * progress);

        //     // Stop animation at target position
        //     if (progress === 1) {
        //         model.position.set(...targetPosition);
        //         model.scale.set(targetScale, targetScale, targetScale);
        //         return; // Stop further animation updates
        //     }
        // }

        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    animate();
}

initialize3DModel(
    'model',                        // Container ID
    '/src/models/BFlex_5_8_002.FBX',// FBX file path
    0xCCE2F3,                       // Background color
    0.2,                            // Model scale
    [3, 0, 4.5],                    // Model position
    [Math.PI / 1, 0, 0],            // Model rotation
    [8.5, 0, 0],                    //Camera position
    false,                          // Show axes helper
    0.5, 0.5, 0.5,                  // Optional scale values for x, y, z (uniform scale)
    true,                           // Enable keyboard controls
    [10, 10, 10],                   //Direction light
    [5, 5, 7],                      //Poin light
    [0, 50, 0]                      //Hemi light
);

// initialize3DModel(
//      'model',                         // Container ID
//      '/src/models/Core_15_003.FBX',   // FBX file path
//      0xbdddd8,                        // Background color
//      0.1,                             // Model scale
//      [4, 0, 4],                       // Model position
//      [0, 2, 0],                       // Model rotation
//      [12, 0, 0],                      //Camera position
//      true,                            // Show axes helper
//      -1, 1, -1,                       // Optional scale values for x, y, z (uniform scale)
//      true,                            // Enable keyboard controls
//      [2.5, 4, 10],                    //Direction light
//      [5, 5, 5],                       //Poin light
//      [0, 50, 0]                       //Hemi light
// );

