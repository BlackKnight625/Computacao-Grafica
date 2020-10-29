var renderer, scene, camera;
var clock = new THREE.Clock();
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};

var balls = [];
var holes = [];
var delta = 0;
var poolCueList= [];
var selectedCue = undefined;
var initiatedShot = false;
var goalBall; //Ball to be followed by the mobile camera
var holeRadius = 4;
var ballDefaultY = 8;

var floorY;

var ortCam = new THREE.OrthographicCamera(window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4,
    -200, 500);

var perspCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

var mobileCam = false;

//Lists of objects and objects for collision detection
var balls = [];
var walls = []; //Contains the wall's bounding boxes
var tableTop;

class Ball {
    velocity = new THREE.Vector3(0, 0, 0);
    acceleration = new THREE.Vector3(0, 0, 0);
    defaultAcceleration = new THREE.Vector3(0, 0, 0);
    insideHole = null;

    constructor(radius) {
        this.radius = radius;

        // creates a random color
        var color = [];
        var red = Math.floor(Math.random() * 256);
        var green = Math.floor(Math.random() * 256);
        var blue = Math.floor(Math.random() * 256);

        color.push(red);
        color.push(green);
        color.push(blue);

        color = this.goodColor(color);

        // creates the mesh with respective material and geometry
        var ballColor = new THREE.Color(color[0]/255, color[1]/255, color[2]/255);

        var ballMaterial = new THREE.MeshBasicMaterial({color: ballColor});
        var ballGeometry = new THREE.SphereGeometry(radius, 30, 30);
        var ball = new THREE.Mesh(ballGeometry, ballMaterial);

        var mesh = new THREE.Object3D();
        mesh.add(ball);
		mesh.add(new THREE.AxesHelper(6));

        scene.add(mesh);

        // sets the ball in a random position
        var x = this.getRndInteger(-130, 130);
        var y = ballDefaultY + radius;
        var z = this.getRndInteger(-58, 58);

        mesh.position.set(x, y, z)

        var pos = this.goodPosition(x, y, z);

        mesh.position.set(pos[0], pos[1], pos[2]);

        // sets some random velocity 
        x = this.getRndInteger(-100, 100);
        z = this.getRndInteger(-100, 100);
        this.velocity.add(new THREE.Vector3(x, 0, z));

        this.mesh = mesh;
    }

    setColor(color) {
        this.mesh.children[0].material.color = color;
    }

