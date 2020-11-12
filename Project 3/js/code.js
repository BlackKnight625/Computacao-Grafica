const { TetrahedronGeometry } = require("../../Project 2/js/three");

var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var cyberTruck;

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
    render();

    requestAnimationFrame(everyFrame);
}

/**
 * Renders the whole Structure
 */
function render() {
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
}