var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();
var gravity = new THREE.Vector3(0, -400, 0);


var angleSpeed = 0.25; //0.25 spins per second
var wholeStructure;
var directionalLight;
var spotlights = [];
var allMeshes = [];
var basicMaterialToggleClass = THREE.MeshBasicMaterial;
var currentGlobalMaterialClass = THREE.MeshBasicMaterial;
var floorY = -64;
var distanceFromBallToWindow = 420;

//Glass shatering related
var windowBroken = false;
var glassShatteringBalls = [];
var glassShards = [];

var ortCam = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2,
    -2000, 2000);

var perspCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);

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
        this.light.intensity = 0.5;

        //Getting the rotation needed to make the spolight face the middle

        //Vector that points to the origin
        var toMiddle = new THREE.Vector3(targetX - x, targetY - y, targetZ - z).normalize();
        //Vector that points at the direction the spotlight is facing
        var direction = new THREE.Vector3(0, 1, 0);

        var rotationAxis = toMiddle.clone().cross(direction).normalize();
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
        var colorModification = new THREE.Color(0x005500);

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
    collisionPoint;
    acceleration;
    velocity;
    radius;
    shatterAudio;
    hitAudioVolume;
    bounces = 0;

    constructor(startingPosition, velocity, collisionPoint) {
        this.radius = 5;
        this.collisionPoint = collisionPoint;

        var sphereMaterial = new currentGlobalMaterialClass({color: 0x999999});
        this.ball = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 32, 32), sphereMaterial);
        this.setPosition(startingPosition);

        this.velocity = velocity;
        this.acceleration =  new THREE.Vector3(0, 0, 0);

        this.shatterAudio = new Audio("glass_shatter.mp3");
        this.hitAudioVolume = 1;

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
            if(this.ball.position.y - this.radius < floorY) {
                this.dealWithFloorCollision();
            }
        }
        else {
            //The ball is still moving towards the window. Checking for window collisions
            var ballToWindow = this.collisionPoint.clone().sub(this.ball.position);

            if(ballToWindow.dot(this.velocity) < 0) {
                //Ball surpassed the window
                this.dealWithWindowCollision();
            }
        }
    }

    dealWithWindowCollision() {
        this.shatterAudio.play();

        ballCollidedWithWindow(this.ball.position, this.velocity.clone().normalize().multiplyScalar(-1));

        this.acceleration = new THREE.Vector3(this.velocity.x * 0.05, gravity.y, this.velocity.z * 0.05);
        this.velocity.multiplyScalar(-0.9);
        this.hitTarget = true;
        windowBroken = true;
    }

    dealWithFloorCollision() {
        this.velocity.multiplyScalar(0.7);
        this.velocity.y = -this.velocity.y;

        //Must create a new audio due to the fact that it can be played twice while it's still playing
        var hitAudio = new Audio("metal_hit.wav");
        hitAudio.volume = this.hitAudioVolume;
        hitAudio.play();

        this.hitAudioVolume *= 0.7;

        var newPosition = this.ball.position.clone();
        newPosition.y = this.radius + floorY;

        this.setPosition(newPosition); //Position rollback poorly done on purpose

        this.bounces++;
    }

    update() {
        if(this.bounces <= 30 && (this.velocity.length() >= 0.1 || this.ball.position.y > 3 + floorY)) {
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
        else {
            this.stopped = true;
        }
    }
}

class GlassShard {
    shard;
    shatterAudio;
    acceleration;
    velocity;
    rotationAxis;
    angleSpeed;
    multiplier;
    mesh;