    isOnTopOfTable() {
        return this.getPosition().y >= ballDefaultY + this.radius;
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
            if (distanceBetween(x, z, ball_pos.x, ball_pos.z) < 2*this.radius) {
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
        if(this.velocity.length() > 0.01) {
            var newAcceleration = this.velocity.clone().normalize().multiplyScalar(-10);
            newAcceleration.set(newAcceleration.x, this.acceleration.y, newAcceleration.z);

            return newAcceleration;
        }
        else {
            return this.defaultAcceleration.clone();
        }
    }

    updateBall(multiplier = 1) {
        for(var i = 0; i < walls.length; i++) {
            var wall = walls[i];
            if(this.collidesWithWall(wall, multiplier)) {
                var intersection = this.findIntersectionWithWall(wall, this.getNewPosition(multiplier));

                this.processWallCollision(intersection["intersection"], intersection["normal"], intersection["fractionLeft"], multiplier);
                return;
            }
        }

        for(var i = 0; i < balls.length; i++) {
            var ball = balls[i];
            if(ball != this) {
                if(this.collidesWithBall(ball)) {
                    var intersection = this.findIntersectionWithBall(ball, this.getNewPosition(multiplier));

                    this.processBallCollision(ball, intersection["intersection"], intersection["position"], intersection["fractionLeft"], multiplier);
                    return;
                }
            }
        }

        if(this.insideHole != null) {
            var newPositon = this.getNewPosition(multiplier);
            //The ball is inside a hole. Make sure it doesn't get out of it
            if(distanceBetween(this.insideHole.x, this.insideHole.z, newPositon.x, newPositon.z) > holeRadius) {
                this.velocity.set(-this.velocity.x, this.velocity.y, -this.velocity.z);
            }

            if(newPositon.y < 0) {
                //Preventing the ball from further bouncing
                this.insideHole = null;
            }
        }
        else if(this.collidesWithHole()) {
            //Intersection not needed. Processing is done here
            this.acceleration.set(this.acceleration.x, -50, this.acceleration.z);
        }
        else {
            if(this.getPosition().y > 0) {
                //Balls that are above y 0 cannot have y velocity
                this.velocity.y = 0;
            }
        }

        var newPosition = this.getNewPosition(multiplier);
        var previousToNew = newPosition.clone().sub(this.getPosition());

        //Updating vectors
        this.setPosition(newPosition);
        this.velocity = this.getNewVelocity();
        this.acceleration = this.getNewAcceleration();

        if(previousToNew.length() > 0.01) {
            //The object moved enough to perform a rotation
            var rotationAxis = new THREE.Vector3(0, 1, 0).cross(previousToNew).normalize();

            this.mesh.rotateOnWorldAxis(rotationAxis, previousToNew.length() / (2 * Math.PI * this.radius));
        }

        if(this.velocity.length() < 0.01) {
            //Velocity too low. Set it to 0
            this.velocity = new THREE.Vector3(0, 0, 0);
        }
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
        
        //If the ball collides with a wall, the 1 of 4 axis-alignes points will be inside the wall
        var points = [];

        points.push(newPosition.clone().add(new THREE.Vector3(this.radius, 0, 0)));
        points.push(newPosition.clone().add(new THREE.Vector3(-this.radius, 0, 0)));
        points.push(newPosition.clone().add(new THREE.Vector3(0, 0, this.radius)));
        points.push(newPosition.clone().add(new THREE.Vector3(0, 0, -this.radius)));

        //Checking if one of the points is inside the wall
        for(i in points) {
            var point = points[i];
            if(point.x > wall.min.x && point.z > wall.min.z && point.x < wall.max.x && point.z < wall.max.z) {
                return true;
            }
        }

        return false;
    }

    collidesWithBall(ball, multiplier) {
        var newPosition = this.getNewPosition(multiplier);
        var distance = newPosition.distanceTo(ball.getPosition());

        return distance < (this.radius + ball.radius);
    }

    collidesWithHole() {
        var newPosition = this.getNewPosition();

        for(i in holes) {
            var hole = holes[i];

            if(distanceBetween(hole.x, hole.z, newPosition.x, newPosition.z) <= holeRadius && newPosition.y > 0) {
                this.insideHole = hole;
                return true;
            }
        }
    }

    findIntersectionWithWall(wall, newPosition) {
        var intersection;
        var fraction;
        var normal;
        var sign;

        if(Math.abs(wall.min.x) == Math.abs(wall.max.x)) {
            //Dealing with an X-stretched wall
            var minZ = Math.min(Math.abs(wall.min.z), Math.abs(wall.max.z));

            if(wall.max.z < 0) {
                minZ = -minZ;
                sign = -1;
            }
            else {
                sign = 1;
            }

            fraction = (minZ - this.getPosition().z - sign * this.radius) / (newPosition.z - this.getPosition().z);
            intersection = new THREE.Vector3(this.getPosition().x + (newPosition.x - this.getPosition().x) * fraction, this.getPosition().y, minZ);
            normal = new THREE.Vector3(0, 0, (Math.abs(minZ) / minZ));
        }
        else {
            //Dealing with a Z-stretched wall
            var minX = Math.min(Math.abs(wall.min.x), Math.abs(wall.max.x));

            if(wall.max.x < 0) {
                minX = -minX;
                sign = -1;
            }
            else {
                sign = 1;
            }

            fraction = (minX - this.getPosition().x - sign * this.radius) / (newPosition.x - this.getPosition().x);
            intersection = new THREE.Vector3(minX, this.getPosition().y, this.getPosition().z + (newPosition.z - this.getPosition().z) * fraction);
            normal = new THREE.Vector3((Math.abs(minX) / minX), 0, 0);
        }

        normal.normalize();

        return {"intersection": intersection, "normal": normal, "fractionLeft": fraction};
    }

    findIntersectionWithBall(ball, newPosition) {
        var oldToNew = newPosition.clone().sub(this.getPosition());
        var currentDistance = 1;
        var centerDistance = newPosition.distanceTo(ball.getPosition());
        var increment = 0.5;
        var position = newPosition.clone();

        //Going back and forth to place the position near the colliding position
        for(var i = 0; i < 20; i++) {
            centerDistance = position.distanceTo(ball.getPosition());

            if(centerDistance > this.radius + ball.radius) {
                //Position is far from the ball. Get him closer
                currentDistance += increment;
            }
            else {
                //Position is inside the ball. Get him farther
                currentDistance -= increment;
            }

            increment = increment / 2;

            //Moving the position back or forth
            position = this.getPosition().clone().add(oldToNew.clone().multiplyScalar(currentDistance));
        }

        //At this point, the position is pretty close to the other ball, almost adjacent
        var positionToBall = ball.getPosition().clone().sub(position).normalize().multiplyScalar(this.radius);
        var intersection = position.clone().add(positionToBall);

        //Fraction of the trajectory that was lost due to the collision
        var fraction = 1.0 - currentDistance;

        return {"intersection": intersection, "position": position, "fractionLeft": fraction};
    }

    processWallCollision(intersection, normal, fraction, multiplier) {
        //Reflecting the velocity
        if(Math.abs(normal.x) > 0) {
            this.velocity.set(-this.velocity.x, this.velocity.y, this.velocity.z);
        }
        else {
            this.velocity.set(this.velocity.x, this.velocity.y, -this.velocity.z);
        }

        this.acceleration = this.getNewAcceleration();

        console.log()

        //Placing the ball adjacent to the intersection position
        this.setPosition(intersection.add(normal.multiplyScalar(-this.radius)));

        //Given the ball's new position due to the collision and its remaining travelling, calculate other collisions
        this.updateBall(fraction * multiplier);
    }

    processBallCollision(ball, intersection, position, fraction, multiplier) {
        var positionToBall = ball.getPosition().clone().sub(position); //x2 - x1
        var ballToPosition = position.clone().sub(ball.getPosition()); //x1 - x2
        
        //Calculating resulting velocity for this ball due to the elastic collision
        // <v1 - v2, x1 - x2>
        var dotProduct = ballToPosition.dot(this.velocity.clone().sub(ball.velocity));

        // ||x1 - x2|| ^2
        var lengthSqr = ballToPosition.lengthSq();

        var aux = ballToPosition.clone().multiplyScalar(dotProduct / lengthSqr);

        var newThisVelocity = this.velocity.clone().sub(aux);

        //Calculating resulting velocity for the other ball due to the elastic collision
        // <v1 - v2, x1 - x2>
        var dotProduct = positionToBall.dot(ball.velocity.clone().sub(this.velocity));

        // ||x1 - x2|| ^2
        var lengthSqr = positionToBall.lengthSq();

        var aux = positionToBall.clone().multiplyScalar(dotProduct / lengthSqr);

        this.velocity = newThisVelocity;
        ball.velocity.sub(aux);

        this.setPosition(position);

        if(this.collidesWithBall(ball)) {
            //This ball is consistently colliding with the other ball
            return;
        }

        this.updateBall(fraction * multiplier);
    }
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}

class State {
    constructor(poolCue) {
        this.poolCue = poolCue;
        this.traveled = 0;
    }

