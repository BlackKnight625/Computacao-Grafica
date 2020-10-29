var renderer, scene, camera;
var clock = new THREE.Clock();
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};

var balls = [];
var whiteBalls = [];
var delta = 0;
var poolCueList= [];
var selectedCue = undefined;

var floorY;

//Lists of objects and objects for collision detection
var balls = [];
var walls = []; //Contains the wall's bounding boxes
var tableTop;

class Ball {
    velocity = new THREE.Vector3(0, 0, 0);
    acceleration = new THREE.Vector3(0, 0, 0);


    constructor(radius) {
        this.radius = radius;

        var color = [];
        var red = Math.floor(Math.random() * 256);
        var green = Math.floor(Math.random() * 256);
        var blue = Math.floor(Math.random() * 256);

        color.push(red);
        color.push(green);
        color.push(blue);

        color = this.goodColor(color);

        var ballColor = new THREE.Color(color[0]/255, color[1]/255, color[2]/255);

        var ballMaterial = new THREE.MeshBasicMaterial({color: ballColor});
        var ballGeometry = new THREE.SphereGeometry(radius, 30, 30);
        var mesh = new THREE.Mesh(ballGeometry, ballMaterial);

        scene.add(mesh);

        var x = this.getRndInteger(-130, 130);
        var y = 8+radius/2;
        var z = this.getRndInteger(-58, 58);

        mesh.position.set(x, y, z)

        var pos = this.goodPosition(x, y, z);

        mesh.position.set(pos[0], pos[1], pos[2]);

        this.mesh = mesh;
    }

    getPosition() {
        return this.mesh.position;
    }

    setPosition(newPosition) {
        this.mesh.position.set(newPosition.x, newPosition.y, newPosition.z);
    }

    goodPosition(x, y, z) {
        var pos = [];
        pos.push(x);
        pos.push(y);
        pos.push(z);

        var ball_pos;
        for (var i = 0; i < balls.length; i++) {
            ball_pos = balls[i].getPosition();
            if (distanceBetween(x, z, ball_pos.x, ball_pos.z) < this.radius) {
                pos[0] = this.getRndInteger(-130, 130);
                pos[2] = this.getRndInteger(-58, 58);
                return this.goodPosition(pos[0], pos[1], pos[2]);
            }
        }

        return pos;
    }

    goodColor(color) {
        var tableTopColor = [51, 121, 0];
        var holeColor = [0, 0, 0];
        var wallColor = [112, 51, 0];
        var white = [255, 255, 255];

        var dif = 0;
        for (var i = 0; i < 3; i++) {
            dif += Math.abs(color[i] - tableTopColor[i]);
        }
        if (dif <= 40) {
            color[0] = 255;
            color[1] += 40; 
        }

        dif = 0;
        for (var i = 0; i < 3; i++) {
            dif += Math.abs(color[i] - holeColor[i]);
        }
        if (dif <= 40) {
            color[0] = 255;
            color[2] = 100;
        }

        dif = 0;
        for (var i = 0; i < 3; i++) {
            dif += Math.abs(color[i] - wallColor[i]);
        }
        if (dif <= 40) {
            color[2] = 255;
        }
    
        dif = 0;
        for (var i = 0; i < 3; i++) {
            dif += Math.abs(color[i] - white[i]);
        }
        if (dif <= 40) {
            color[1] = 50;
            color[2] = 200;
        }

        return color;
    }

    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    getMesh() {
        return this.mesh;
    }

    /**
     * Returns a vector representing the position in which the ball will be if it moves foward, given its
     * current velocity and acceleration
     * @param {Number} multiplier
     * A multiplier for the position (ex: a multiplier of 0.5 means the returned position will be
     * half-way of the actual position)
     */
    getNewPosition(multiplier = 1) {
        var newPosition = new THREE.Vector3();

        var time = delta * multiplier;

        newPosition.x = this.getPosition().x + time * this.velocity.x + 0.5 * time * time * this.acceleration.x;
        newPosition.y = this.getPosition().y + time * this.velocity.y + 0.5 * time * time * this.acceleration.y;
        newPosition.z = this.getPosition().z + time * this.velocity.z + 0.5 * time * time * this.acceleration.z;

        console.log("GetNewPosition", multiplier, time, this.getPosition(), newPosition);

        return newPosition;
    }

    getNewVelocity() {
        var newVelocity = new THREE.Vector3();

        newVelocity.x = this.velocity.x + delta * this.acceleration.x;
        newVelocity.y = this.velocity.y + delta * this.acceleration.y;
        newVelocity.z = this.velocity.z + delta * this.acceleration.z;

        return newVelocity;
    }

