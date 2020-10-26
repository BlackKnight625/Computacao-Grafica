var renderer, scene, camera;

function createStructure() {

}

/**
 * Renders the whole Structure
 */
function render() {
    'use strict';

    animate();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

/**
 * Called at the beggining of the program
 */
function init() {
    'use strict'
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.OrthographicCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 20;
    camera.lookAt(scene.position);

    var axes = new THREE.AxisHelper(20);
    scene.add(axes);

    document.body.appendChild(renderer.domElement);

    createStructure();

    render();

    //Adding event listeners
    //window.addEventListener("keydown", onKeyDown);
    //window.addEventListener("keyup", onKeyUp);
    //window.addEventListener("resize", onResize);

    //Adding key actions
    addKeyActions();
}

function addKeyActions() {

}

function animate() {

}