    updatePosition() {
        switch(this.poolCue.place) {
            case 0:
                this.poolCue.mesh.translateX(this.velocity.x*delta*-1);
                break;
            case 1:
                this.poolCue.mesh.translateX(this.velocity.x*delta);
                break;
            case 2:
                this.poolCue.mesh.translateZ(this.velocity.x*delta*-1);
                break;
            case 3:
                this.poolCue.mesh.translateZ(this.velocity.x*delta);
                break;
            default:
                break;
        }
    }
}

class Retract extends State {
    constructor(poolCue) {
        super(poolCue);
        this.velocity = new THREE.Vector3(-80, 0, 0);
    }

    updatePosition() {
        super.updatePosition();
        this.traveled += this.velocity.x*delta;

        if (this.traveled <= -50) {
            this.poolCue.setState(new Advance(this.poolCue));
        }
    }
}

class Advance extends State {
    constructor(poolCue) {
        super(poolCue);
        this.velocity = new THREE.Vector3(160, 0, 0);
    }

    updatePosition() {
        super.updatePosition();
        this.traveled += this.velocity.x*delta;

        if (this.traveled >= 70) {
            this.poolCue.setState(new BackToOrigin(this.poolCue));

            var ball = this.poolCue.ball;
            if (ball != null) {

                for (var i = 0; i < balls.length; i++) {
                    if (balls[i] != ball && ball.collidesWithBall(balls[i])) {
                        return;
                    }
                }

                switch(this.poolCue.place) {
                    case 0:
                        var theta = (Math.PI/2) -this.poolCue.mesh.rotation.y;
                        var x = 100 * Math.sin(theta);
                        var z = 100 * Math.cos(theta); 
                        console.log(x, z);
                        ball.velocity = new THREE.Vector3(x, 0, z);
                        balls.push(ball);
                        break;
                    case 1:
                        theta = (Math.PI/2) -this.poolCue.mesh.rotation.y;
                        var x = 100 * Math.sin(theta);
                        var z = -100 * Math.cos(theta); 
                        ball.velocity = new THREE.Vector3(x, 0, z);
                        balls.push(ball);
                        break;
                    case 2:
                        theta = (Math.PI/2) -this.poolCue.mesh.rotation.y;
                        var x = -100 * Math.cos(theta);
                        var z = 100 * Math.sin(theta);
                        ball.velocity = new THREE.Vector3(x, 0, z);
                        balls.push(ball);
                        break;
                    case 3:
                        theta = (Math.PI/2) -this.poolCue.mesh.rotation.y;
                        var x = 100 * Math.cos(theta);
                        var z = 100 * Math.sin(theta);
                        ball.velocity = new THREE.Vector3(x, 0, z);
                        balls.push(ball);
                        break;
                    default:
                        break;
                }
                console.log(this.poolCue);
                this.poolCue.ball = null;
            }
        }
    }
}

class BackToOrigin extends State {
    constructor(poolCue) {
        super(poolCue);
        this.velocity = new THREE.Vector3(-50, 0, 0);
    }

