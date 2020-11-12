var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();

function createPodium(obj){
    
    var podiumMaterial = new THREE.MeshBasicMaterial({color: 0x66B2FF});
    var podiumGeometry = new THREE.CylinderGeometry(300, 200, 100, 50);
    podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
    podium.position.set(0, -50,0);

    obj.add(podium);
}

function createChassis(obj) {

    var boxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var boxGeometry = new THREE.BoxGeometry(380, 1, 170);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);

    var wheel = createWheel(0, 0, 0);

    obj.add(wheel);
    obj.add(box);
    
}

function createModel(obj) {
    var vertices = [
        new THREE.Vector3(0, 100, 0),
        new THREE.Vector3(100, 100, 0),
        new THREE.Vector3(-100, 100, 0)
    ];

    var faces = [
        new THREE.Face3(0, 2, 1)
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0x33FF99});


    var mesh = new THREE.SceneUtils.createMultiMaterialObject(geom, material);

    obj.add(mesh);
}

function createWheel(x, y, z) {
    var wheelMaterial = new THREE.MeshBasicMaterial({color: 0xFF8000});
    var wheelGeometry = new THREE.CylinderGeometry(20,20,10,50);
    var wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelMesh.position.set(x,y,z);

    return wheelMesh;
}


function createWindshield(x, y, z) {

}

function createFrontWindow(x, y, z) {

}

/**
 * For creating the 2 back windows
 */
function createBackWindow(x, y, z) {

}

function createSpotlight(x, y, z) {

}

/**
 Creates the whole Structure
 */
function createStructure() {
    var cyberTruck = new THREE.Object3D();
    var podium  = new THREE.Object3D();

    createPodium(podium);
    createChassis(cyberTruck);

    //createModel(cyberTruck);
    scene.add(cyberTruck);
    scene.add(podium);

    scene.traverse(function (node) {
        console.log(node);
    });
    
}



/**
 * Called when the window is resized
 */
function onResize() {

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

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.x = 500;
    camera.position.y = 500;
    camera.position.z = 500;
    camera.lookAt(scene.position);

    var axes = new THREE.AxesHelper(20);
    scene.add(axes);

    document.body.appendChild(renderer.domElement);

    createStructure();

    //Adding event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    //Adding key actions
    addKeyActions();

    animate();
}

function update() {
    delta = clock.getDelta();

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
}