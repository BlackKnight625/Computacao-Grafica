var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var cyberTruck;

var spotlights = [];


/*----------Classes---------*/
class Spotlight {
    light;
    spotlight;
    on;

    constructor(x, y, z, targetX, targetY, targetZ) {
        this.spotlight = new THREE.Object3D();

        //Creating the sphere and cylinder for the spotlight
        var material = new THREE.MeshBasicMaterial({color: 0xFFFDFD});
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), material);
        var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 5, 32), material);

        cylinder.position.set(0, 2.5, 0);

        this.spotlight.add(sphere);
        this.spotlight.add(cylinder);

        //Creating the light
        this.light = THREE.PointLight(0xffffff, 1, 2);

        this.on = false;
    }

    flickerLight() {
        if(this.on) {
            scene.remove(light);
        }
        else {
            scene.add(light);
        }

        this.on = !this.on;
    }
}

/*----------Methods---------*/

/**
 Creates the whole Structure
 */
function createStructure() {
    cyberTruck = new TetrahedronGeometry.Geometry();
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

    console.log(key);

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
function everyFrame() {
    update();
    display();

    requestAnimationFrame(everyFrame);
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
    createStructure();

    //Adding event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    //Adding key actions
    addKeyActions();

    requestAnimationFrame(everyFrame);
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