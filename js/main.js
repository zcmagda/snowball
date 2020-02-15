var scene,
		camera, fieldOfView, aspectRatio, nearBall, farBall,
    renderer, container, particles, particleCount, particleSystem;

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

var earth;
var loader = new THREE.TextureLoader();

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

	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

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

  var sphereGeometry = new THREE.SphereGeometry( 70, 40, 40 );


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

function createTree(){
	var sides=8;
	var tiers=6;
	var scalarMultiplier=(Math.random()*(0.25-0.1))+0.05;
	var midPointVector= new THREE.Vector3();
	var vertexVector= new THREE.Vector3();
	var treeGeometry = new THREE.ConeGeometry( 0.5, 1, sides, tiers);
	var treeMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,shading:THREE.FlatShading  } );
	var offset;
	midPointVector=treeGeometry.vertices[0].clone();
	var currentTier=0;
	var vertexIndex;

	var treeTop = new THREE.Mesh( treeGeometry, treeMaterial );
	treeTop.castShadow=true;
	treeTop.receiveShadow=false;
	treeTop.position.y=0.9;
	treeTop.rotation.y=(Math.random()*(Math.PI));
	var treeTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.1,0.5);
	var trunkMaterial = new THREE.MeshStandardMaterial( { color: 0x886633,shading:THREE.FlatShading  } );
	var treeTrunk = new THREE.Mesh( treeTrunkGeometry, trunkMaterial );
	treeTrunk.position.y=0.25;
	var tree =new THREE.Object3D();
	tree.add(treeTrunk);
	tree.add(treeTop);
	return tree;
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

function animate(){
  earth.moveGround();
	particleSystem.rotation.y += 0.01;
	simulateSnow();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function init(event){
  createScene();
  createLights();
  createEarth();
	createSnow();
  animate();
}

window.addEventListener('load', init, false);
