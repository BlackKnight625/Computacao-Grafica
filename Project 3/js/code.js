var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;

/**
 Creates the whole Structure
 */
function createStructure() {

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