    getNewAcceleration() {
        var newAcceleration = new THREE.Vector3();

        //Simulating friction
        if(this.velocity.x > 0) {
            newAcceleration.x = 0.2;
        }
        if(this.velocity.z > 0) {
            newAcceleration.z = 0.2;
        }

        return newAcceleration;
    }

    updateBall(multiplier = 1) {
        for(var i = 0; i < walls.length; i++) {
            var wall = walls[i];
            if(this.collidesWithWall(wall, multiplier)) {
                var intersection = this.findIntersectionWithWall(wall, this.getNewPosition(multiplier));

                this.processWallCollision(intersection.intersection, intersection.normal, intersection.fraction);
                return;
            }
        }

        for(var i = 0; i < balls.length; i++) {
            var ball = balls[i];
            if(ball != this) {
                if(this.collidesWithBall(ball)) {
                    //TODO
                }
            }
        }

        if(this.collidesWithFloor()) {
            //TODO
        }

        console.log("Previous position: ", this.getPosition());
        this.setPosition(this.getNewPosition(multiplier));
        console.log("New position: ", this.getPosition());

        this.velocity = this.getNewVelocity();
        this.acceleration = this.getNewAcceleration();
    }

    /**
     * Checks for collisions with the given wall number
     * @param {any} wall 
     * The given wall number
     * @param {Number} multiplier
     * Position multiplier
     * @returns {boolean}
     * True if the ball will collide with the wall
     */
    collidesWithWall(wall, multiplier) {
        var newPosition = this.getNewPosition(multiplier);
        
        return wall.intersectsSphere(new THREE.Sphere(newPosition, 4));
    }

    collidesWithBall(ball) {
        return false;
    }

