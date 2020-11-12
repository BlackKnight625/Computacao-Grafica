var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();

function createChassis(obj) {
    var boxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var boxGeometry = new THREE.BoxGeometry(380, 1, 170);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);

    obj.add(box);
}

function createModel(obj) {
    var vertices = [
        new THREE.Vector3(-254, 100, 90), //0
        new THREE.Vector3(-254, 100, -90), //1
        new THREE.Vector3(-286, 90, 52), //2
        new THREE.Vector3(-286, 90, -52), //3
        new THREE.Vector3(301, 127, -90), //4
        new THREE.Vector3(301, 127, 90), //5
        new THREE.Vector3(-16, 190, -69), //6
        new THREE.Vector3(-16, 190, 69), //7
        new THREE.Vector3(295, 53, -85), //8
        new THREE.Vector3(295, 53, 85), //9
        new THREE.Vector3(254, 32, -80), //10
        new THREE.Vector3(254, 32, 80), //11
        new THREE.Vector3(-254, 32, -80), //12
        new THREE.Vector3(-254, 32, 80), //13
        new THREE.Vector3(-283, 53, -52), //14
        new THREE.Vector3(-283, 53, 52), //15
    ];

    var faces = [
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(2, 1, 3),
        new THREE.Face3(0, 7, 1),
        new THREE.Face3(7, 6, 1),
        new THREE.Face3(0, 5, 7),
        new THREE.Face3(4, 1, 6),
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        new THREE.Face3(0, 9, 5),
        new THREE.Face3(1, 4, 8),
        new THREE.Face3(11, 9, 5),
        new THREE.Face3(10, 4, 8),
        new THREE.Face3(2, 15, 13),
        new THREE.Face3(13, 0, 2),
        new THREE.Face3(1, 14, 3),
        new THREE.Face3(1, 12, 14),
        new THREE.Face3(13, 11, 5),
        new THREE.Face3(12, 4, 10),
        new THREE.Face3(13, 5, 0),
        new THREE.Face3(1, 4, 12),
        new THREE.Face3(5, 9, 4),
        new THREE.Face3(9, 8, 4),
        new THREE.Face3(9, 11, 8),
        new THREE.Face3(11, 10, 8),
        new THREE.Face3(3, 14, 2),
        new THREE.Face3(14, 15, 2),
        new THREE.Face3(14, 12, 15),
        new THREE.Face3(12, 13, 15),
        new THREE.Face3(14, 12, 15),
        new THREE.Face3(12, 13, 15),
        new THREE.Face3(11, 13, 12),
        new THREE.Face3(12, 10, 11),
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0xc0c0c0});

    var mesh = new THREE.Mesh(geom, material);

    obj.add(mesh);
}

function createWheel(x, y, z) {

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

function createDisplayStand() {

}

function createSpotlight(x, y, z) {

}

/**
 Creates the whole Structure
 */
function createStructure() {
    var cyberTruck = new THREE.Object3D();

    createChassis(cyberTruck);

    createModel(cyberTruck);

    scene.add(cyberTruck);
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