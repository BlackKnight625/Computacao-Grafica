var renderer, scene, camera;
var g0, g1, g2;
var hasteMaterial = new THREE.MeshBasicMaterial({color: 0x606060});

/**
 * Creates the whole Structure
 */
function createStructure() {
    'user strict';

    g1 = new THREE.Object3D();

    var noseMaterial = new THREE.MeshBasicMaterial({color: 0xFFCC99});
    var nose = new THREE.Mesh(new THREE.BoxGeometry(15, 20, 3), noseMaterial);
    nose.position.set(25, -20, 0);
    g1.add(nose);


    haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20, 30), hasteMaterial);
    haste.position.set(0, 0, 0);
}

/**
 * Called when the window is resized
 */
function onResize() {
    'use strict';
}

/**
 * Called when a key is pressed
 * @param {*} e 
 * Info about the pressed key
 */
function onKeyDown(e) {
    'use strict';
}

/**
 * Renders the whole Structure
 */
function render() {
    'use strict';

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

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 200;
    camera.lookAt(scene.position);

    var axes = new THREE.AxisHelper(20);
    scene.add(axes);

    document.body.appendChild(renderer.domElement);

    createStructure();

    render();
}

/**
 * Updates the locations and rotations of the Structure
 */
function animate() {
    'use strict';
}