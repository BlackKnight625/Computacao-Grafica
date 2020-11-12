var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var cyberTruck;
var clock = new THREE.Clock();

var spotlights = [];


/*----------Classes---------*/
class Spotlight {
    light;
    structure;
    on;

    constructor(x, y, z, targetX, targetY, targetZ) {
        this.structure = new THREE.Object3D();

        var cylHeight = 5;
        var cylTranslationUp = 2.5;

        //Creating the sphere and cylinder for the spotlight
        var material = new THREE.MeshBasicMaterial({color: 0xFFFDFD});
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), material);
        var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, cylHeight, 32), material);

        cylinder.position.set(0, cylTranslationUp, 0);

        this.structure.add(sphere);
        this.structure.add(cylinder);

        //Creating the light
        this.light = THREE.SpotLight(0xffffff);
        this.light.castShadow = true;
        this.light.angle = Math.PI / 4;

        //Getting the rotation needed to make the spolight face the middle

        //Vector that points to the origin
        var toMiddle = new THREE.Vector3(targetX - x, targetY - y, targetZ - z).normalize();
        //Vector that points at the direction the spotlight is facing
        var direction = new THREE.Vector3(0, 1, 0);

        var rotationAxis = toMiddle.clone().cross(direction);
        var angle = toMiddle.angleTo(direction);

        //Making the spotlight face the middle
        this.structure.rotateOnWorldAxis(rotationAxis, angle);

        var aux = cylHeight + cylTranslationUp;
        this.light.position.set(x + toMiddle.x * aux, y + toMiddle.y * aux, z + toMiddle.z * aux);

        this.on = false;
    }

    flickerLight() {
        if(this.on) {
            //Light is on. Remove it
            scene.remove(light);
        }
        else {
            //Light is off. Light it up
            scene.add(light);
        }

        this.on = !this.on;
    }

    update() {
        this.light.shadow.camera = camera;
    }
}

/*----------Methods---------*/

/**
 Creates the whole Structure
 */
function createStructure() {
    
}

function createChassis() {

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

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = 200;
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