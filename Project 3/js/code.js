var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();


var directionalLight;
var spotlights = [];
var allMeshes = [];
var basicMaterialToggleClass = THREE.MeshBasicMaterial;
var currentGlobalMaterialClass = THREE.MeshBasicMaterial;

//Glass shatering related
var windowBroken = false;
var glassShatteringBalls = [];

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
        var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x550000});
        var coneMaterial = new THREE.MeshBasicMaterial({color: 0x551100});
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(25, 32, 32), sphereMaterial);
        this.cone = new THREE.Mesh(new THREE.ConeGeometry(10, coneHeight, 32), coneMaterial);

        allMeshes.push(sphere, this.cone);

        this.cone.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI);
        this.cone.position.set(0, coneTranslationUp, 0);

        this.structure.add(sphere);
        this.structure.add(this.cone);

        //Creating the light
        this.light = new THREE.SpotLight(0xffffff);
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
}

class GlassBreakingBall {
    hitTarget = false;
    ball;
    xLimit;
    acceleration;
    velocity;
    radius;
    shatterAudio;
    hitAudio;

    constructor(startingPosition, velocity, xLimit) {
        this.radius = 5;

        var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x999999});
        this.ball = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 32, 32), sphereMaterial);
        this.setPosition(startingPosition);

        this.xLimit = xLimit;
        this.velocity = velocity;
        this.acceleration =  new THREE.Vector3(0, 0, 0);

        this.shatterAudio = new Audio("glass_shatter.mp3");
        this.hitAudio = new Audio("metal_hit.wav");

        allMeshes.push(this.ball);
        glassShatteringBalls.push(this);
        scene.add(this.ball);
    }

    setPosition(newPosition) {
        this.ball.position.set(newPosition.x, newPosition.y, newPosition.z);
    }

    checkCollision() {
        /*Disclaimer: Since this is an easter egg, not a requirement of the project, the collision dealing methods are
        not sofisticated, for simplicity*/

        if(this.hitTarget) {
            //The window has already been broken. Checking for collisions with the floor
            if(this.ball.position.y - this.radius < 0) {
                this.dealWithFloorCollision();
            }
        }
        else {
            //The ball is still moving towards the window. Checking for window collisions
            var ballToXPlane = new THREE.Vector3(this.xLimit - this.ball.position.x, 0, 0);

            if(ballToXPlane.dot(this.velocity) < 0) {
                //Ball surpassed the x plane
                this.dealWithWindowCollision();
            }
        }
    }

    dealWithWindowCollision() {
        this.hitTarget = true;
        this.shatterAudio.play();

        this.acceleration = new THREE.Vector3(this.velocity.x * 0.05, -98, this.velocity.z * 0.05);
        this.velocity.multiplyScalar(-0.9);
    }

    dealWithFloorCollision() {
        this.velocity.multiplyScalar(0.7);
        this.velocity.y = -this.velocity.y;

        this.hitAudio.volume *= 0.7;
        this.hitAudio.play();

        var newPosition = this.ball.position.clone();
        newPosition.y = this.radius;

        this.setPosition(newPosition); //Poorly done on purpose
    }

    update() {
        //Updating position and velocity
        var newPosition = new THREE.Vector3();

        newPosition.x = this.ball.position.x + delta * this.velocity.x + 0.5 * delta * delta * this.acceleration.x;
        newPosition.y = this.ball.position.y + delta * this.velocity.y + 0.5 * delta * delta * this.acceleration.y;
        newPosition.z = this.ball.position.z + delta * this.velocity.z + 0.5 * delta * delta * this.acceleration.z;

        var newVelocity = new THREE.Vector3();

        newVelocity.x = this.velocity.x + delta * this.acceleration.x;
        newVelocity.y = this.velocity.y + delta * this.acceleration.y;
        newVelocity.z = this.velocity.z + delta * this.acceleration.z;

        this.setPosition(newPosition);
        this.velocity = newVelocity;

        if(this.velocity.x + this.velocity.z < 0.1) {
            if(this.velocity.length() < 0.01) {
                //Velocity too small. Make it stand still
                this.velocity = new THREE.Vector3();
                this.acceleration = new THREE.Vector3();
            }
            else if (this.hitTarget) {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }            
        }

        this.checkCollision();
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
}