    updatePosition() {
        super.updatePosition();
        this.traveled += this.velocity.x*delta;

        if (this.traveled <= -20) {
            this.poolCue.setState(new Retract(this.poolCue));
            initiatedShot = false;
            this.poolCue.mesh.position.x = this.poolCue.defaultPosition.x;
            this.poolCue.mesh.position.z = this.poolCue.defaultPosition.z;
        }
    }
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
                poolCue.position.set(50+23.5, 0, 0);
                this.place = 0; // right cue
            } else {
                poolCue.position.set(-50-23.5, 0, 0);
                this.place = 1; // left cue
            }
        } else {
            if (z > 0) {
                poolCue.position.set(0, 0, 50+23.5);
                this.place = 2; // closer cues
            } else {
                poolCue.position.set(0, 0, -50-23.5);
                this.place = 3; // further cues
            }
        }

        var mesh = new THREE.Object3D();
        mesh.add(poolCue);

        scene.add(mesh);
        mesh.position.set(x, y, z);

        this.mesh = mesh;
        this.theta = 0;
        this.limit = Math.PI / 3.0;
        this.state = new Retract(this);
        this.defaultPosition = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    }

    setBall(ball) {
        this.ball = ball;
    }

    setState(state) {
        this.state = state;
    }

    unselect() {
        this.mesh.children[0].material.color = new THREE.Color(0xff66b2);
    }

    select() {
        this.mesh.children[0].material.color = new THREE.Color(0x000000);
    }

    shoot() {
        this.state.updatePosition();
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
    var holeGeometry = new THREE.CylinderGeometry(holeRadius, holeRadius, 1, 30);
    var hole = new THREE.Mesh(holeGeometry, holeMaterial);

    hole.position.set(x, y, z);

    holes.push(new THREE.Vector3(x, y, z));

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

    // create pool cues
    poolCueList.push(new PoolCue(212 - (50+23.5), 17, 0, 0, 0.5 ));
    poolCueList.push(new PoolCue(-212 + (50+23.5), 17, 0, 0, -0.5 ));
    poolCueList.push(new PoolCue(-54, 17, 141 - (50+23.5), -0.5, 0));
    poolCueList.push(new PoolCue(54, 17, 141 - (50+23.5), -0.5, 0));
    poolCueList.push(new PoolCue(-54, 17, -141 + (50+23.5), 0.5, 0));
    poolCueList.push(new PoolCue(54, 17, -141 + (50+23.5), 0.5, 0));

    // add white balls
    var ball = new Ball(ballRadius);
    ball.setPosition(new THREE.Vector3(142 - ballRadius, 8+ballRadius, 0));
    ball.setColor(new THREE.Color(0xFFFFFF));
    poolCueList[0].setBall(ball);
    console.log(ball);

    ball = new Ball(ballRadius);
    ball.setPosition(new THREE.Vector3(-142 + ballRadius, 8+ballRadius, 0));
    ball.setColor(new THREE.Color(0xFFFFFF));
    poolCueList[1].setBall(ball);

    ball = new Ball(ballRadius);
    ball.setPosition(new THREE.Vector3(-54, 8+ballRadius, 71 - ballRadius));
    ball.setColor(new THREE.Color(0xFFFFFF));
    poolCueList[2].setBall(ball);

    ball = new Ball(ballRadius);
    ball.setPosition(new THREE.Vector3(54, 8+ballRadius, 71 - ballRadius));
    ball.setColor(new THREE.Color(0xFFFFFF));
    poolCueList[3].setBall(ball);

    ball = new Ball(ballRadius);
    ball.setPosition(new THREE.Vector3(-54, 8+ballRadius, -71 + ballRadius));
    ball.setColor(new THREE.Color(0xFFFFFF));
    poolCueList[4].setBall(ball);

    ball = new Ball(ballRadius);
    ball.setPosition(new THREE.Vector3(54, 8+ballRadius, -71 + ballRadius));
    ball.setColor(new THREE.Color(0xFFFFFF));
    poolCueList[5].setBall(ball);

    //set goalBall which will be followed by the mobile camera
    goalBall = balls[0]; 

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

    camera = perspCam
    camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = 200;
    camera.lookAt(scene.position);

    var axes = new THREE.AxesHelper(20);
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

function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        perspCam.aspect = window.innerWidth / window.innerHeight;
        perspCam.updateProjectionMatrix();

        ortCam.left = window.innerWidth / - 4;
        ortCam.right = window.innerWidth / 4;
        ortCam.top = window.innerHeight / 4;
        ortCam.bottom = window.innerHeight / - 4;
        ortCam.updateProjectionMatrix();
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
    if (selectedCue == i) {
        return;
    } else if (initiatedShot) {
        return;
    } else if (selectedCue != undefined) {
        poolCueList[selectedCue].unselect();
    }
    selectedCue = i;
    poolCueList[selectedCue].select();
}

