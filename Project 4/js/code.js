var camera, renderer, scene;
var pressedKeys = {};
var keyActions = {};
var pressedKeyActions = {};
var delta;
var clock = new THREE.Clock();
var orbitControls;
var allMeshes;
var golfFlag;

var pauseCamera;
var paused = false;
var reset = false;

var ball;

/*----------Classes---------*/
class MeshList {
    basics = [];
    phongs = [];
    meshes = [];
    lightningToggle = true;
    wireframeToggle = false;

    add(mesh, basicMaterial, phongMaterial) {
        this.meshes.push(mesh);

        this.basics.push(basicMaterial);
        this.phongs.push(phongMaterial);

        //Updating the material in case its current material or wireframe do not match the currently active ones
        this.updateMaterial(this.meshes.length - 1);
    }

    /**
     * Returns the list that contains the currently used materials (MeshBasicMaterial if lightning is off,
     * MeshPhongMaterial if it's on)
     */
    getCurrentMaterials() {
        return this.lightningToggle ? this.basics : this.phongs;
    }

    /**
     * Switches the materials of all meshes from Basic to Phong or from Phong to Basic,
     * depending on the toggle of lightning
     */
    switchMaterials() {
        this.lightningToggle = !this.lightningToggle;
        this.updateMaterials();
    }

    /**
     * Updates the meshe's material's characteristics at the given index depending 
     * on the current lightning and wireframe toggles
     * @param {*} index 
     * The index of the mesh to update
     * @param {*} materials 
     * Optional list with the materials to be applied
     */
    updateMaterial(index, materials = this.getCurrentMaterials()) {
        this.meshes[index].material = materials[index];
        this.basics[index].wireframe = this.wireframeToggle;
        this.phongs[index].wireframe = this.wireframeToggle;
    }

    /**
     * Updates all the meshes's material's characteristics depending 
     * on the current lightning and wireframe toggles
     */
    updateMaterials() {
        var materials = this.getCurrentMaterials();

        for(var i = 0; i < this.meshes.length; i++) {
            this.updateMaterial(i, materials);
        }
    }

    /**
     * Switches the wireframe toggle of all meshes
     */
    switchWireframes() {
        this.wireframeToggle = !this.wireframeToggle;
        this.updateMaterials();
    }
}

class GolfBall {
    ball;
    jumpingFrom;
    jumpingTo;
    height;
    timeElapsed = 0;
    maxHorizontal;
    secondsBetweenJumps;
    direction;
    ballRadius;

    constructor(jumpingFrom, jumpingTo, height, secondsBetweenJumps, ballRadius) {
        this.maxHorizontal = jumpingFrom.distanceTo(jumpingTo);

        this.jumpingFrom = jumpingFrom;
        this.jumpingTo = jumpingTo;
        this.direction = jumpingFrom.clone().sub(jumpingTo).normalize();
        this.height = height;
        this.secondsBetweenJumps = secondsBetweenJumps;
        this.ballRadius = ballRadius;

        //Creating the ball
        var ballBumpMap = new THREE.TextureLoader().load("img/golfball_bump.jpg");
        var basicMaterial = new THREE.MeshBasicMaterial({color: 0xBBBBBB});
        var phongMaterial = new THREE.MeshPhongMaterial({color: 0xBBBBBB, shininess: 300, bumpMap: ballBumpMap});
        var sphere = new THREE.SphereGeometry(this.ballRadius, 50, 50);
        this.ball = new THREE.Mesh(sphere, basicMaterial);

        this.setPosition(jumpingFrom);

        allMeshes.add(this.ball, basicMaterial, phongMaterial);
        scene.add(this.ball);
    }

    setPosition(newPosition) {
        this.ball.position.set(newPosition.x, newPosition.y, newPosition.z);
    }
    
    update() {
        this.timeElapsed += delta;
        var x;
        var t = this.timeElapsed % this.secondsBetweenJumps;

        if(Math.floor(this.timeElapsed / this.secondsBetweenJumps) % 2 == 0) {
            //Moving forward
            x = this.maxHorizontal * t / this.secondsBetweenJumps;
        }
        else {
            //Moving back
            x = this.maxHorizontal - (this.maxHorizontal * t / this.secondsBetweenJumps);
        }

        //Formula to calculate the height of a parabula given a t
        var y = -4 * this.height * t * (t - this.secondsBetweenJumps) / (this.secondsBetweenJumps * this.secondsBetweenJumps);

        var newPosition = this.direction.clone().multiplyScalar(x);
        newPosition.y = y;
        newPosition.add(this.jumpingFrom);

        this.setPosition(newPosition);
    }

    reset() {
        this.setPosition(jumpingFrom);
        this.timeElapsed = 0;
    }
}

/*----------Methods---------*/

/**
 Creates the grass ground
 */
