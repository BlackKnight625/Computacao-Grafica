var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();
var orbitControls;

var allMeshes = [];

//TODO Change this
var ortCam = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2,
    -2000, 2000);

var perspCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);

/*----------Classes---------*/

/*----------Methods---------*/

/**
 Creates the whole Structure
 */
function createStructure() {
    var loader = new THREE.CubeTextureLoader();
    var texture = loader.load([
    '../cubemap/nx.png',
    '../cubemap/ny.png',
    '../cubemap/nz.png',
    '../cubemap/px.png',
    '../cubemap/py.png',
    '../cubemap/pz.png',
    ]);
    scene.background = texture;
}

/**
 * Called when the window is resized
 */
function onResize() {
    'use strict';

    //TODO Change this depending on the camera

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        perspCam.aspect = window.innerWidth / window.innerHeight;
        perspCam.updateProjectionMatrix();

        ortCam.left = window.innerWidth / - 2;
        ortCam.right = window.innerWidth / 2;
        ortCam.top = window.innerHeight / 2;
        ortCam.bottom = window.innerHeight / - 2;
        ortCam.updateProjectionMatrix();
    }
}

/**
 * Called when a key is pressed
 * @param {*} e 
 * Info about the pressed key
 */
function onKeyDown(e) {
    'use strict';
    var key = e.keyCode;

    pressedKeys[key] = true;
}

/**
 * Called when a key is released
 * @param {*} e 
 * Info about the released key
 */
function onKeyUp(e) {
    'use strict';
    var key = e.keyCode;

    if (key in pressedKeys) {
        delete pressedKeys[key];
    }
}


/**
 * Called every frame
 */
function animate() {
    update();
    display();

    requestAnimationFrame(animate);
}

/**
 * Renders the whole Structure
 */
function display() {
    renderer.render(scene, camera);
}

function addKeyActions() {

}

/**
 * Called at the beggining of the program
 */
function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = perspCam;

    //Adding event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.x = 0;
    camera.position.y = 500;
    camera.position.z = 500;
    camera.lookAt(scene.position);

    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    //Adding key actions
    addKeyActions();

    animate();
}

function update() {
    delta = clock.getDelta();

    if(delta > 0.02) {
        //If the player leaves the browser, the next delta will be huge. This prevents bad things from happening
        delta = 0.02;
    }

    //Calling every active key actions
    for(var key in pressedKeys) {
        if(key in keyActions) {
            keyActions[key]();
        }
    }

    // calling every single action key
    for (var key in pressedKeys) {
        if (key in pressedKeyActions) {
            pressedKeyActions[key]();
            delete pressedKeys[key];
        }
    }

    orbitControls.update();
}

function replaceEveryonesMaterials() {
    //Switching all mesh's materials with the current global one

    //TODO change to 2 lists 

    for(var mesh of allMeshes) {
        mesh.material = new currentGlobalMaterialClass({color: mesh.material.color.getHex()});
    }
}