    constructor(spawnPosition, shootDirection, multiplier = 1) {
        this.multiplier = multiplier;
        
        //Making a glass shard
        var vertices = [];

        var vertices = [
            this.getRandomVector(20 * multiplier),
            this.getRandomVector(20 * multiplier),
            this.getRandomVector(20 * multiplier)
        ];
    
        var faces = [
            new THREE.Face3(0, 1, 2),
        ];
    
        var geom = new THREE.Geometry();
        geom.vertices = vertices;
        geom.faces = faces;
        geom.computeFaceNormals();
    
        var material = new currentGlobalMaterialClass({color: 0x7de5ff, opacity: 0.5, transparent: true});
    
        this.mesh = new THREE.Mesh(geom, material);

        //Audio
        this.shatterAudio = new Audio("glass_shatter_small.mp3");
        this.shatterAudio.volume = 0.3 * multiplier;

        //Position
        var center = new THREE.Vector3();

        center.add(vertices[0]);
        center.add(vertices[1]);
        center.add(vertices[2]);
        center.multiplyScalar(1 / 3);

        this.mesh.position.set(-center.x, -center.y, -center.z);

        //Getting a velocity
        this.velocity = shootDirection.clone().normalize();

        var rotAxis1 = new THREE.Vector3(this.velocity.y, this.velocity.z, this.velocity.x);
        var rotAxis2 = new THREE.Vector3(this.velocity.z, this.velocity.x, this.velocity.y);

        rotateAroundAxis(this.velocity, rotAxis1, (Math.random() - 0.5) * 2 * Math.PI / 2);
        rotateAroundAxis(this.velocity, rotAxis2, (Math.random() - 0.5) * 2 * Math.PI / 2);          

        this.velocity.multiplyScalar((100 + Math.random() * 100) * multiplier);
        this.velocity.y += 50 * multiplier;

        this.acceleration = gravity;

        //Rotation axis to make the shard spin
        this.rotationAxis = new THREE.Vector3().random().normalize();
        this.angleSpeed = 2 * Math.PI * (2 + Math.random() * 2); //2 - 4 spins per second 

        //Adding to lists and scene
        this.shard = new THREE.Object3D();
        this.shard.add(this.mesh);
        this.setPosition(spawnPosition);

        scene.add(this.shard);
        allMeshes.push(this.mesh);
        glassShards.push(this);
    }

    setPosition(newPosition) {
        this.shard.position.set(newPosition.x, newPosition.y, newPosition.z);
    }

    getRandomVector(multiplier = 1) {
        return new THREE.Vector3().random().multiplyScalar(multiplier);
    }

    checkFloorCollision() {
        //Checking for collisions with the floor
        if(this.shard.position.y < floorY) {
            this.dealWithFloorCollision();
        }
    }

    dealWithFloorCollision() {
        this.shatterAudio.play();

        //Removing the shard from all lists and scene
        var index = allMeshes.indexOf(this.mesh);
        if (index > -1) {
            allMeshes.splice(index, 1);
        }

        index = glassShards.indexOf(this);
        if (index > -1) {
            glassShards.splice(index, 1);
        }

        scene.remove(this.shard);

        if(Math.random() <= 0.1) {
            //Chance of shattering into smaller shards
            var shardAmount = Math.floor(2 + Math.random() * 3); //2 - 4 shards
            var newPosition = this.shard.position.clone();
            newPosition.y = 0;

            for(i = 0; i < shardAmount; i++) {
                new GlassShard(newPosition, new THREE.Vector3(0, 1, 0), this.multiplier / 2.0);
            }
        }
    }

    update() {
        //Updating position and velocity
        var newPosition = new THREE.Vector3();

        newPosition.x = this.shard.position.x + delta * this.velocity.x + 0.5 * delta * delta * this.acceleration.x;
        newPosition.y = this.shard.position.y + delta * this.velocity.y + 0.5 * delta * delta * this.acceleration.y;
        newPosition.z = this.shard.position.z + delta * this.velocity.z + 0.5 * delta * delta * this.acceleration.z;

        var newVelocity = new THREE.Vector3();

        newVelocity.x = this.velocity.x + delta * this.acceleration.x;
        newVelocity.y = this.velocity.y + delta * this.acceleration.y;
        newVelocity.z = this.velocity.z + delta * this.acceleration.z;

        this.setPosition(newPosition);
        this.velocity = newVelocity;

        this.shard.rotateOnWorldAxis(this.rotationAxis, delta * this.angleSpeed);

        this.checkFloorCollision();
    }
}

/*----------Methods---------*/

function createPodium(obj){
    
    var podiumMaterial = new THREE.MeshBasicMaterial({color: 0x66B2FF});
    var podiumGeometry = new THREE.CylinderGeometry(300, 200, 100, 50);
    podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
    podium.position.set(0, -114, 0);

    allMeshes.push(podium);
    obj.add(podium);
}

function createChassis(obj) {

    var boxMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var boxGeometry = new THREE.BoxGeometry(380, 15, 170);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);

    box.position.set(0, 32, 0);

    //Left front wheel
    var wheel1 = createWheel(-190, 32, 85);
    //Right front wheel
    var wheel2 = createWheel(-190, 32, -85);
    //Left back wheel
    var wheel3 = createWheel(190, 32, 85);
    //Right back wheel
    var wheel4 = createWheel(190, 32, -85);

    allMeshes.push(box);

    obj.add(wheel1);
    obj.add(wheel2);
    obj.add(wheel3);
    obj.add(wheel4);
    obj.add(box);
}