function createPodium(obj){
    
    var podiumMaterial = new THREE.MeshBasicMaterial({color: 0x66B2FF});
    var podiumGeometry = new THREE.CylinderGeometry(300, 200, 100, 50);
    podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
    podium.position.set(0, -114, 0);

    obj.add(podium);
}

function createChassis(obj) {

    var boxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var boxGeometry = new THREE.BoxGeometry(380, 15, 170);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);

    //Left front wheel
    var wheel1 = createWheel(-190, 0, 85);
    //Right front wheel
    var wheel2 = createWheel(-190, 0, -85);
    //Left back wheel
    var wheel3 = createWheel(190, 0, 85);
    //Right back wheel
    var wheel4 = createWheel(190, 0, -85);


    obj.add(wheel1);
    obj.add(wheel2);
    obj.add(wheel3);
    obj.add(wheel4);
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
    var wheelMaterial = new THREE.MeshBasicMaterial({color: 0xFF8000});
    var wheelGeometry = new THREE.CylinderGeometry(64, 64, 30, 50);
    var wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelMesh.position.set(x,y,z);
    wheelMesh.rotation.x = Math.PI * 0.5;

    return wheelMesh;
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

function createSpotlight(x, y, z) {
    spotlights.push(new Spotlight(x, y, z, 0, 0, 0));
}

/**
 Creates the whole Structure
 */
function createStructure() {
    var cyberTruck = new THREE.Object3D();
    var podium  = new THREE.Object3D();

    createPodium(podium);
    createChassis(cyberTruck);

    //createModel(cyberTruck);
    scene.add(cyberTruck);
    scene.add(podium);

    scene.traverse(function (node) {
        console.log(node);
    });
    
}

function createDirectionalLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff);

    scene.add(directionalLight);
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

    pressedKeyActions[87] = function () {switchBasicMaterials()} //W
    pressedKeyActions[119] = function () {switchBasicMaterials()} //w
    pressedKeyActions[69] = function () {toggleGouraudPhong()} //E
    pressedKeyActions[101] = function () {toggleGouraudPhong()} //e
    pressedKeyActions[81] = function () {directionalLight.visible = !directionalLight.visible} //Q
    pressedKeyActions[113] = function () {directionalLight.visible = !directionalLight.visible} //q

    pressedKeyActions[32] = function () {spawnGlassShatteringBall()} // Spacebar

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
    createDirectionalLight();

    //Creating spotlights
    createSpotlight(100, 100, 100);
    createSpotlight(0, 100, -150);
    createSpotlight(-100, 100, 100);

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

    if(delta > 0.1) {
        //If the player leaves the browser, the next delta will be huge. This prevents bad things from happening
        delta = 0.1;
    }

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

    //Updating all glass shattering balls
    for(ball of glassShatteringBalls) {
        ball.update();
    }
}

function replaceEveryonesMaterials() {
    //Switching all mesh's materials with the current global one
    for(var mesh of allMeshes) {
        mesh.material = new currentGlobalMaterialClass({color: mesh.material.color.getHex()});
    }
}

function switchBasicMaterials() {
    if(currentGlobalMaterialClass != THREE.MeshBasicMaterial) {
        //Time to turn every Mesh into a Basic one
        basicMaterialToggleClass = currentGlobalMaterialClass;
        currentGlobalMaterialClass = THREE.MeshBasicMaterial;

        replaceEveryonesMaterials();
    }
    else {
        if(basicMaterialToggleClass != THREE.MeshBasicMaterial) {
            //Time to turn every Mesh back to their original material
            currentGlobalMaterialClass = basicMaterialToggleClass;

            replaceEveryonesMaterials();
        }
    }
}

function toggleGouraudPhong() {
    if(currentGlobalMaterialClass != THREE.MeshBasicMaterial) {
        if(currentGlobalMaterialClass == THREE.MeshPhongMaterial) {
            currentGlobalMaterialClass = THREE.MeshLambertMaterial;
        }
        else {
            currentGlobalMaterialClass = THREE.MeshPhongMaterial;
        }
    }
    else {
        //Current material is basic. Defaulting to Phong
        currentGlobalMaterialClass = THREE.MeshPhongMaterial;
    }

    replaceEveryonesMaterials();
}

function spawnGlassShatteringBall() {
    var deviation = new THREE.Vector3().random().multiplyScalar(2);

    var position = new THREE.Vector3(300, 300, 300);
    var velocity = new THREE.Vector3(-60, 0, 0);

    velocity.add(deviation);

    new GlassBreakingBall(position, velocity, 0);
}