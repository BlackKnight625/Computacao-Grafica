var renderer, scene, camera;
var g0, g1, g2;
var hasteMaterial = new THREE.MeshBasicMaterial({color: 0x606060});
var clock = new THREE.Clock();
var pressedKeys = {};
var keyActions = {};
var delta;
var translation = new THREE.Vector3();
var angleSpeed = 0.25; //0.25 spins per second
var translationSpeed = 0.1; //0.1 spacial unit per second

function createEye() {
    var eye_set = new THREE.Object3D();

    var eyeMaterial_base = new THREE.MeshBasicMaterial({color: 0xFFFDFD});
    var eye_base = new THREE.Mesh (new THREE.CylinderGeometry(0.5, 0.5, 0.1, 30), eyeMaterial_base);
    eye_base.rotation.x = Math.PI * 0.5;
    eye_base.scale.set(1.5,1,1);
    eye_base.position.set(0,0,0);
    eye_set.add(eye_base);


    var eyeMaterial_pupil = new THREE.MeshBasicMaterial({color: 0x2FE3F7});
    var eye_pupil = new THREE.Mesh (new THREE.CylinderGeometry(0.3, 0.3, 0.1, 30), eyeMaterial_pupil);
    eye_pupil.rotation.x = Math.PI * 0.5;
    eye_pupil.position.set(0,0,0.01);
    eye_set.add(eye_pupil);

    var eyeMaterial_iris = new THREE.MeshBasicMaterial({color: 0x000000});
    var eye_iris = new THREE.Mesh (new THREE.CylinderGeometry(0.12, 0.12, 0.1, 30), eyeMaterial_iris);
    eye_iris.rotation.x = Math.PI * 0.5;
    eye_iris.position.set(0,0,0.011);
    eye_set.add(eye_iris);

    return eye_set;
}

function createNose() {
    var nose_set = new THREE.Object3D();

    var noseMaterial = new THREE.MeshBasicMaterial({color: 0xFFCC99});
    var nose = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.4), noseMaterial);
    nose.position.set(0, 0, 0);
    nose_set.add(nose);

    var nostrilMaterial = new THREE.MeshBasicMaterial({color: 0x994C00});

    var left_nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 30), nostrilMaterial);
    left_nostril.rotation.x = Math.PI * 0.5;
    left_nostril.position.set(-0.25, -0.25, 0.01);
    nose_set.add(left_nostril);

    var right_nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 30), nostrilMaterial);
    right_nostril.rotation.x = Math.PI * 0.5;
    right_nostril.position.set(0.25, -.25, 0.01);
    nose_set.add(right_nostril);

    return nose_set;
}

/**
 * Creates the whole Structure
 */
function createStructure() {
    'user strict';

    g0 = new THREE.Object3D();
    g1 = new THREE.Object3D();
    g2 = new THREE.Object3D();


    // grupo 2: contem a boca
    var mouthMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 30), mouthMaterial);
    mouth.rotation.x = Math.PI * 0.5;
    mouth.scale.set(2, 1, 1);
    mouth.position.set(-0.37, 0, 0);
    g2.add(mouth);
    g2.position.set(1.12, -1, 0);

    // grupo 1: contem o nariz e a boca
    var nose_set = createNose();
    g1.add(nose_set);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2, 30), hasteMaterial);
    haste.rotation.z = Math.PI * 0.5;
    haste.position.set(0.25, 0.75, 0);
    g1.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 30), hasteMaterial);
    haste.position.set(1.12, -0.25, 0);
    g1.add(haste);

    g1.add(g2);

    g1.position.set(0, -1.8, 0);

    // grupo 0: contem grupo 1, olhos e as hastes
    var left_eye = createEye();
    left_eye.position.set(-2,-0.7,0);
    g0.add(left_eye);

    var right_eye = createEye();
    right_eye.position.set(2, -0.7, 0);
    g0.add(right_eye);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.75, 30), hasteMaterial);
    haste.position.set(0, 1.25 - 1.8, 0);
    g0.add(haste);

    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6, 30), hasteMaterial);
    haste.rotation.z = Math.PI * 0.5;
    haste.position.set(0, 0, 0);
    g0.add(haste);
    
    haste = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.75, 30), hasteMaterial);
    haste.position.set(-2, 1.75/2 + 0.25, 0);
    g0.add(haste);

    g0.add(g1);
    scene.add(g0);
}

/**
 * Called when the window is resized
 */
function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
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
    
    //WireFrame actions
    if (key == 52) {
        switchWireFrame();
        return;
    }

    pressedKeys[key] = true;
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
    window.addEventListener("resize", onResize);

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

    //Translation actions
    keyActions[37] = function() {addToTranslation(-1, 0, 0)}; //Left arrow
    keyActions[38] = function() {addToTranslation(0, 0, -1)}; //Up arrow
    keyActions[39] = function() {addToTranslation(1, 0, 0)}; //Right arrow
    keyActions[40] = function() {addToTranslation(0, 0, 1)}; //Down arrow
}

/**
 * Updates the locations and rotations of the Structure
 */
function animate() {
    'use strict';

    delta = clock.getDelta();

    //Resetting the translation vector
    translation.set(0, 0, 0);

    //Calling every active key actions
    for(var key in pressedKeys) {
        if(key in keyActions) {
            keyActions[key]();
        }
    }

    g0.translateOnAxis(translation.normalize(), translationSpeed);
}

function addToTranslation(x, y, z) {
    translation.x += x;
    translation.y += y;
    translation.z += z;
}

function rotateGroup(group, multiplier) {
    group.rotateY(multiplier * delta * 2 * angleSpeed * Math.PI);
}

function switchWireFrame() {
    scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            node.material.wireframe = !node.material.wireframe;
        }
    });
}