    collidesWithFloor() {
        if(this.getPosition().y > -20) {
            return true;
        }
        else {
            //TODO Check if ball is above one of the holes
            if(this.getPosition().y - this.radius >= floorY) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    findIntersectionWithWall(wall, newPosition) {
        var intersection;
        var fraction;
        var normal;

        if(Math.abs(wall.min.x) == Math.abs(wall.max.x)) {
            //Dealing with an X-stretched wall
            var minZ = Math.min(Math.abs(wall.min.z), Math.abs(wall.max.z));

            if(wall.max.z < 0) {
                minZ = -minZ;
            }

            fraction = newPosition.z / (minZ - this.getPosition().z);
            intersection = new THREE.Vector3(newPosition.x / fraction, this.getPosition().y, minZ);
            normal = new THREE.Vector3(0, 0, (Math.abs(minZ) / minZ));
        }
        else {
            //Dealing with a Z-stretched wall
            var minX = Math.min(Math.abs(wall.min.x), Math.abs(wall.max.x));

            if(wall.max.x < 0) {
                minX = -minX;
            }

            fraction = newPosition.x / (minX - this.getPosition().x);
            intersection = new THREE.Vector3(minX, this.getPosition().y, newPosition.z / fraction);
            normal = new THREE.Vector3((Math.abs(minX) / minX), 0, 0);
        }

        console.log("Normal: ", normal);

        return {"intersection": intersection, "normal": normal, "fractionLeft": fraction};
    }

    processWallCollision(intersection, normal, fraction) {
        this.velocity.applyAxisAngle(normal, Math.PI / 2);

        //Placing the ball adjacent to the intersection position
        this.setPosition(intersection.add(normal.multiplyScalar(this.radius)));

        //Given the ball's new position due to the collision and its remaining travelling, calculate other collisions
        this.updateBall(fraction);
    }

    processBallCollision(ball) {

    }
}

class WhiteBall extends Ball {
    constructor(x, y, z, radius) {
        super();
        
        var ballMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        var ballGeometry = new THREE.SphereGeometry(radius, 30, 30);
        var mesh = new THREE.Mesh(ballGeometry, ballMaterial);

        scene.add(mesh);

        mesh.position.set(x, y, z);

        this.mesh = mesh;
    }
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}

class PoolCue{
    constructor(x, y, z, a, b){
        var poolCueMaterial = new THREE.MeshBasicMaterial({color: 0xff66b2});
        var poolCueGeometry = new THREE.CylinderGeometry(1, 3, 100, 30);
        var poolCue = new THREE.Mesh(poolCueGeometry, poolCueMaterial);

        poolCue.rotation.x += a * Math.PI;
        poolCue.rotation.z += b * Math.PI;

        if (a == 0) { // one of the two edged cues
            if (x > 0) {
                poolCue.position.set(50, 0, 0);
            } else {
                poolCue.position.set(-50, 0, 0);
            }
        } else {
            if (z > 0) {
                poolCue.position.set(0, 0, 50);
            } else {
                poolCue.position.set(0, 0, -50);
            }
        }

        var mesh = new THREE.Object3D();
        mesh.add(poolCue);

        scene.add(mesh);
        mesh.position.set(x, y, z);

        this.mesh = mesh;
        this.theta = 0;
        this.limit = Math.PI / 3.0;
    }

    shoot() {
        console.log("bam");
    }

    rotate(theta) {
        if (theta > 0 && this.theta > this.limit) {
            return;
        } else if (theta < 0 && this.theta < -1*this.limit) {
            return;
        }
        this.mesh.rotation.y += (Math.PI * theta);
        this.theta += (Math.PI * theta);
    }
}


function createTableTop(obj, x, y, z) {
    var tableMaterial = new THREE.MeshBasicMaterial({color: 0x337900});
    var tableGeometry = new THREE.BoxGeometry(284, 16, 142);
    var table = new THREE.Mesh(tableGeometry, tableMaterial);

    floorY = y + 8;

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

    wallGeometry.computeBoundingBox();

    box = wallGeometry.boundingBox.clone().applyMatrix4(wall.matrixWorld);
    box.translate(wall.position);

    walls.push(box);

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

    wallGeometry.computeBoundingBox();

    box = wallGeometry.boundingBox.clone().applyMatrix4(wall.matrixWorld);
    box.translate(wall.position);

    walls.push(box);

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

    // create padding walls
    addLateralInnerWall(table, 0, 4, 76);
    addLateralOuterWall(table, 0, 4, 86);
    addLateralInnerWall(table, 0, 4, -76);
    addLateralOuterWall(table, 0, 4, -86);
    addBaseInnerWall(table, -147, 4, 0);
    addBaseOuterWall(table, -157, 4, 0);
    addBaseInnerWall(table, 147, 4, 0);
    addBaseOuterWall(table, 157, 4, 0);

    var ballRadius = holeRadius - 0.5;

    // add 15 balls
    for (var i = 0; i < 15; i++) {
        balls.push(new Ball(ballRadius));
    }
    balls.push(new Ball(holeRadius-0.5));
    balls[balls.length-1].velocity.add(new THREE.Vector3(10, 0, 0));

    // create pool cues
    poolCueList.push(new PoolCue(222 - 50, 8, 0, 0, 0.5 ));
    poolCueList.push(new PoolCue(-222 + 50, 8, 0, 0, -0.5 ));
    poolCueList.push(new PoolCue(-54, 8, 141 - 50, -0.5, 0));
    poolCueList.push(new PoolCue(54, 8, 141 - 50, -0.5, 0));
    poolCueList.push(new PoolCue(-54, 8, -141 + 50, 0.5, 0));
    poolCueList.push(new PoolCue(54, 8, -141 + 50, 0.5, 0));

    // add white balls
    whiteBalls.push(new WhiteBall(-142 + ballRadius, 8+ballRadius, 0, ballRadius));
    whiteBalls.push(new WhiteBall(142 - ballRadius, 8+ballRadius, 0, ballRadius));
    whiteBalls.push(new WhiteBall(54, 8+ballRadius, -71 + ballRadius, ballRadius));
    whiteBalls.push(new WhiteBall(-54, 8+ballRadius, -71 + ballRadius, ballRadius));
    whiteBalls.push(new WhiteBall(54, 8+ballRadius, 71 - ballRadius, ballRadius));
    whiteBalls.push(new WhiteBall(54, 8+ballRadius, -71 + ballRadius, ballRadius));

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
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
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

    console.log(key);

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

function selectCue(i) {
    selectedCue = i;
}

function shootBall() {
    if (selectedCue != undefined) {
        poolCueList[selectedCue].shoot();
    }
}

function rotateCue(theta) {
    if (selectedCue != undefined) {
        poolCueList[selectedCue].rotate(theta);
    }
}

function addKeyActions() {
    // PoolCue Select Keys
    pressedKeyActions[52] = function () {selectCue(0);}; //4
    pressedKeyActions[53] = function () {selectCue(1);}; //5
    pressedKeyActions[54] = function () {selectCue(2);}; //6
    pressedKeyActions[55] = function () {selectCue(3);}; //7
    pressedKeyActions[56] = function () {selectCue(4);}; //8
    pressedKeyActions[57] = function () {selectCue(5);}; //9

    pressedKeyActions[32] = function () {shootBall();}; // space

    keyActions[39] = function () {rotateCue(0.02);}; // ->
    keyActions[37] = function () {rotateCue(-0.02);}; // <-
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

    // calling every single action key
    for (var key in pressedKeys) {
        if (key in pressedKeyActions) {
            pressedKeyActions[key]();
            delete pressedKeys[key];
        }
    }

    //Dealing with collisions for all balls
    for(i in balls) {
        balls[i].updateBall();
    }
}