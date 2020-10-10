var renderer, scene, camera;
var g0, g1, g2;
var hasteMaterial = new THREE.MeshBasicMaterial({color: 0x606060});
var clock = new THREE.Clock();
var pressedKeys = {};
var keyActions = {};
var delta;

function createEye() {
    var eye_set = new THREE.Object3D();

    var eyeMaterial_base = new THREE.MeshBasicMaterial({color: 0xFFFDFD});
    
    var left_eye_base = new THREE.Mesh (new THREE.CylinderGeometry(0.8, 0.8, 0.8, 30), eyeMaterial_base);
    left_eye_base.rotation.x = Math.PI * 0.5;
    left_eye_base.position.set(-2,-0.75,0);
    eye_set.add(left_eye_base);

    var right_eye_base = new THREE.Mesh (new THREE.CylinderGeometry(0.8, 0.8, 0.8, 30), eyeMaterial_base);
    right_eye_base.rotation.x = Math.PI * 0.5;
    right_eye_base.position.set(2,-0.75,0);
    eye_set.add(right_eye_base);

    var eyeMaterial_pupil = new THREE.MeshBasicMaterial({color: 0x000000});

    var left_eye_pupil = new THREE.Mesh (new THREE.CylinderGeometry(0.5, 0.5, 0.5, 30), eyeMaterial_pupil);
    left_eye_pupil.rotation.x = Math.PI * 0.5;
    left_eye_pupil.position.set(-2,-0.75,1);
    eye_set.add(left_eye_pupil);

    var right_eye_pupil = new THREE.Mesh (new THREE.CylinderGeometry(0.5, 0.5, 0.5, 30), eyeMaterial_pupil);
    right_eye_pupil.rotation.x = Math.PI * 0.5;
    right_eye_pupil.position.set(2,-0.75,1);
    eye_set.add(right_eye_pupil);

    var eyeMaterial_iris = new THREE.MeshBasicMaterial({color: 0x2FE3F7});

    var left_eye_iris = new THREE.Mesh (new THREE.CylinderGeometry(0.2, 0.2, 0.2, 30), eyeMaterial_iris);
    left_eye_iris.rotation.x = Math.PI * 0.5;
    left_eye_iris.position.set(-2,-0.75,2);
    eye_set.add(left_eye_iris);

    var right_eye_iris = new THREE.Mesh (new THREE.CylinderGeometry(0.2, 0.2, 0.2, 30), eyeMaterial_iris);
    right_eye_iris.rotation.x = Math.PI * 0.5;
    right_eye_iris.position.set(2,-0.75,2);
    eye_set.add(right_eye_iris);

    return eye_set;
}

function createNose() {
    var nose_set = new THREE.Object3D();

    var noseMaterial = new THREE.MeshBasicMaterial({color: 0xFFCC99});
    var nose = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1), noseMaterial);
    nose.position.set(0, -2, 0);
    nose_set.add(nose);

    var nostrilMaterial = new THREE.MeshBasicMaterial({color: 0x994C00});

    var left_nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 30), nostrilMaterial);
    left_nostril.rotation.x = Math.PI * 0.5;
    left_nostril.position.set(-0.25, -2.25, 0);
    nose_set.add(left_nostril);

    var right_nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 30), nostrilMaterial);
    right_nostril.rotation.x = Math.PI * 0.5;
    right_nostril.position.set(0.25, -2.25, 0);
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
    var eye_set = createEye();
    scene.add(nose_set);
    scene.add(eye_set);
    g1.add(nose_set);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.75, 30), hasteMaterial);
    haste.rotation.rotation
    haste.position.set(0, 1.25, 0);
    scene.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2, 30), hasteMaterial);
    haste.rotation.z = Math.PI * 0.5;
    haste.position.set(0.25, 0.75, 0);
    g1.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 30), hasteMaterial);
    haste.position.set(1.12, -0.25, 0);
    g1.add(haste);

    var mouthMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3, 30), mouthMaterial);
    mouth.rotation.x = Math.PI * 0.5;
    mouth.scale.set(2, 1, 1);
    mouth.position.set(0.75, -1, 0);
    g1.add(mouth);

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
    var key = e.keyCode;

    pressedKeys[key] = true;

    console.log(key);
}

/**
 * Called when a key is released
 * @param {*} e 
 * Info about the released key
 */
function onKeyUp(e) {
    'use strict';

    delete pressedKeys[e.keyCode];
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

    //Adding event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    //Adding key actions
    addKeyActions();
}

function addKeyActions() {
    //Rotation actions
    keyActions[81] = function () {rotateGroup(g0, 1);}; //Q
    keyActions[113] = function () {rotateGroup(g0, 1);}; //q
    keyActions[87] = function () {rotateGroup(g0, -1);}; //W
    keyActions[119] = function () {rotateGroup(g0, -1);}; //w
    keyActions[65] = function () {rotateGroup(g1, 1);}; //A
    keyActions[97] = function () {rotateGroup(g1, 1);}; //a
    keyActions[68] = function () {rotateGroup(g1, -1);}; //D
    keyActions[100] = function () {rotateGroup(g1, -1);}; //d
    keyActions[90] = function () {rotateGroup(g2, 1);}; //Z
    keyActions[122] = function () {rotateGroup(g2, 1);}; //z
    keyActions[67] = function () {rotateGroup(g2, -1);}; //C
    keyActions[99] = function () {rotateGroup(g2, -1);}; //c
}

/**
 * Updates the locations and rotations of the Structure
 */
function animate() {
    'use strict';

    delta = clock.getDelta();

    //Calling every active key actions
    for(var key in pressedKeys) {
        if(key in keyActions) {
            keyActions[key]();
        }
    }
}

function rotateGroup(group, multiplier) {
    group.rotateY(multiplier * delta * 0.5 * Math.PI); //0.25 spin per second
}