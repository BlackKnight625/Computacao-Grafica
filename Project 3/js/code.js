var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();

var spotlights = [];


/*----------Classes---------*/
class Spotlight {
    light;
    structure;
    on;
    cylinder;

    constructor(x, y, z, targetX, targetY, targetZ) {
        this.structure = new THREE.Object3D();

        var cylHeight = 25;
        var cylTranslationUp = 20;

        //Creating the sphere and cylinder for the spotlight
        var sphereMaterial = new THREE.MeshPhongMaterial({color: 0x550000});
        var cylinderMaterial = new THREE.MeshPhongMaterial({color: 0x551100});
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 32, 32), sphereMaterial);
        this.cylinder = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, cylHeight, 32), cylinderMaterial);

        this.cylinder.position.set(0, cylTranslationUp, 0);

        this.structure.add(sphere);
        this.structure.add(this.cylinder);

        //Creating the light
        this.light = new THREE.SpotLight(0xffffff);
        this.light.castShadow = true;
        this.light.angle = Math.PI / 3;

        //Getting the rotation needed to make the spolight face the middle

        //Vector that points to the origin
        var toMiddle = new THREE.Vector3(targetX - x, targetY - y, targetZ - z).normalize();
        //Vector that points at the direction the spotlight is facing
        var direction = new THREE.Vector3(0, 1, 0);

        var rotationAxis = toMiddle.clone().cross(direction);
        var angle = -toMiddle.angleTo(direction);

        //Making the spotlight face the middle
        this.structure.rotateOnWorldAxis(rotationAxis, angle);
        this.structure.position.set(x, y, z);

        var aux = cylHeight + cylTranslationUp;
        this.light.position.set(x + toMiddle.x * aux, y + toMiddle.y * aux, z + toMiddle.z * aux);

        this.on = false;

        scene.add(this.structure);
    }

    flickerLight() {
        var colorModification = new THREE.Color(0x002200);

        if(this.on) {
            //Light is on. Remove it
            scene.remove(this.light);
            
            //Making the spotlight's head less yellow
            this.cylinder.material.color.sub(colorModification);
        }
        else {
            //Light is off. Light it up
            scene.add(this.light);

            //Making the spotlight's head more yellow
            this.cylinder.material.color.add(colorModification);
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
    var cyberTruck = new THREE.Object3D();

    createChassis(cyberTruck);

    //createModel(cyberTruck);

    scene.add(cyberTruck);

    //Temporary
    var material = new THREE.MeshPhongMaterial({color: 0x555555});
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), material);

    scene.add(sphere);

    //Creating spotlights
    createSpotlight(100, 100, 100);
    createSpotlight(0, 100, -150);
    createSpotlight(-100, 100, 100);
}

function createChassis(obj) {
    var boxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var boxGeometry = new THREE.BoxGeometry(380, 1, 170);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);

    obj.add(box);
}

function createModel(obj) {
    var vertices = [
        new THREE.Vector3(0, 100, 0),
        new THREE.Vector3(100, 100, 0),
        new THREE.Vector3(-100, 100, 0)
    ];

    var faces = [
        new THREE.Face3(0, 2, 1)
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0x33FF99});


    var mesh = new THREE.SceneUtils.createMultiMaterialObject(geom, material);

    obj.add(mesh);
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
    spotlights.push(new Spotlight(x, y, z, 0, 0, 0));
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
    pressedKeyActions[49] = function () {spotlights[0].flickerLight()}; //1
    pressedKeyActions[50] = function () {spotlights[1].flickerLight()}; //2
    pressedKeyActions[51] = function () {spotlights[2].flickerLight()}; //3
}

/**
 * Called at the beggining of the program
 */
function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.x = 500;
    camera.position.y = 500;
    camera.position.z = 500;
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