function createModel(obj) {
    var vertices = [
        new THREE.Vector3(-254, 100, 90), //0
        new THREE.Vector3(-254, 100, -90), //1
        new THREE.Vector3(-286, 90, 52), //2
        new THREE.Vector3(-286, 90, -52), //3
        new THREE.Vector3(301, 127, -90), //4
        new THREE.Vector3(301, 127, 90), //5
        new THREE.Vector3(-16, 190, -69), //6
        new THREE.Vector3(-16, 190, 69), //7
        new THREE.Vector3(295, 53, -85), //8
        new THREE.Vector3(295, 53, 85), //9
        new THREE.Vector3(254, 32, -80), //10
        new THREE.Vector3(254, 32, 80), //11
        new THREE.Vector3(-254, 32, -80), //12
        new THREE.Vector3(-254, 32, 80), //13
        new THREE.Vector3(-283, 53, -52), //14
        new THREE.Vector3(-283, 53, 52), //15

        new THREE.Vector3(-185, 127, 75), //ws_0 (16)
        new THREE.Vector3(-185, 127, -75), //ws_1 (17)
        new THREE.Vector3(-20, 190, 65), //ws_2 (18)
        new THREE.Vector3(-20, 190, -65), //ws_3 (19)

        new THREE.Vector3(-210, 110, 87), //sw_0 (20)
        new THREE.Vector3(-16, 180, 71), //sw_1 (21)
        new THREE.Vector3(80, 165, 75), //sw_2 (22)
        new THREE.Vector3(80, 130, 83), //sw_3 (23)

        new THREE.Vector3(-210, 110, -87), //sw_4 (24)
        new THREE.Vector3(-16, 180, -71), //sw_5 (25)
        new THREE.Vector3(80, 165, -75), //sw_6 (26)
        new THREE.Vector3(80, 130, -83), //sw_7 (27)

        new THREE.Vector3(-254, 95, 90), //farol_right_0 (28)
        new THREE.Vector3(-286, 85, 52), //farol_right_1 (29)

        new THREE.Vector3(-254, 95, -90), //farol_left_0 (30)
        new THREE.Vector3(-286, 85, -52), //farol_left_1 (31)

        new THREE.Vector3(301, 122, 90), //back_farol_0 (32)
        new THREE.Vector3(301, 122, -90), //back_farol_1 (33)

    ];

    var faces = [
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(2, 1, 3),
        new THREE.Face3(0, 16, 1),
        new THREE.Face3(16, 17, 1),
        new THREE.Face3(0, 7, 18),
        new THREE.Face3(18, 16, 0),
        new THREE.Face3(17, 19, 6),
        new THREE.Face3(6, 1, 17),
        new THREE.Face3(18, 7, 6),
        new THREE.Face3(6, 19, 18),

        new THREE.Face3(0, 20, 7),
        new THREE.Face3(20, 21, 7),
        new THREE.Face3(0, 5, 20),
        new THREE.Face3(23, 20, 5),
        new THREE.Face3(5, 22, 23),
        new THREE.Face3(5, 7, 22),
        new THREE.Face3(22, 7, 21),

        new THREE.Face3(24, 1, 6),
        new THREE.Face3(25, 24, 6),
        new THREE.Face3(26, 25, 6),
        new THREE.Face3(4, 26, 6),
        new THREE.Face3(4, 27, 26),
        new THREE.Face3(4, 1, 27),
        new THREE.Face3(27, 1, 24),
        
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        new THREE.Face3(0, 9, 5),
        new THREE.Face3(1, 4, 8),
        new THREE.Face3(11, 9, 5),
        new THREE.Face3(10, 4, 8),


        new THREE.Face3(29, 15, 13),
        new THREE.Face3(13, 28, 29),
        new THREE.Face3(30, 14, 31),
        new THREE.Face3(30, 12, 14),


        new THREE.Face3(13, 11, 5),
        new THREE.Face3(12, 4, 10),

        new THREE.Face3(13, 32, 0),
        new THREE.Face3(1, 33, 12),

        new THREE.Face3(0, 32, 5),
        new THREE.Face3(1, 4, 33),

        new THREE.Face3(28, 13, 0),
        new THREE.Face3(1, 12, 30),

        new THREE.Face3(32, 9, 33),
        new THREE.Face3(9, 8, 33),
        new THREE.Face3(9, 11, 8),
        new THREE.Face3(11, 10, 8),

        new THREE.Face3(31, 14, 29),
        new THREE.Face3(14, 15, 29),

        new THREE.Face3(14, 12, 15),
        new THREE.Face3(12, 13, 15),
        new THREE.Face3(11, 13, 12),
        new THREE.Face3(12, 10, 11),
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0xc0c0c0, wireframe: false});

    var mesh = new THREE.Mesh(geom, material);

    allMeshes.push(mesh);

    obj.add(mesh);
}

