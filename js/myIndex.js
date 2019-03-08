var scene, 
    camera, 
    controls, 
    fieldOfView, 
    aspectRatio,
    nearPlane,
    farPlane,
    shadowLight,
    backLight,
    light,
    renderer,
    container;

// scene
var floor, lion, fan, isBlowing = false;

// scene variables
var HEIGHT,
    WIDTH,
    windowHalfX,
    windowHalfY,
    mousePos = { x: 0, y: 0};
    dist = 0;

function init() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 2000;

    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = 800;
    camera.position.y = 0;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // renderer
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    document.addEventListener('touchmove', handleTouchMove, false);
}

function onWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = Height / 2;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
    mousePos = {
        x: event.clientX,
        y: event.clientY
    }
}

function handleMouseDown (event) {
    isBlowing = true;
}

function handleMouseUp(event) {
    isBlowing = false;
}

function handleTouchStart(event) {

}

function handleTouchEnd(event) {

}

function handleTouchMove(event) {

}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5);

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;

    backLight = new THREE.DirectionalLight(0xffffff, .4);
    backLight.position.set(-100, 200, 50);
    backLight.shadowDarkness = .1;
    backLight.castShadow = true;

    // shadowLight
    scene.add(backLight);
    scene.add(light);
    scene.add(shadowLight);
}

function createFloor() {
    floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 500), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -100;
    floor.receiveShadow = true;
    scene.add(floor);
}

Fan = function() {
    this.isBlowing = false;
    this.speed = 0;
    this.acc = 0;
    this.redMat = new THREE.MeshLambertMaterial({
        color: 0xad3525,
        shading: THREE.FlatShading
    });
    this.greyMat = new THREE.MeshLambertMaterial({
        color: 0x653f4c,
        shading: THREE.FlatShading
    });
    this.yellowMat = new THREE.MeshLambertMaterial({
        color: 0xfdd276,
        shading: THREE.FlatShading
    });

    var coreGeom = new THREE.BoxGeometry(10, 10, 20);
    var sphereGeom = new THREE.BoxGeometry(10, 10, 3);
    var propGeom = new THREE.BoxGeometry(10, 30, 2);
    propGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 25, 0));

    // core
    this.core = new THREE.Mesh(coreGeom, this.greyMat);

    // propellers
    var prop1 = new THREE.Mesh(propGeom, this.redMat);
    prop1.position.z = 15;
    var prop2 = prop1.clone();
    prop2.rotation.z = Math.PI / 2;
    var prop3 = prop1.clone();
    prop3.rotation.z = Math.PI;
    var prop4 = prop1.clone();
    prop4.rotation.z = -Math.PI / 2;

    this.propeller = new THREE.Group();
    this.propeller.add(prop1);
    this.propeller.add(prop2);
    this.propeller.add(prop3);
    this.propeller.add(prop4);

    // sphere
    this.sphere = new THREE.Mesh(sphereGeom, this.yellowMat);
    this.sphere.position.z = 15;

    // group
    this.threegroup = new THREE.Group();
    this.threegroup.add(this.core);
    this.threegroup.add(this.propeller);
    this.threegroup.add(this.sphere);

    this.threegroup.traverse( function ( object ) {
		if ( object instanceof THREE.Mesh ) {
			object.castShadow = true;
			object.receiveShadow = true;
		}
	} );
}

Fan.prototype.update = function (xTarget, yTarget) {
    this.threegroup.lookAt(new THREE.Vector3(0, 80, 60));
    this.tPosX = rule3(xTarget, -200, 200, -250, 250);
    this.tPosY = rule3(yTarget, -200, 200, 250, -250);

    this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) / 10;
    this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) / 10;

    this.targetSpeed = this.isBlowing ? .3 : .01;
    if (this.isBlowing && this.speed < .5) {
        this.acc += .001;
        this.speed += this.acc;
    } else if (!this.isBlowing) {
        this.acc = 0;
        this.speed *= .98;
    }
    this.propeller.rotation.z += this.speed;
}

Lion = function () {


    // material
    this.yellowMat = new THREE.MeshLambertMaterial({
        color: 0xfdd276,
        shading: THREE.FlatShading
    });

    // geometry
    let kneeGeom = new THREE.BoxGeometry(25, 80, 80);
    kneeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 50, 0));
    let footGeom = new THREE.BoxGeometry(40, 20, 20);


    // feet
    this.backLeftFoot = new THREE.Mesh(footGeom, this.yellowMat);
    this.backLeftFoot.position.z = 30;
    this.backLeftFoot.position.x = 75;
    this.backLeftFoot.position.y = -90;

    this.backRightFoot = new THREE.Mesh(footGeom, this.yellowMat);
    this.backRightFoot.position.z = 30;
    this.backRightFoot.position.x = -75;
    this.backRightFoot.position.y = -90;

    this.frontRightFoot = new THREE.Mesh(footGeom, this.yellowMat);
    this.frontRightFoot.position.z = 40;
    this.frontRightFoot.position.x = -22;
    this.frontRightFoot.position.y = -90;

    this.frontLeftFoot = new THREE.Mesh(footGeom, this.yellowMat);
    this.frontLeftFoot.position.z = 40;
    this.frontLeftFoot.position.x = 22;
    this.frontLeftFoot.position.y = -90;

    this.threegroup = new THREE.Group();
    this.threegroup.add(this.backLeftFoot);
    this.threegroup.add(this.backRightFoot);
    this.threegroup.add(this.frontRightFoot);
    this.threegroup.add(this.frontLeftFoot);

    this.threegroup.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    })
}

function createLion() {
    lion = new Lion();
    scene.add(lion.threegroup);
}

function createFan () {
    fan = new Fan();
    fan.threegroup.position.z = 350;
    scene.add(fan.threegroup);
}


function loop() {
    render();

    let xTarget = mousePos.x - windowHalfX;
    let yTarget = mousePos.y - windowHalfY;
    fan.update(xTarget, yTarget);
    fan.isBlowing = isBlowing;

    requestAnimationFrame(loop);
}

function render() {
    if (controls) controls.update();
    renderer.render(scene, camera);
}

init();
createLights();
createFloor();
createLion();
createFan();
loop();

function rule3(v, vmin, vmax, tmin, tmax) {
    let nv = Math.max(Math.min(v, vmax), vmin);
    let dv = vmax - vmin;
    let pc = (nv - vmin) / dv;
    let dt = tmax - tmin;
    let tv = tmin + pc * dt;
    return tv;
}