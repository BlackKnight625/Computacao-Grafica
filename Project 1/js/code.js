var renderer, scene, camera;

function createStructure() {
    'user strict';
}

function onResize() {
    'use strict';
}

function onKeyDown(e) {
    'use strict';
}

function render() {
    'use strict';
    renderer.render(scene, camera);
}

function init() {
    'use strict'
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 30;
    camera.position.y = 30;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    var axes = new THREE.AxisHelper(20);
    scene.add(axes);

    document.body.appendChild(renderer.domElement);

    render();
}

function animate() {
    'use strict';
}