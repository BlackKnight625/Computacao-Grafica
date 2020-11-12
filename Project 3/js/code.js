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
    cone;

    constructor(x, y, z, targetX, targetY, targetZ) {
        this.structure = new THREE.Object3D();

        var coneHeight = 25;
        var coneTranslationUp = 20;

        //Creating the sphere and cylinder for the spotlight
        var sphereMaterial = new THREE.MeshPhongMaterial({color: 0x550000});
        var coneMaterial = new THREE.MeshPhongMaterial({color: 0x551100});
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 32, 32), sphereMaterial);
        this.cone = new THREE.Mesh(new THREE.ConeGeometry(10, coneHeight, 32), coneMaterial);

        this.cone.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI);
        this.cone.position.set(0, coneTranslationUp, 0);

        this.structure.add(sphere);
        this.structure.add(this.cone);

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

        var aux = coneHeight + coneTranslationUp;
        this.light.position.set(x + toMiddle.x * aux, y + toMiddle.y * aux, z + toMiddle.z * aux);

        this.light.visible = false;

        scene.add(this.structure);
        scene.add(this.light);
    }

    flickerLight() {
        var colorModification = new THREE.Color(0x002200);

        if(this.light.visible) {
            //Making the spotlight's head less yellow
            this.cone.material.color.sub(colorModification);
        }
        else {
            //Making the spotlight's head more yellow
            this.cone.material.color.add(colorModification);
        }

        this.light.visible = !this.light.visible;
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