function createGrassGround(obj){
    var floor = new THREE.Object3D();
    var geometry = new THREE.BoxGeometry(400, 0.1, 400, 500, 2, 500);

    var texture = new THREE.TextureLoader().load('img/grass.png');

    /*
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 400, 400 );
    */

    var bmap = new THREE.TextureLoader().load('img/bumping(2).jpg');

    /*
    bmap.wrapS = THREE.RepeatWrapping;
    bmap.wrapT = THREE.RepeatWrapping;
    bmap.repeat.set( 10, 10 );
    */

    var nmap = new THREE.TextureLoader().load('img/normal(1).png');

    /*
    nmap.wrapS = THREE.RepeatWrapping;
    nmap.wrapT = THREE.RepeatWrapping;
    nmap.repeat.set( 400, 400 );
    */

    var materialBasic = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture});
    var materialPhong = new THREE.MeshPhongMaterial({color: 0xffffff, map: texture, bumpMap: bmap, normalMap: nmap});

    var mesh = new THREE.Mesh(geometry, materialPhong);
    
    floor.add(mesh);

    scene.add(floor);
    /*
    var grassMaterial = new THREE.MeshBasicMaterial({color: 0x006600, wireframe: true});
    var grassGeometry = new THREE.BoxGeometry(400,20,200);
    grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.set(0,0,0);
    obj.add(grass);
    */
}


function createFlag(obj) {
    var geom = new THREE.Geometry(); 

    const v1 = new THREE.Vector3(0,10,0);
    const v2 = new THREE.Vector3(0,-10,0);
    const v3 = new THREE.Vector3(0,0,10);
    var triangle = new THREE.Triangle (v1, v2, v3);

    geom.vertices.push(triangle.a);
    geom.vertices.push(triangle.b);
    geom.vertices.push(triangle.c);
    geom.faces.push( new THREE.Face3( 0, 1, 2 ));
    

    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    material.side = THREE.DoubleSide;
    var phongMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    phongMaterial.side = THREE.DoubleSide;
    geom.computeFaceNormals();
    var mesh = new THREE.Mesh(geom, material);
    mesh.position.set(0,100,0);

    allMeshes.add(mesh, material, phongMaterial);

    obj.add(mesh);
}


function createStick(obj) {
    var stickMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    var stickGeometry = new THREE.CylinderGeometry(0.8, 0.8, 110, 30);
    stick = new THREE.Mesh(stickGeometry, stickMaterial);
    var phongMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
    stick.position.set(0,55,0);

    allMeshes.add(stick, stickMaterial, phongMaterial);
    obj.add(stick);
}


function createGolfFlag(obj) {
    var flag = new THREE.Object3D();
    var stick = new THREE.Object3D();
    createFlag(flag);
    createStick(stick);
    obj.add(flag);
    obj.add(stick);
}

/**
 Creates the whole Structure
 */
function createStructure() {
    var ground = new THREE.Object3D();
    createGrassGround(ground);
    scene.add(ground);

    golfFlag = new THREE.Object3D();
    createGolfFlag(golfFlag);
    scene.add(golfFlag);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 200, 0);
    scene.add(directionalLight);

    var loader = new THREE.CubeTextureLoader();
    var texture = loader.load([
    'cubemap/px.png',
    'cubemap/nx.png',
    'cubemap/py.png',
    'cubemap/ny.png',
    'cubemap/pz.png',
    'cubemap/nz.png',
    ]);
    scene.background = texture;

    
}

function createPauseScreen() {
    var screenPicture = new THREE.TextureLoader().load("img/pause_screen.png");
    var material = new THREE.MeshBasicMaterial({color: 0xCCCCCC, map: screenPicture});
    var box = new THREE.BoxGeometry(window.innerWidth / 2, window.innerHeight / 2, 1);
    var screen = new THREE.Mesh(box, material);

    pauseScene.add(screen);
}

/**
 * Called when the window is resized
 */
function onResize() {
    'use strict';

    //TODO Change this depending on the camera

    /*
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        perspCam.aspect = window.innerWidth / window.innerHeight;
        perspCam.updateProjectionMatrix();

        ortCam.left = window.innerWidth / - 2;
        ortCam.right = window.innerWidth / 2;
        ortCam.top = window.innerHeight / 2;
        ortCam.bottom = window.innerHeight / - 2;
        ortCam.updateProjectionMatrix();
    }
    */
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

    if(paused) {
        renderer.clearDepth();
        renderer.render(pauseScene, pauseCamera);
    }
}

function addKeyActions() {
    pressedKeyActions[73] = function () {allMeshes.switchMaterials()} //I
    pressedKeyActions[105] = function () {allMeshes.switchMaterials()} //i
    pressedKeyActions[87] = function () {allMeshes.switchWireframes()} //W
    pressedKeyActions[119] = function () {allMeshes.switchWireframes()} //w
    pressedKeyActions[83] = function () {pause()} //S
    pressedKeyActions[115] = function () {pause()} //s
    pressedKeyActions[82] = function () {reset()} //R
    pressedKeyActions[114] = function () {reset()} //r
}

/**
 * Called at the beggining of the program
 */
function init() {
    scene = new THREE.Scene();
    pauseScene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    //Adding event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.x = 500;
    camera.position.y = 500;
    camera.position.z = 500;
    camera.lookAt(scene.position);

    pauseCamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2,
        -100, 100);

    var axes = new THREE.AxesHelper(20);
    scene.add(axes);

    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    document.body.appendChild(renderer.domElement);

    allMeshes = new MeshList();
    
    createStructure();
    createPauseScreen();

    ball = new GolfBall(new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0, 100), 100, 2, 5);

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

    orbitControls.update();
    

    if(!paused) {
        //Updating objects
        ball.update();
        golfFlag.rotateY(Math.PI * delta);
    }
}

function pause() {
    if(!paused) {
        renderer.autoclear = false;
        paused = true;
    }
}

function reset() {
    if(paused) {
        renderer.autoclear = true;
        paused = false;
    }
}