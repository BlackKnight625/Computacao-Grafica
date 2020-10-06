var renderer, scene, camera;
var g0, g1, g2;
var hasteMaterial = new THREE.MeshBasicMaterial({color: 0x606060});

function createSet0() {
    g0 = new THREE.Object3D();
    var mouthMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var mouth = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 3, 30), mouthMaterial);
    mouth.rotation.x = Math.PI * 0.5; 
    mouth.position.set(-7.5, -30, 0);
    g0.add(mouth);

    var haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 30, 30), hasteMaterial);
    haste.position.set(-10, -15, 0);
    g0.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 30, 30), hasteMaterial);
    haste.rotation.z = Math.PI * 0.5;
    haste.position.set(-10, 0, 0);
    g0.add(haste);
}

/**
 * Creates the whole Structure
 */
function createStructure() {
    'user strict';

    createSet0();

    //scene.add(g0);

    g1 = new THREE.Object3D();

    var noseMaterial = new THREE.MeshBasicMaterial({color: 0xFFCC99});
    var nose = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 70, 5), noseMaterial);
    nose.rotation.x = Math.PI * 0.5;
    nose.position.set(30, -10, 0);
    g1.add(nose);


    haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20, 30), hasteMaterial);
    haste.rotation.z = Math.PI * -(1/3);
    haste.position.set(-8+10, 0, 0);
    g1.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 25, 30), hasteMaterial);
    haste.rotation.z = Math.PI * (1/3);
    haste.position.set(8+13, 0, 0);
    g1.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20, 30), hasteMaterial);
    haste.position.set(-2+10, -6, 0);
    g1.add(haste);


    //haste fora do sitio (base do nariz)
    haste = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20, 30), hasteMaterial);
    haste.position.set(0, 0, 0);
    g1.add(haste);

    g0.position.set(0+10, -16, 0);
    g1.add(g0);

    scene.add(g1);
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
    //g1.rotation.y += 0.02;

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