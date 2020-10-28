const THREE = require("./three");

var renderer, scene, camera;
var clock = new THREE.Clock();
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var poolCueList= [];


//Lists of objects and objects for collision detection
var balls = [];
var walls = []; //Contains the wall's bounding boxes
var tableTop;

class Ball {
    velocity = new THREE.Vector3();
    acceleration = new THREE.Vector3(0, -9.8, 0)

    constructor() {
        

        balls.push(this);
    }
    
    /**
     * Returns a vector representing the position in which the ball will be if it moves foward, given its
     * current velocity and acceleration
     */
    getNewPosition() {
        newPosition = new THREE.Vector3();

        newPosition.x = this.getCenterPosition(0) + delta * this.velocity.x + 0.5 * delta * delta * this.acceleration.x;
        newPosition.y = this.getCenterPosition(1) + delta * this.velocity.y + 0.5 * delta * delta * this.acceleration.y;
        newPosition.z = this.getCenterPosition(2) + delta * this.velocity.z + 0.5 * delta * delta * this.acceleration.z;

        return newPosition;
    }

    getNewVelocity() {
        newVelocity = new THREE.Vector3();

        newVelocity.x = velocity.x + delta * this.acceleration.x;
        newVelocity.y = velocity.y + delta * this.acceleration.y;
        newVelocity.z = velocity.z + delta * this.acceleration.z;

        return newVelocity;
    }

    getNewAcceleration() {
        newAcceleration = new THREE.Vector3();

        //Simulating friction
        if(this.velocity.x > 0) {
            newAcceleration.x = 0.2;
        }
        if(this.velocity.z > 0) {
            newAcceleration.z = 0.2;
        }

        return newAcceleration;
    }

    getCenterPosition() {

    }

    getCenterPosition(coordinate) {

    }

    /**
     * Checks for collisions with the given wall number
     * @param {Number} wallNumber 
     * The given wall number
     * @returns {boolean}
     * True if the ball will collide with the wall
     */
    collidesWithWall(wallNumber) {
        newPosition = this.getNewPosition();
        wall = walls[wallNumber]
        
        return wall.intersectsSphere(new THREE.Sphere(newPosition, 4));
    }

    collidesWithBall(ball) {
        
    }

    findIntersectionWithWall(wallNumber) {
        wall = walls[wallNumber]
        intersenction;
        pointCandidates = [];

        for(wall in walls) {
            //Adding 4 center positions to the list
            pointCandidates.push(this.getCenterPosition().clone());
        }

        //Making the points point to the 4 sphere highest/lowest x/z points
        pointCandidates[0].x += getRadius();
        pointCandidates[1].z += getRadius();
        pointCandidates[2].x -= getRadius();
        pointCandidates[3].z -= getRadius();

        if(Math.abs(wall.min.x) == Math.abs(wall.max.x)) {
            //Dealing with an X-stretched wall
            minZ = Math.min(Math.abs(wall.min.z), Math.abs(wall.max.z));

            if(wall.max.z < 0) {
                minZ = -minZ;
            }

            multiplier = velocity.z / (minZ - this.getCenterPosition().z);
            intersection = new THREE.Vector3(velocity.x / multiplier, this.getCenterPosition().y, minZ);
        }
        else {
            //Dealing with a Z-stretched wall
            minX = Math.min(Math.abs(wall.min.x), Math.abs(wall.max.x));

            if(wall.max.x < 0) {
                minX = -minX;
            }

            multiplier = velocity.x / (minX - this.getCenterPosition().x);
            intersection = new THREE.Vector3(minX, this.getCenterPosition().y, velocity.z / multiplier);
        }

        return intersection;
    }

    processWallCollision(wallNumber) {

    }

    processBallCollision(ball) {

    }
}

class PoolCue{
    constructor(x, y, z, a, b){
        var poolCueMaterial = new THREE.MeshBasicMaterial({color: 0xff66b2});
        var poolCueGeometry = new THREE.CylinderGeometry(1, 3, 100, 30);
        var poolCue = new THREE.Mesh(poolCueGeometry, poolCueMaterial);

        poolCue.rotation.x += a * Math.PI;
        poolCue.rotation.z += b * Math.PI;
        poolCue.position.set(x, y, z);
        scene.add(poolCue);

    }
}


function createTableTop(obj, x, y, z) {
    var tableMaterial = new THREE.MeshBasicMaterial({color: 0x337900});
    var tableGeometry = new THREE.BoxGeometry(284, 16, 142);
    var table = new THREE.Mesh(tableGeometry, tableMaterial);

    table.position.set(x, y, z);
    
    obj.add(table);
}

function addTableHole(obj, x, y, z) {
    var holeMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var holeGeometry = new THREE.CylinderGeometry(4, 4, 1, 30);
    var hole = new THREE.Mesh(holeGeometry, holeMaterial);

    hole.position.set(x, y, z);

    obj.add(hole);
}