function shootBall() {
    initiatedShot = true;
}

function rotateCue(theta) {
    if (initiatedShot) {
        return;
    } else if (selectedCue != undefined) {
        poolCueList[selectedCue].rotate(delta*theta);
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

    keyActions[39] = function () {rotateCue(0.2);}; // ->
    keyActions[37] = function () {rotateCue(-0.2);}; // <-

    pressedKeyActions[49] = function () {
        mobileCam = false;
        camera = ortCam;
        camera.position.set(0, 200, 0);
        camera.lookAt(scene.position);
    }

    pressedKeyActions[50] = function () {
        mobileCam = false;
        camera = perspCam;
        camera.position.set(250, 200, 250);
        camera.lookAt(scene.position);
    }

    pressedKeyActions[51] = function () {
        camera = perspCam;
        var ball_pos = balls[0].getPosition();
        camera.position.set(ball_pos.x - 10, ball_pos.y + 3, ball_pos.z - 10);
        camera.lookAt(ball_pos);
        mobileCam = true;
    }
}

function updatePositionsAndCheckCollisions() {

}

function animate() {
    delta = clock.getDelta();


    /*If the user leaves the screen, the next delta will be large. 
    As such, this will make sure it's never too high so that the balls
    don't run from the table*/
    if(delta > 0.5) {
        delta = 0.5;
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

    //ball followed by the mobile cam
    var ball_position;

    //Dealing with collisions for all balls
    for(i in balls) {
        balls[i].updateBall();
    }

    ball_position = goalBall.getPosition();

    if (mobileCam) {
        camera.position.set(ball_position.x - 10, ball_position.y + 3, ball_position.z - 10);
        camera.lookAt(ball_position);
    }

    if (initiatedShot) {
        poolCueList[selectedCue].shoot();
    }
}