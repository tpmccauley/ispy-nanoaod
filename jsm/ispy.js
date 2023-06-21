import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { openFile } from 'https://root.cern/js/latest/modules/io.mjs';

let camera, scene, renderer, controls;
let dolly, controller;

const config = {
    background: 0x000000
};

var init = function() {
   
    scene = new THREE.Scene()

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000);

    camera.position.x = 5;
    camera.position.y = 5; 
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    renderer.setClearColor(config.background, 1);
    renderer.setSize(width, height);

    renderer.domElement.id = 'display';
    renderer.xr.enabled = true;
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.zoomSpeed = 0.5;

    document.body.appendChild(renderer.domElement);
    
    const canvas = renderer.domElement;
    
    canvas.ondragover = function() {

	return false;

    };
    
    canvas.ondragend = function() {

	return false;

    };
    
    canvas.ondrop = function(e) {

        e.preventDefault;
	
	let instructions = document.getElementById('instructions');
	instructions.style.visibility = 'hidden';
	
        const file = e.dataTransfer.files[0];

	console.log("loading "+file.name);

	let nanoaod_file = openFile(file.name);

	
	
	
	return false
	
    };

    canvas.addEventListener('ondragover', canvas.ondragover);
    canvas.addEventListener('ondragend', canvas.ondragend);
    canvas.addEventListener('ondrop', canvas.ondrop);
    
    //document.body.appendChild(VRButton.createButton(renderer));

    dolly = new THREE.Group();
    
    dolly.position.set(
	camera.position.x,
	camera.position.y,
	camera.position.z
    );

    scene.add(dolly);
    
    renderer.xr.addEventListener('sessionstart', function(e) {

	dolly.add(camera);

    });

    renderer.xr.addEventListener('sessionend', function(e) {

	dolly.remove(camera);

    });

    controller = renderer.xr.getController(0);

    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);

    controller.addEventListener('connected', function(event) {

	this.add(buildController(event.data));

    });

    controller.addEventListener('disconnected', function() {

	this.remove(this.children[0]);

    });

    scene.add(controller);

};
 
var onSelectStart = function() {
    
    this.userData.isSelecting = true;
    
};

var onSelectEnd = function() {
    
    this.userData.isSelecting = false;
    
};

var buildController = function(data) {

    let geometry, material;
	
    geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
    material = new THREE.MeshBasicMaterial({opacity: 0.5, transparent: true});
    
    return new THREE.Mesh(geometry, material);
    
};

var onWindowResize = function() {

    let w = window.innerWidth;
    let h = window.innerHeight;
    
    camera.aspect = w/h;
    camera.updateProjectionMatrix();

    renderer.setSize(w,h);
    render();

};

window.addEventListener('resize', onWindowResize, false);

let dir = new THREE.Vector3();

var render = function() {

    if ( renderer.xr.enabled === true &&
	 renderer.xr.isPresenting === true ) {
	
	renderer.xr.getCamera().getWorldDirection(dir);

	dolly.translateOnAxis(dir, 0.02);
	
    } 

    renderer.render(scene, camera);

};

var animate = function() {

    renderer.setAnimationLoop(render);

};

var geometry = function() {

    const asset = './assets/EcalBarrel3D_V2.glb'
    const gltf_loader = new GLTFLoader();

    const progress = document.getElementById('progress');
    progress.style.visibility = 'visible';

    const percent = document.getElementById('percent');
    
    gltf_loader.load(

	asset,

	function(gltf) {
	    
	    scene.add(gltf.scene);
	    
	    progress.style.visibility = 'hidden';
	    percent.innerText = '';
	    
	},

	function(xhr) {

	    let percentComplete = Math.round((xhr.loaded / xhr.total)*100);
	    console.log(percentComplete+'% loaded');
	    percent.innerText = percentComplete;
	    
	},

	function(error) {

	    console.log("An error occured loading the gltf file");

	}

    );

};

window.addEventListener('load', (event) => {

    init();
    geometry();
    animate();

});
