var scene, camera,
		fieldOfView, aspectRatio, nearBall, farBall,
    renderer, container, particles, particleCount, particleSystem,
		controls, stats;

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

var earth;
var loader = new THREE.TextureLoader();
var keyboard = new KeyboardState();

function createScene() {

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearBall = 0.1;
	farBall = 1000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearBall,
		farBall
		);
  scene.fog = new THREE.Fog(0xf0fff0, 0.14);
  camera.position.x = 0;
	camera.position.z = 50;
	camera.position.y = 15;



	renderer = new THREE.WebGLRenderer({
		alpha: true,
	});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9);
  ambientLight = new THREE.AmbientLight(0xf8d17f, .75);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(12, 6, -7);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.near = 0.5;
  shadowLight.shadow.camera.far = 50;
  shadowLight.shadow.mapSize.width = 256;
  shadowLight.shadow.mapSize.height = 256;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
}

Earth = function(){

  var sphereGeometry = new THREE.TetrahedronGeometry(70,4);

	loader.crossOrigin = '';
	var texture = loader.load( 'images/snow.png' );
  var sphereMaterial = new THREE.MeshBasicMaterial( { map: texture } );

  this.mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  this.mesh.receiveShadow = true;

}

Earth.prototype.moveGround = function (){
  rollingGroundSphere = new THREE.Mesh( earth.sphereGeometry, earth.sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow=false;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	scene.add( rollingGroundSphere );
	rollingGroundSphere.position.y=-24;
	rollingGroundSphere.position.z=2;

  earth.mesh.rotation.x += .005;
}

function createEarth(){
  earth = new Earth();
	earth.mesh.position.y = -50;
	scene.add(earth.mesh);
}

var ball;

Ball = function(){

  var ballGeometry = new THREE.SphereGeometry( 3, 10, 10 );

	var texture2 = loader.load( 'images/snow.png' );
  var ballMaterial = new THREE.MeshBasicMaterial( { map: texture2 } );

  this.mesh = new THREE.Mesh(ballGeometry, ballMaterial);
  this.mesh.receiveShadow = true;
}

Ball.prototype.moveGround = function (){
  rollingGroundSphere = new THREE.Mesh( ball.sphereGeometry, ball.sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow=false;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	scene.add( rollingGroundSphere );
	rollingGroundSphere.position.y=-24;
	rollingGroundSphere.position.z=2;

  ball.mesh.rotation.x += -.005;
}

function createBall(){
  ball = new Ball();
	ball.mesh.position.y = 10;
	ball.mesh.position.z = 40;
	scene.add(ball.mesh);
}

function createSnow(){
	particleCount = 15000;
    var pMaterial = new THREE.PointCloudMaterial({
      color: 0xFFFFFF,
      size: 2,
      map: loader.load(
         "images/snowflake.png"
       ),
       blending: THREE.AdditiveBlending,
       depthTest: false,
       transparent: true
    });

    particles = new THREE.Geometry;
    for (var i = 0; i < particleCount; i++) {
        var pX = Math.random()*500 - 250,
            pY = Math.random()*500 - 250,
            pZ = Math.random()*500 - 250,
            particle = new THREE.Vector3(pX, pY, pZ);
        particle.velocity = {};
        particle.velocity.y = 0;
        particles.vertices.push(particle);
    }
    particleSystem = new THREE.PointCloud(particles, pMaterial);
    scene.add(particleSystem);
}

function simulateSnow() {
    var pCount = particleCount;
    while (pCount--) {
    var particle = particles.vertices[pCount];
    if (particle.y < -200) {
      particle.y = 200;
      particle.velocity.y = 0;
    }
    particle.velocity.y -= Math.random() * .02;
    particle.y += particle.velocity.y;
    }
    particles.verticesNeedUpdate = true;
};

function update()
{
	keyboard.update();

	var moveDistance = 50 * clock.getDelta();

	if ( keyboard.down("left") )
		ball.translateX( -50 );

	if ( keyboard.down("right") )
		ball.translateX(  50 );

	if ( keyboard.pressed("A") )
		ball.translateX( -moveDistance );

	if ( keyboard.pressed("D") )
		ball.translateX(  moveDistance );

	if ( keyboard.down("R") )
		ball.material.color = new THREE.Color(0xff0000);
	if ( keyboard.up("R") )
		ball.material.color = new THREE.Color(0x0000ff);

	controls.update();
	stats.update();
}

function animate(){
  earth.moveGround();
	ball.moveGround();
	particleSystem.rotation.y += 0.01;
	simulateSnow();
	controls.update();
	update();
	render();
	requestAnimationFrame(animate);
}

function init(event){
  createScene();
  createLights();
  createEarth();
	createSnow();
	createBall();
  animate();
}

function render() {
	renderer.render(scene, camera);
}

window.addEventListener('load', init, false);