function createWheel(x, y, z) {
    var wheelMaterial = new THREE.MeshBasicMaterial({color: 0x202020});
    var wheelGeometry = new THREE.CylinderGeometry(50, 50, 30, 50);
    var wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelMesh.position.set(x,y,z);
    wheelMesh.rotation.x = Math.PI * 0.5;

    allMeshes.push(wheelMesh);

    return wheelMesh;
}

function createWindshield(obj) {
    var vertices = [
        new THREE.Vector3(-185, 127, 75), //ws_0 (16)
        new THREE.Vector3(-185, 127, -75), //ws_1 (17)
        new THREE.Vector3(-20, 190, 65), //ws_2 (18)
        new THREE.Vector3(-20, 190, -65), //ws_3 (19)
    ];

    var faces = [
        new THREE.Face3(0, 2, 1),
        new THREE.Face3(1, 2, 3),
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});
    var mesh = new THREE.Mesh(geom, material);

    obj.add(mesh);

    allMeshes.push(mesh);
}

function createGround(obj){
    var groundMaterial = new THREE.MeshBasicMaterial({color: 0x606060});
    var groundGeometry = new THREE.BoxGeometry(1000, 30, 600);
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(0, -179, 0);
    
    allMeshes.push(ground);
    obj.add(ground);

}


function createSideWindows(obj) {//
    var vertices = [
        new THREE.Vector3(-210, 110, 87), //sw_0
        new THREE.Vector3(-16, 180, 71), //sw_1
        new THREE.Vector3(80, 165, 75), //sw_2 
        new THREE.Vector3(80, 130, 83), //sw_3 

        new THREE.Vector3(-210, 110, -87), //sw_4
        new THREE.Vector3(-16, 180, -71), //sw_5
        new THREE.Vector3(80, 165, -75), //sw_6
        new THREE.Vector3(80, 130, -83), //sw_7
    ];

    var faces = [
        new THREE.Face3(0, 3, 1),
        new THREE.Face3(3, 2, 1),

        new THREE.Face3(7, 4, 5),
        new THREE.Face3(7, 5, 6),
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});

    var mesh = new THREE.Mesh(geom, material);

    allMeshes.push(mesh);
    obj.add(mesh);
}

function createFaroisFront(obj) {
    var vertices = [
        new THREE.Vector3(-254, 100, 90), //0
        new THREE.Vector3(-286, 90, 52), //1
        new THREE.Vector3(-254, 95, 90), //2
        new THREE.Vector3(-286, 85, 52), //3

        new THREE.Vector3(-254, 100, -90), //4
        new THREE.Vector3(-286, 90, -52), //5
        new THREE.Vector3(-254, 95, -90), //6
        new THREE.Vector3(-286, 85, -52), //7
    ];

    var faces = [
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(1, 5, 7),
        new THREE.Face3(1, 7, 3),
        new THREE.Face3(5, 4, 6),
        new THREE.Face3(5, 6, 7),
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    console.log(geom);
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0xffffcc, wireframe: false});

    var mesh = new THREE.Mesh(geom, material);

    allMeshes.push(mesh);
    obj.add(mesh);
}

function createFaroisBack(obj) {
    var vertices = [
        new THREE.Vector3(301, 127, 90), //back_farol_0
        new THREE.Vector3(301, 127, -90), //back_farol_1
        new THREE.Vector3(301, 122, 90), //back_farol_2
        new THREE.Vector3(301, 122, -90), //back_farol_3
    ];

    var faces = [
        new THREE.Face3(0, 3, 1),
        new THREE.Face3(2, 3, 0),
    ];

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();

    var material = new THREE.MeshBasicMaterial({color: 0xff3333, wireframe: false});

    var mesh = new THREE.Mesh(geom, material);

    allMeshes.push(mesh);
    obj.add(mesh);
}

/**
 Creates the whole Structure
 */