function addTableLeg(obj, x, y, z) {
    var legMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    var legGeometry = new THREE.CylinderGeometry(12, 8, 80, 30);
    var leg = new THREE.Mesh(legGeometry, legMaterial);

    leg.position.set(x, y, z);

    obj.add(leg);
}

function addLateralInnerWall(obj, x, y, z) {
    var wallMaterial = new THREE.MeshBasicMaterial({color: 0x339600});
    var wallGeometry = new THREE.BoxGeometry(304, 24, 10);
    var wall = new THREE.Mesh(wallGeometry, wallMaterial);

    wall.position.set(x, y, z);

    walls.push(wall);

    wallGeometry.computeBoundingBox();

    box = wallGeometry.boundingBox.clone().applyMatrix4(wall.matrixWorld);
    box.translate(wall.position);

    obj.add(wall);
}

function addLateralOuterWall(obj, x, y, z) {
    var wallMaterial = new THREE.MeshBasicMaterial({color: 0x703300});
    var wallGeometry = new THREE.BoxGeometry(324, 24, 10);
    var wall = new THREE.Mesh(wallGeometry, wallMaterial);

    wall.position.set(x, y, z);

    obj.add(wall);
}

function addBaseInnerWall(obj, x, y, z) {
    var wallMaterial = new THREE.MeshBasicMaterial({color: 0x339600});
    var wallGeometry = new THREE.BoxGeometry(10, 24, 142);
    var wall = new THREE.Mesh(wallGeometry, wallMaterial);

    wall.position.set(x, y, z);

    walls.push(wall);

    wallGeometry.computeBoundingBox();

    box = wallGeometry.boundingBox.clone().applyMatrix4(wall.matrixWorld);
    box.translate(wall.position);

    obj.add(wall);
}

function addBaseOuterWall(obj, x, y, z) {
    var wallMaterial = new THREE.MeshBasicMaterial({color: 0x703300});
    var wallGeometry = new THREE.BoxGeometry(10, 24, 162);
    var wall = new THREE.Mesh(wallGeometry, wallMaterial);

    wall.position.set(x, y, z);

    obj.add(wall);
}

function createStructure() {
    var table = new THREE.Object3D();

    var holeRadius = 4;

    // crates the table top
    createTableTop(table, 0, 0, 0);

    // creates the holes
    addTableHole(table, -142 + holeRadius, 8, -71 + holeRadius);
    addTableHole(table, -142 + holeRadius, 8, 71 - holeRadius);
    addTableHole(table, 142 - holeRadius, 8, -71 + holeRadius);
    addTableHole(table, 142 - holeRadius, 8, 71 - holeRadius);
    addTableHole(table, 0, 8, -71 + holeRadius);
    addTableHole(table, 0, 8, 71 - holeRadius);

    // creates the legs fo the table
    addTableLeg(table, -106.5, -48, -35.5);
    addTableLeg(table, -106.5, -48, 35.5);
    addTableLeg(table, 106.5, -48, -35.5);
    addTableLeg(table, 106.5, -48, 35.5);

    // create green padding walls
    addLateralInnerWall(table, 0, 4, 76);
    addLateralOuterWall(table, 0, 4, 86);
    addLateralInnerWall(table, 0, 4, -76);
    addLateralOuterWall(table, 0, 4, -86);
    addBaseInnerWall(table, -147, 4, 0);
    addBaseOuterWall(table, -157, 4, 0);
    addBaseInnerWall(table, 147, 4, 0);
    addBaseOuterWall(table, 157, 4, 0);

    // create pool cues
    poolCueList.push(new PoolCue(222, 8, 0, 0, 0.5 ));
    poolCueList.push(new PoolCue(-222, 8, 0, 0, -0.5 ));
    poolCueList.push(new PoolCue(-54, 8, 141, -0.5, 0));
    poolCueList.push(new PoolCue(54, 8, 141, -0.5, 0));
    poolCueList.push(new PoolCue(-54, 8, -141, 0.5, 0));
    poolCueList.push(new PoolCue(54, 8, -141, 0.5, 0));



    scene.add(table);
}

/**
 * Renders the whole Structure
 */
function render() {
    'use strict';

    updatePositionsAndCheckCollisions();
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
    camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = 200;
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

/**
 * Called when a key is pressed
 * @param {*} e 
 * Info about the pressed key
 */
function onKeyDown(e) {
    'use strict';
    var key = e.keyCode;

    pressedKeys[key] = true;

    if(key in pressedKeyActions) {
        pressedKeyActions[key]();
    }
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

function addKeyActions() {

}

function updatePositionsAndCheckCollisions() {

}

function animate() {


    //Calling every active key actions
    for(var key in pressedKeys) {
        if(key in keyActions) {
            keyActions[key]();
        }
    }
}