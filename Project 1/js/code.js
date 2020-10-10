var renderer, scene, camera;
var g0, g1, g2;
var hasteMaterial = new THREE.MeshBasicMaterial({color: 0x606060});
var clock = new THREE.clock();

function createNose() {
    var nose_set = new THREE.Object3D();

    var noseMaterial = new THREE.MeshBasicMaterial({color: 0xFFCC99});
    var nose = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 3), noseMaterial);
    nose.position.set(0, 0, 0);
    nose_set.add(nose);

    var nostrilMaterial = new THREE.MeshBasicMaterial({color: 0x994C00});
    var left_nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 30), nostrilMaterial);
    left_nostril.rotation.x = Math.PI * 0.5;
    left_nostril.position.set(-0.25, -0.25, 0);
    nose_set.add(left_nostril);

    var right_nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 30), nostrilMaterial);
    right_nostril.rotation.x = Math.PI * 0.5;
    right_nostril.position.set(0.25, -0.25, 0);
    nose_set.add(right_nostril);

    return nose_set;
}

/**
 * Creates the whole Structure
 */
function createStructure() {
    'user strict';

    g1 = new THREE.Object3D();

    var nose_set = createNose();
    scene.add(nose_set);

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
    camera.position.z = 20;
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

    var delta = clock.getDelta();
}