function createStructure() {
    wholeStructure = new THREE.Object3D();
    var cyberTruck = new THREE.Object3D();
    var podium  = new THREE.Object3D();
    var ground = new THREE.Object3D();

    createPodium(podium);
    createChassis(cyberTruck);
    createModel(cyberTruck);
    createWindshield(cyberTruck);
    createSideWindows(cyberTruck);
    createFaroisFront(cyberTruck);
    createFaroisBack(cyberTruck);

    cyberTruck.position.set(0, -46, 0);

    createGround(ground);

    wholeStructure.add(podium);
    wholeStructure.add(cyberTruck); 

    scene.add(ground);
    scene.add(wholeStructure);

}

function createSpotlight(x, y, z) {
    spotlights.push(new Spotlight(x, y, z, 0, 0, 0));
}

function createDirectionalLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.intensity = 0.5;
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

    //Translation actions
    keyActions[37] = function() {rotateGroup(wholeStructure, 1);}; //Left arrow
    keyActions[39] = function() {rotateGroup(wholeStructure, -1);}; //Right arrow

    pressedKeyActions[32] = function () {spawnGlassShatteringBall()} // Spacebar

    //Camera settings
    //You pressed 4
    pressedKeyActions[52] = function () {
        camera = perspCam;
        camera.position.set(750, 250, 750);
        camera.lookAt(scene.position);
    }
    //You pressed 5
    pressedKeyActions[53] = function () {
        camera = ortCam;
        camera.position.set(0, 0, 300);
        camera.lookAt(scene.position);
    }

}

/**
 * Called at the beggining of the program
 */
function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = perspCam;
    camera.position.x = 0;
    camera.position.y = 500;
    camera.position.z = 500;
    camera.lookAt(scene.position);

    var axes = new THREE.AxesHelper(20);
    scene.add(axes);

    document.body.appendChild(renderer.domElement);

    createStructure();
    createDirectionalLight();

    //Creating spotlights
    createSpotlight(300, 300, 300);
    createSpotlight(0, 300, -450);
    createSpotlight(-300, 300, 300);

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

    if(delta > 0.02) {
        //If the player leaves the browser, the next delta will be huge. This prevents bad things from happening
        delta = 0.02;
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

    //Updating all the glass shards
    for(shard of glassShards) {
        shard.update();
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
    var deviation = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(4);
    var extraSpeed = 30 * (Math.random() - 0.5);

    var position = new THREE.Vector3(-50, 90, 500);
    var velocity = new THREE.Vector3(0, 0, -80 + extraSpeed);
    var angle = wholeStructure.rotation.y;

    rotateAroundAxis(position, new THREE.Vector3(0, 1, 0), angle);
    rotateAroundAxis(velocity, new THREE.Vector3(0, 1, 0), angle);

    var collisionPoint = position.clone().add(velocity.clone().normalize().multiplyScalar(distanceFromBallToWindow));

    velocity.add(deviation);

    new GlassBreakingBall(position, velocity, collisionPoint);
}

function ballCollidedWithWindow(position, direction) {
    if(windowBroken) {
        spawnGlassShards(Math.floor(1 + Math.random() * 3), position, direction); //1 - 3
    }
    else {
        //Window was broken for the first time
        spawnGlassShards(Math.floor(4 + Math.random() * 12), position, direction); //4 - 15
    }
}

function spawnGlassShards(amount, position, direction) {
    for(i = 0; i < amount; i++) {
        new GlassShard(position, direction);
    }
}

function rotateAroundAxis(vector, axis, angle) {
    axis = axis.clone().normalize();

    var x = vector.x;
    var y = vector.y;
    var z = vector.z;
    var x2 = axis.x;
    var y2 = axis.y;
    var z2 = axis.z;
    var cosTheta = Math.cos(angle);
    var sinTheta = Math.sin(angle);
    var dotProduct = vector.dot(axis);
    var xPrime = x2 * dotProduct * (1 - cosTheta) + x * cosTheta + (-z2 * y + y2 * z) * sinTheta;
    var yPrime = y2 * dotProduct * (1 - cosTheta) + y * cosTheta + (z2 * x - x2 * z) * sinTheta;
    var zPrime = z2 * dotProduct * (1 - cosTheta) + z * cosTheta + (-y2 * x + x2 * y) * sinTheta;

    vector.x = xPrime;
    vector.y = yPrime;
    vector.z = zPrime;

    return vector;
}

function rotateGroup(group, multiplier) {
    group.rotateY(multiplier * delta * 2 * angleSpeed * Math.PI);
}