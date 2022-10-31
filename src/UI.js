import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import './Action'

import $, { data } from 'jquery'

import { MapControls, OrbitControls } from './three/OrbitControls';
import { DRACOLoader } from './three/DRACOLoader';
import { GLTFLoader } from './three/GLTFLoader';
import { CSS2DRenderer } from './three/CSS2DRenderer';
import { DragControls } from './three/DragControls';

import { Wall } from './components/Wall';
import { BottomWall } from './components/Bottom';
import { AXIS, DELTA_DIS, DIR, STORE, wallItems } from './Constant';
import { AxesHelper, Vector3 } from 'three';
import { render } from '@testing-library/react';

import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import { Dimensions } from "./components/dimension";
import { Tapware } from './components/Tapware';
import storage from './components/Firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import CreateDate from './components/Firebase/Create'
import { readData } from './components/Firebase/Read';

const Room_types = [1, 2, 3, 4, 5, 6];

let walls_group = [];
let door = null;
let shower = null;
let bathtub = null;
let bathtub1 = null;
let bathtub2 = null;
let tapware = null;
let temp_bathtub = null;
let temp_bathtub1 = null;
let temp_bathtub2 = null;
let temp_tapware = null;
let temp_door = null;
let temp_shower = null;

let dims = [];

let isMouseDown = false;

let isDrag = false;

let updateTimeout;

const gltfLoader = new GLTFLoader();



let selectedItem = null;
let hoverItem;

let rayWalls = [];

let selectedObject;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/');
gltfLoader.setDRACOLoader(dracoLoader);


let objects = [];

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();


const canvas = document.createElement('canvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .01, 50);
function initCamera() {
    camera.position.y = 10;
    camera.position.z = 8;
    scene.add(camera);
}

initCamera();

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

const labelRenderer = new CSS2DRenderer();

renderer.outputEncoding = THREE.sRGBEncoding;

const orbitControls = new OrbitControls(camera, renderer.domElement);

function initOrbit() {
    orbitControls.minDistance = 3;
    orbitControls.maxDistance = 20;
    orbitControls.maxPolarAngle = 1.5;
    orbitControls.minAzimuthAngle = .1;
}

initOrbit();

const frustum = 1000;
const orthoCam = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0, 30);

var mapControls;
var global_light
var light_1;
var light_2;
var light_3;
var light_4;
var light_5;
var light_6;
var light_7;
var light_8;

function init() {
    // const orthoCam = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0, 30);
    orthoCam.zoom = STORE.Scale * 100;
    mapControls = new MapControls(orthoCam, labelRenderer.domElement);

    mapControls.zoomSpeed = .1;
    mapControls.enableRotate = false;
    mapControls.screenSpacePanning = false;
    mapControls.minZoom = 100;
    mapControls.maxZoom = frustum;
    orthoCam.updateProjectionMatrix();
}
init()

function initLight() {
    global_light = new THREE.HemisphereLight('white', '', 0.5);
    light_1 = new THREE.PointLight('white', .2, 20, 1);
    light_2 = new THREE.PointLight('white', .2, 20, 1);
    light_3 = new THREE.PointLight('white', .2, 20, 1);
    light_4 = new THREE.PointLight('white', .2, 20, 1);
    light_5 = new THREE.PointLight('white', .2, 20, 1);
    light_6 = new THREE.PointLight('white', .2, 20, 1);
    light_7 = new THREE.PointLight('white', .2, 20, 1);
    light_8 = new THREE.PointLight('white', .2, 20, 1);

    scene.add(global_light, light_1, light_2, light_3, light_4, light_5, light_6, light_7, light_8);
    global_light.position.set(10, 10, 10);
}

initLight();


// const box = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ side: THREE.BackSide, transparent: true, color :'white' }));

let InvisibleMat;

// box.geometry.translate(0, .5, 0);
// // scene.add(box);



function DragObject(vec3, object, selectedwall) {
    isDrag = true;
    switch (selectedwall.userData.normalAxis) {
        case AXIS.X:
            object.position.x = vec3.x;
            object.position.z = vec3.z;
            object.userData.normalAxis = AXIS.X;
            if (selectedwall.userData.dir == DIR.START) {
                object.rotation.y = Math.PI / 2;
                object.userData.dir = DIR.START;
            }
            else {
                object.rotation.y = -Math.PI / 2;
                object.userData.dir = DIR.END;
            }
            break;
        case AXIS.Z:
            object.position.x = vec3.x;
            object.position.z = vec3.z;
            object.userData.normalAxis = AXIS.Z;
            if (selectedwall.userData.dir == DIR.START) {
                object.rotation.y = 0;
                object.userData.dir = DIR.START;
            }
            else {
                object.rotation.y = -Math.PI;
                object.userData.dir = DIR.END;
            }
            break;
        case AXIS.Y:
            object.position.x = vec3.x;
            object.position.z = vec3.z;
            break;
        default:
            break;
    }

}

function isFacingCamera(object) {
    let v = new Vector3();
    // this is one way. adapt to your use case.
    if (v.subVectors(camera.position, object.position).dot(object.userData.normalVector) < 0) {
        object.geometry.setDrawRange(0, 0);
    }
    else {
        object.geometry.setDrawRange(0, Infinity);
        rayWalls.push(object);
    }
}

let walls;
function animate() {

    rayWalls = [];
    for (let index = 0; index < walls_group.length; index++) {
        if (walls_group[index].material.visible)
            isFacingCamera(walls_group[index]);
    }
    // isFacingCamera(ceiling);

    if (STORE.view === 1) {
        renderer.render(scene, camera);
        orbitControls.update();
        // let isDoor = false;
        // for (let index = 0; index < rayWalls.length; index++) {
        //     if (temp_door.userData.normalAxis === rayWalls[index].userData.normalAxis && temp_door.userData.dir === rayWalls[index].userData.dir) {
        //         isDoor = true;
        //     }
        // }
        // temp_door.chlldren[0].children[0].material.visible = isDoor;
    } else {
        renderer.render(scene, orthoCam);
        labelRenderer.render(scene, orthoCam);
        mapControls.update();
    }
    requestAnimationFrame(animate);

}

function resize() {
    const container = document.getElementById('canvas-container');
    const goldcolor = new THREE.Color(0xbcbcbc);
    scene.background = goldcolor;
    container.innerHTML = '';
    container.append(canvas);
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(container.clientWidth, container.clientWidth);
}

window.addEventListener('resize', resize, false);

GenerateBathroom();
loadDoor('assets/doors/panel.glb', 1, 1);
loadBathtub1();
animate();


var selectedFlag = false;
var temp_object = null;
var temp_object_real = null;


const onmousedown = (e) => {

    isMouseDown = true;

    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (e.touches) {
        mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);

    var objectIntersects = raycaster.intersectObjects(objects);

    if (objectIntersects.length > 0 && isMouseDown) {
        selectedItem = objectIntersects[0].object;
        orbitControls.enabled = false;
    }
}

const onmouseup = (e) => {

    isMouseDown = false;
    isDrag = false;
    orbitControls.enabled = true;
    selectedItem = null;

    var objectIntersects = raycaster.intersectObjects(objects);

    console.log("This is reycast");
    console.log(objectIntersects);

    if (objectIntersects.length > 0 && objectIntersects[0].object.visible == true)  {
        hoverItem = objectIntersects[0].object;
        hoverItem.material.visible = true;

        if (selectedFlag) {
            temp_object.material.visible = false
        } else {
            selectedFlag = true
        }
        temp_object = hoverItem
        temp_object_real = objectIntersects[1].object
        $(".functionBoard").css({ "display": "block" })
    } else if (hoverItem && !isDrag) {
        hoverItem.material.visible = false;
        selectedFlag = false;
        $(".functionBoard").css({ "display": "none" })
    }

    Update();
}

const onmousemove = (e) => {

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // if (e.touches) {
    //     mouse.x = ((e.touches[0].clientX - rect.left) / rect.width);
    //     mouse.y = -((e.touches[0].clientY - rect.top) / rect.height);
    // }

    let temp_camera;
    if (STORE.view == 1)
        temp_camera = camera;
    else
        temp_camera = orthoCam;
    raycaster.setFromCamera(mouse, temp_camera);
    var intersects = raycaster.intersectObjects(walls_group, false);

    if (intersects.length > 0) {

        selectedObject = intersects[0].object;
        if (isMouseDown && selectedItem) {
            if (selectedItem.userData.normalAxis === AXIS.Y && selectedObject.userData.normalAxis === AXIS.Y) {
                DragObject(intersects[0].point, selectedItem, selectedObject);
            }
            else if (selectedItem.userData.normalAxis !== AXIS.Y && selectedObject.userData.normalAxis !== AXIS.Y) {
                DragObject(intersects[0].point, selectedItem, selectedObject);
            }
        }

    } else {
        selectedObject = null;
    }
    mapControls.enabled = false;
}

$('body').keydown(function (event) {
    var letter = String.fromCharCode(event.which);
    if (event.keyCode == 46) {
        deleteObject();
    }
})

function deleteObject() {
    console.log("here")
    if (temp_object_real != null) {
        temp_object.visible = false
        temp_object_real.visible = false

        temp_object_real = null
    }
}

window.addEventListener('mousemove', onmousemove);
window.addEventListener('mousedown', onmousedown);
window.addEventListener('mouseup', onmouseup);

function Update() {
    if (updateTimeout) clearTimeout(updateTimeout);

    updateTimeout = setTimeout(() => {
        GenerateBathroom();
        GenerateMeasurements();
    }, 5);
}

function createWalls(type) {
    for (let index = 0; index < walls_group.length; index++) {
        scene.remove(walls_group[index]);
    }
    walls_group = [];
    switch (type) {
        case 1:
            walls_group.push(new Wall(STORE.Length, STORE.Height, new Vector3(-STORE.Width / 2, 0, 0), AXIS.X, DIR.START));
            walls_group.push(new Wall(STORE.Length, STORE.Height, new Vector3(STORE.Width / 2, 0, 0), AXIS.X, DIR.END));
            walls_group.push(new Wall(STORE.Width, STORE.Height, new Vector3(0, 0, -STORE.Length / 2), AXIS.Z, DIR.START));
            walls_group.push(new Wall(STORE.Width, STORE.Height, new Vector3(0, 0, STORE.Length / 2), AXIS.Z, DIR.END));
            break;
        case 2:
            walls_group.push(new Wall(STORE.Length, STORE.Height, new Vector3(-STORE.Width / 2, 0, 0), AXIS.X, DIR.START));
            walls_group.push(new Wall(STORE.Length - STORE.CutOutLength, STORE.Height, new Vector3(STORE.Width / 2, 0, -STORE.CutOutLength / 2), AXIS.X, DIR.END));
            walls_group.push(new Wall(STORE.Width, STORE.Height, new Vector3(0, 0, -STORE.Length / 2), AXIS.Z, DIR.START));
            walls_group.push(new Wall(STORE.Width - STORE.CutOutWidth, STORE.Height, new Vector3(- STORE.CutOutWidth / 2, 0, STORE.Length / 2), AXIS.Z, DIR.END));
            walls_group.push(new Wall(STORE.CutOutWidth, STORE.Height, new Vector3(STORE.Width / 2 - STORE.CutOutWidth / 2, 0, STORE.Length / 2 - STORE.CutOutLength), AXIS.Z, DIR.END));
            walls_group.push(new Wall(STORE.CutOutLength, STORE.Height, new Vector3(STORE.Width / 2 - STORE.CutOutWidth, 0, STORE.Length / 2 - STORE.CutOutLength / 2), AXIS.X, DIR.END));
            break;
        case 3:
            walls_group.push(new Wall(STORE.Length - STORE.CutOutLength, STORE.Height, new Vector3(-STORE.Width / 2, 0, -STORE.CutOutLength / 2), AXIS.X, DIR.START, true));
            walls_group.push(new Wall(STORE.Length, STORE.Height, new Vector3(STORE.Width / 2, 0, 0), AXIS.X, DIR.END, false));
            walls_group.push(new Wall(STORE.Width, STORE.Height, new Vector3(0, 0, -STORE.Length / 2), AXIS.Z, DIR.START, false));
            walls_group.push(new Wall(STORE.Width - STORE.CutOutWidth, STORE.Height, new Vector3(STORE.CutOutWidth / 2, 0, STORE.Length / 2), AXIS.Z, DIR.END, true));
            walls_group.push(new Wall(STORE.CutOutWidth, STORE.Height, new Vector3(-STORE.Width / 2 + STORE.CutOutWidth / 2, 0, STORE.Length / 2 - STORE.CutOutLength), AXIS.Z, DIR.END));
            walls_group.push(new Wall(STORE.CutOutLength, STORE.Height, new Vector3(-STORE.Width / 2 + STORE.CutOutWidth, 0, STORE.Length / 2 - STORE.CutOutLength / 2), AXIS.X, DIR.START));
            break;
        case 4:
            walls_group.push(new Wall(STORE.Length, STORE.Height, new Vector3(-STORE.Width / 2, 0, 0), AXIS.X, DIR.START));
            walls_group.push(new Wall(STORE.Length - STORE.CutOutLength, STORE.Height, new Vector3(STORE.Width / 2, 0, STORE.CutOutLength / 2), AXIS.X, DIR.END));
            walls_group.push(new Wall(STORE.Width - STORE.CutOutWidth, STORE.Height, new Vector3(- STORE.CutOutWidth / 2, 0, -STORE.Length / 2), AXIS.Z, DIR.START));
            walls_group.push(new Wall(STORE.Width, STORE.Height, new Vector3(0, 0, STORE.Length / 2), AXIS.Z, DIR.END));
            walls_group.push(new Wall(STORE.CutOutWidth, STORE.Height, new Vector3(STORE.Width / 2 - STORE.CutOutWidth / 2, 0, -STORE.Length / 2 + STORE.CutOutLength), AXIS.Z, DIR.START));
            walls_group.push(new Wall(STORE.CutOutLength, STORE.Height, new Vector3(STORE.Width / 2 - STORE.CutOutWidth, 0, -STORE.Length / 2 + STORE.CutOutLength / 2), AXIS.X, DIR.END));
            break;
        case 5:
            walls_group.push(new Wall(STORE.Length - STORE.CutOutLength, STORE.Height, new Vector3(-STORE.Width / 2, 0, STORE.CutOutLength / 2), AXIS.X, DIR.START));
            walls_group.push(new Wall(STORE.Length, STORE.Height, new Vector3(STORE.Width / 2, 0, 0), AXIS.X, DIR.END));
            walls_group.push(new Wall(STORE.Width - STORE.CutOutWidth, STORE.Height, new Vector3(STORE.CutOutWidth / 2, 0, -STORE.Length / 2), AXIS.Z, DIR.START));
            walls_group.push(new Wall(STORE.Width, STORE.Height, new Vector3(0, 0, STORE.Length / 2), AXIS.Z, DIR.END));
            walls_group.push(new Wall(STORE.CutOutWidth, STORE.Height, new Vector3(-STORE.Width / 2 + STORE.CutOutWidth / 2, 0, -STORE.Length / 2 + STORE.CutOutLength), AXIS.Z, DIR.START));
            walls_group.push(new Wall(STORE.CutOutLength, STORE.Height, new Vector3(-STORE.Width / 2 + STORE.CutOutWidth, 0, -STORE.Length / 2 + STORE.CutOutLength / 2), AXIS.X, DIR.START));
            break;
        default:
            break;
    }
    walls_group.push(new BottomWall(new Vector3(0, 0, 0), AXIS.Y, DIR.START, STORE.type, STORE.view));
    walls_group.push(new BottomWall(new Vector3(0, STORE.Height, 0), AXIS.Y, DIR.END, STORE.type, STORE.view));
    for (let index = 0; index < walls_group.length; index++) {
        scene.add(walls_group[index]);
        // if(STORE.view ===1 ){
        //     walls_group[index].onBeforeRender = onBeforeRender;
        //     walls_group[index].onAfterRender = onAfterRender;
        // }

    }

}


function GenerateBathroom() {

    orthoCam.position.y = STORE.Height + DELTA_DIS;
    light_1.position.set(-STORE.Width / 2, STORE.Height, 0);
    light_2.position.set(STORE.Width / 2, STORE.Height, 0);
    light_3.position.set(STORE.Width, 1, 0);
    light_4.position.set(-STORE.Width, 1, 0);
    light_5.position.set(0, 1, STORE.Height);
    light_6.position.set(0, 1, -STORE.Height);
    light_7.position.set(0, 0, STORE.Height);
    light_8.position.set(0, 0, -STORE.Height);

    createWalls(STORE.type);

}

function GenerateMeasurements() {
    document.getElementById('measures').append(labelRenderer.domElement);

    for (let index = 0; index < dims.length; index++) {
        scene.remove(dims[index]);
    }
    dims = [];
    if (STORE.view !== 1)
        new Dimensions(scene, dims, orthoCam, labelRenderer.domElement, STORE.type, temp_object);

}

function loadDoor(url, num, num1) {
    gltfLoader.load(
        // resource URL
        url,
        // called when the resource is loaded
        function (gltf) {
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_door = new THREE.Mesh(new THREE.BoxGeometry(wallItems.door.width, wallItems.door.height, wallItems.door.depth / num1), InvisibleMat);
            temp_door.geometry.translate(0, wallItems.door.height * .5, 0);
            temp_door.position.set(0, 0, -STORE.Length / 2 - 0.02);
            temp_door.userData.normalAxis = AXIS.Z;
            temp_door.userData.normalVector = new Vector3(0, 0, 1);
            temp_door.userData.dir = DIR.START;
            door = gltf.scene;
            door.scale.x = num;
            door.scale.y = num;
            door.scale.z = num / 2;
            temp_door.add(door);
            scene.add(temp_door);
            objects.push(temp_door);
        },
    );
}

function Window(url, num, num1) {
    gltfLoader.load(
        // resource URL
        url,
        // called when the resource is loaded
        function (gltf) {
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_door = new THREE.Mesh(new THREE.BoxGeometry(wallItems.door.width, wallItems.door.height / 2, wallItems.door.depth / num1), InvisibleMat);
            temp_door.geometry.translate(0, wallItems.door.height * .22, 0);
            temp_door.position.set(0, 1, -STORE.Length / 2 - 0.02);
            temp_door.userData.normalAxis = AXIS.Z;
            temp_door.userData.normalVector = new Vector3(0, 0, 1);
            temp_door.userData.dir = DIR.START;
            door = gltf.scene;
            door.scale.x = num;
            door.scale.y = num;
            door.scale.z = num / 2;
            temp_door.add(door);
            scene.add(temp_door);
            objects.push(temp_door);
        },
    );
}

function Shower() {
    gltfLoader.load(
        // resource URL
        'assets/doors/shower.glb',
        // called when the resource is loaded
        function (gltf) {
            shower = gltf.scene;
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_shower = new THREE.Mesh(new THREE.BoxGeometry(wallItems.shower.width, wallItems.shower.height, wallItems.shower.depth * 5), InvisibleMat);
            temp_shower.geometry.translate(0, wallItems.shower.height * .5, 0);
            temp_shower.position.set(0, 0, -STORE.Length / 2 - 0.1);
            temp_shower.userData.normalAxis = AXIS.Z;
            temp_shower.userData.normalVector = new Vector3(0, 0, 1);
            shower.children[0].material.visible = true;
            temp_shower.userData.dir = DIR.START;
            temp_shower.add(shower);
            scene.add(temp_shower);
            objects.push(temp_shower);
        },
    );
}

function loadBathtub(URL) {
    gltfLoader.load(
        // resource URL
        URL,
        function (gltf) {
            bathtub = gltf.scene;
            bathtub.scale.x = 0.9;
            bathtub.scale.y = 0.9;
            bathtub.scale.z = 0.9;
            bathtub.rotation.y = Math.PI;
            bathtub.position.x = -1.4;
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_bathtub = new THREE.Mesh(new THREE.BoxGeometry(wallItems.bathtub.width - 0.45, wallItems.bathtub.height, wallItems.bathtub.depth - 0.37), InvisibleMat);
            temp_bathtub.geometry.translate(0, wallItems.bathtub.height * .5, 0);
            temp_bathtub.position.set(-1, 0, -1);
            temp_bathtub.userData.normalAxis = AXIS.Y;
            bathtub.children[0].material.visible = true;
            temp_bathtub.add(bathtub);
            scene.add(temp_bathtub);
            objects.push(temp_bathtub);
        },
    );
}

function loadBathtub2(URL, num, num1) {
    console.log(URL, "dsfsadfad---------dsfasd-fadsf-----")
    gltfLoader.load(
        // resource URL
        URL,
        function (gltf) {
            bathtub2 = gltf.scene;
            bathtub2.scale.x = 0.9;
            bathtub2.scale.y = 0.9;
            bathtub2.scale.z = 0.9;
            bathtub2.rotation.y = Math.PI;
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_bathtub2 = new THREE.Mesh(new THREE.BoxGeometry(wallItems.bathtub2.width - num, wallItems.bathtub2.height, wallItems.bathtub2.depth - num1), InvisibleMat);
            temp_bathtub2.geometry.translate(0, wallItems.bathtub2.height * .5, 0);
            temp_bathtub2.position.set(1, 0, 1);
            temp_bathtub2.userData.normalAxis = AXIS.Y;
            // bathtub2.children[0].material.visible = true;
            temp_bathtub2.add(bathtub2);
            scene.add(temp_bathtub2);
            objects.push(temp_bathtub2);
        },
    );
}

function loadBathtub1() {
    gltfLoader.load(
        // resource URL
        'assets/doors/bathtub.glb',
        function (gltf) {
            bathtub1 = gltf.scene;
            bathtub1.scale.x = 0.25;
            bathtub1.scale.y = 0.25;
            bathtub1.scale.z = 0.25;
            bathtub1.rotation.y = Math.PI / 2;
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_bathtub1 = new THREE.Mesh(new THREE.BoxGeometry(wallItems.bathtub1.width, wallItems.bathtub1.height, wallItems.bathtub1.depth), InvisibleMat);
            temp_bathtub1.geometry.translate(0, wallItems.bathtub1.height * .5, 0);
            temp_bathtub1.userData.normalAxis = AXIS.Y;
            bathtub1.children[0].material.visible = true;
            temp_bathtub1.add(bathtub1);
            scene.add(temp_bathtub1);
            objects.push(temp_bathtub1);
        },
    );
}

function loadTapware(URL, num, num1, num2) {

    gltfLoader.load(
        // resource URL
        URL,
        function (gltf) {
            tapware = gltf.scene;
            tapware.scale.y = 2;
            tapware.scale.x = 2;
            tapware.scale.z = 2;
            tapware.rotation.y = Math.PI;
            InvisibleMat = new THREE.MeshBasicMaterial({ color: 'red', visible: false, transparent: true, opacity: .3 });
            temp_tapware = new THREE.Mesh(new THREE.BoxGeometry(wallItems.tapware.width / 10 - num, wallItems.tapware.height / 2 - num2, wallItems.tapware.depth / 2 - num1), InvisibleMat);
            temp_tapware.geometry.translate(0, wallItems.tapware.height * .01, 0);
            temp_tapware.position.set(1, 0.12, 1);
            temp_tapware.userData.normalAxis = AXIS.Y;
            // tapware.children[0].material.visible = true;
            temp_tapware.add(tapware);
            scene.add(temp_tapware);
            objects.push(temp_tapware);          
        },
    );
}

const UI = observer(() => {

    useEffect(() => {
        resize();
    }, []);

    const [menuOption, setMenuOption] = useState([false, false, false, false, false, false, false, false, false]);
    const [isCategory, setIsCategory] = useState(false);
    const { isAdd, setAdd } = useState(false);
    const [file, setFile] = useState("");
    const [file1, setFile1] = useState("");
    const [percent, setPercent] = useState(0);
    const [percent1, setPercent1] = useState(0);
    const [show, setShow] = useState(false);
    const [imageURL, setImageURL] = useState();
    const [modelURL, setModelURL] = useState();
    const [title, setTitle] = useState("");
    const [categories, setCategories] = useState([]);
    const [header, setHeader] = useState();

    function AssignVal(e) {

        STORE[e.target.id] = e.target.value;
        if (door !== null) {
            if (door.children[0].userData.normalAxis === AXIS.X) {
                if (door.children[0].userData.dir === DIR.START)
                    door.position.x = -STORE.Width / 2;
                else
                    door.position.x = STORE.Width / 2;
            } else if (door.children[0].userData.normalAxis === AXIS.Z) {
                if (door.children[0].userData.dir === DIR.START)
                    door.position.z = -STORE.Length / 2;
                else
                    door.position.z = STORE.Length / 2;
            }
        }
    }

    function handleChange(event) {
        setFile(event.target.files[0]);
    }

    function handleChange1(event) {
        setFile1(event.target.files[0]);
    }

    function handleUpload() {
        if (!file) {
            alert("Please choose a file first!");
        }

        const storageRef = ref(storage, `/Tapware & Accessories/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const percent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );

                //update progress
                setPercent(percent);
            },
            (err) => console.log(err),
            () => {
                //download url
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    setImageURL(url);
                });
            }
        );
    }

    function handleUpload1() {
        if (!file1) {
            alert("Please choose a file first!");
        }

        const storageRef = ref(storage, `/Tapware & Accessories(3D)/${file1.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file1);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const percent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );

                //update progress
                setPercent1(percent);
            },
            (err) => console.log(err),
            () => {
                //download url
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    setModelURL(url);
                });
            }
        );
    }

    function onChangeTitle(e) {
        setTitle(e.target.value);
    }

    useEffect(() => {
        const database = readData();
        console.log(database)
        setCategories(database);
    }, [])

    function saveData() {
        // const tempCategories = [...categories];
        // console.log(tempCategories)
        // tempCategories.push({title, image: imageURL, modelURL});
        // setCategories(tempCategories);
        setShow(false);
        CreateDate(title, imageURL, modelURL)
            .then(() => {
                const database = readData();
                console.log(database)
                setCategories(database);
                console.log("Created new item successfully!");
            })
            .catch((e) => {
                console.log(e);
            })
    }

    function change(title) {
        setIsCategory(true);
        setHeader(title);
    }

    Update();


    return <div className='container vh-100 overflow-auto'>
        <Navbar />
        <Sidebar
            menuOption={menuOption}
            setMenuOption={setMenuOption}
            setIsCategory={setIsCategory}
        />
        <div className="row content" >

            <div className="roomsSideBar" style={{ marginLeft: (menuOption[0] && !isCategory ? 0 : -400) }}>
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>  Room Layout</h6>
                    <span className='close'>X</span>
                </div>
                <div className="d-flex flex-wrap w-100">
                    <h6 className='trig-btn  w-100' style={{ color: "#555", paddingLeft: "20px", height: "30px" }}> Floor  Plan</h6>
                    <div className="d-flex flex-wrap w-100">
                        {Room_types.map(type => {

                            return <div onClick={e => {

                                STORE.cwidth = Math.min(STORE.width - 1000, STORE.cwidth);
                                STORE.clength = Math.min(STORE.length - 1000, STORE.clength);
                                STORE.type = type;

                            }} key={type} className="px-4 py-3 bg-white rounded-1 m-2 hover shadow">
                                <img src={"assets/ui/" + type + ".svg"} alt="" />
                            </div>
                        })}
                    </div>
                </div>
                <div className="d-flex flex-wrap w-100">
                    <h6 className='trig-btn py-3 w-100' style={{ color: "#555", paddingLeft: "20px" }}> Room  Dimensions</h6>
                    <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                        <span style={{ width: "100%" }}>Room Width</span>
                        <input onChange={AssignVal} type="range" id='width' value={STORE.width} min={2100} max={10000} className="form-range me-1" />
                        <input onChange={AssignVal} type="text" id='width' value={STORE.width} className="sizeInput"></input>
                        <span>mm</span>
                    </div>
                    <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                        <span style={{ width: "100%" }} >Room Length</span>
                        <input onChange={AssignVal} type="range" id='length' value={STORE.length} min={2100} max={10000} className="form-range" />
                        <input onChange={AssignVal} type="text" id='length' value={STORE.length} className="sizeInput"></input>
                        <span>mm</span>
                    </div>
                    <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                        <span style={{ width: "100%" }} >Room Height </span>
                        <input onChange={AssignVal} type="range" id='height' value={STORE.height} min={2000} max={10000} className="form-range" />
                        <input onChange={AssignVal} type="text" id='height' value={STORE.height} className="sizeInput"></input>
                        <span>mm</span>
                    </div>

                    {STORE.type > 1 && < div >
                        <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                            <span style={{ width: "100%" }} >Cutout width </span>
                            <input onChange={AssignVal} type="range" id='cwidth' value={STORE.cwidth} min={1000} max={STORE.width - 1000} className="form-range" />
                            <input onChange={AssignVal} type="text" id='cwidth' value={STORE.cwidth} className="sizeInput"></input>
                            <span>mm</span>
                        </div>
                        <div className="p-3 d-flex bg-white justify-content-between shadow-sm mb-3 flex-nowrap">
                            <span style={{ width: "100%" }} >Cutout length </span>
                            <input onChange={AssignVal} type="range" id='clength' value={STORE.clength} min={1000} max={STORE.length - 1000} className="form-range" />
                            <input onChange={AssignVal} type="text" id='clength' value={STORE.clength} className="sizeInput"></input>
                            <span>mm</span>
                        </div>
                    </div>}
                </div>

            </div>

            <div className='roomsSideBar' style={{ marginLeft: (menuOption[1] && !isCategory ? 0 : -400) }} >
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>Bathroom Elements</h6>
                    <span className='close'>X</span>
                </div>
                <div className="d-flex flex-wrap w-100">
                    <h6 className='trig-btn  w-100' style={{ color: "#555", paddingLeft: "20px", height: "30px" }}> Add Room Elements</h6>
                    <div className="height_vh">
                        <div className="d-flex flex-wrap w-100 justify">
                            <div className='card m-2 d-flex align-items-center text-center p-2 rounded' style={{ width: "45%" }}>
                                <span className='m-2'>Door</span>
                                <img style={{ width: "80px", height: "80px" }} src="assets/ui/door.svg"></img>
                                <div className='btn m-2 rounded-5 shadow-sm' onClick={() => loadDoor('assets/doors/panel.glb', 1, 1)}>Add to Plan +</div>
                            </div>
                            <div className='card m-2 d-flex align-items-center text-center p-2 rounded' style={{ width: "45%" }}>
                                <span className='m-2'>Sliding window</span>
                                <img style={{ width: "80px", height: "80px" }} src="assets/ui/Sliding window.png"></img>
                                <div className='btn m-2 rounded-5 shadow-sm' onClick={() => Window('assets/doors/sliding.glb', 0.03, 0.9)}>Add to Plan +</div>
                            </div>
                            <div className='card m-2 d-flex align-items-center text-center p-2 rounded' style={{ width: "45%" }}>
                                <span className='m-2'>Traditional door</span>
                                <img style={{ width: "80px", height: "80px" }} src="assets/ui/Traditional door.png"></img>
                                <div className='btn m-2 rounded-5 shadow-sm' onClick={() => loadDoor('assets/doors/Traditional door.gltf', 1, 0.5)}>Add to Plan +</div>
                            </div>
                            <div className='card m-2 d-flex align-items-center text-center p-2 rounded' style={{ width: "45%" }}>
                                <span className='m-2'>Traditional door</span>
                                <img style={{ width: "80px", height: "80px" }} src="assets/ui/Traditional door.png"></img>
                                <div className='btn m-2 rounded-5 shadow-sm' onClick={() => loadDoor('assets/doors/Traditional door.gltf', 1, 0.5)}>Add to Plan +</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='roomsSideBar' style={{ marginLeft: (menuOption[2] ? 0 : -400) }} >
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>Bathroom Products</h6>
                    <span className='close'>X</span>
                </div>
                {
                    isCategory ? <Tapware
                        categories={categories}
                        isAdd={isAdd}
                        setAdd={setAdd}
                        loadBathtub={loadBathtub}
                        loadBathtub2={loadBathtub2}
                        loadTapware={loadTapware}
                        show={show}
                        setShow={setShow}
                        isCategory={isCategory}
                        setIsCategory={setIsCategory}
                        header={header}
                        setHeader={setHeader}
                        shower={Shower}
                    />
                        : <>
                            <input placeholder='Search all products' type="search" className='d-flex w-100 rounded-4 shadow-sm search' style={{ height: 40, border: "none" }} />
                            <div className='main_window'>
                                <div className="d-flex flex-wrap w-100">
                                    <div className="d-flex flex-wrap w-100 cards">
                                        <div className='card  d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Baths & Spas')}>
                                            <img src="assets/ui/e09acac1-fc05-4078-bd84-73b765c26c31.png"></img>
                                            <span className='m-2'>Baths & Spas</span>
                                        </div>
                                        <div className='card d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Vanities')}>
                                            <img src="assets/ui/Vanities.png"></img>
                                            <span className='m-2'>Vanities</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap w-100">
                                    <div className="d-flex flex-wrap w-100 cards">
                                        <div className='card  d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Shavers & Mirrors')}>
                                            <img src="assets/ui/Shavers and Mirrors.png"></img>
                                            <span className='m-2'>Shavers & Mirrors</span>
                                        </div>
                                        <div className='card d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Basins')}>
                                            <img src="assets/ui/Basins.png"></img>
                                            <span className='m-2'>Basins</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap w-100">
                                    <div className="d-flex flex-wrap w-100 cards">
                                        <div className='card  d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Showers')}>
                                            <img src="assets/ui/Showers.png"></img>
                                            <span className='m-2'>Showers</span>
                                        </div>
                                        <div className='card d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Tapware & Accessories')}>
                                            <img src="assets/ui/Tapware & Accessories.png"></img>
                                            <span className='m-2'>Tapware & Accessories</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap w-100">
                                    <div className="d-flex flex-wrap w-100 cards">
                                        <div className='card  d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Toilets')}>
                                            <img src="assets/ui/Toilets.png"></img>
                                            <span className='m-2'>Toilets</span>
                                        </div>
                                        <div className='card d-flex align-items-center text-center p-2 rounded card1' onClick={() => change('Wastes & Plumbing')}>
                                            <img src="assets/ui/Wastes & Plumbing.png"></img>
                                            <span className='m-2'>Wastes & Plumbing</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                }
            </div>

            <div className='roomsSideBar' style={{ marginLeft: (menuOption[3] && !isCategory ? 0 : -400) }} >
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>Styling</h6>
                    <span className='close'>X</span>
                </div>
                <div className="d-flex flex-wrap w-100">
                    <h6 className='trig-btn  w-100' style={{ color: "#555", paddingLeft: "20px", height: "30px" }}> Select New Tile</h6>
                    <div className="height_vh">
                        <div className="d-flex flex-wrap w-100 justify">
                            <div className='card m-2 p-4 d-flex align-items-center text-left p-2 rounded' style={{ width: "45%" }}>
                                <img style={{ width: "100px", height: "100px" }} src="assets/tiles/tiled1.jpg"></img>
                                <span className='m-2' style={{ fontSize: "12px" }}>Revival Penny Blu Title</span>
                                <span className='m-2' style={{ fontSize: "12px" }}>200x200mm</span>
                                <div className='hover1'><p>+</p></div>
                            </div>
                            <div className='card m-2 p-4 d-flex align-items-center text-left p-2 rounded' style={{ width: "45%" }}>
                                <img style={{ width: "100px", height: "100px" }} src="assets/tiles/tiled2.png"></img>
                                <span className='m-2' style={{ fontSize: "12px" }}>Revival Penny Blu Title</span>
                                <span className='m-2' style={{ fontSize: "12px" }}>200x200mm</span>
                                <div className='hover1'><p>+</p></div>
                            </div>
                            <div className='card m-2 p-4 d-flex align-items-center text-left p-2 rounded' style={{ width: "45%" }}>
                                <img style={{ width: "100px", height: "100px" }} src="assets/tiles/tiled3.png"></img>
                                <span className='m-2' style={{ fontSize: "12px" }}>Revival Penny Blu Title</span>
                                <span className='m-2' style={{ fontSize: "12px" }}>200x200mm</span>
                                <div className='hover1'><p>+</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='roomsSideBar' style={{ marginLeft: (menuOption[4] && !isCategory ? 0 : -400) }} >
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>Product Summary</h6>
                    <span className='close'>X</span>
                </div>
            </div>

            <div className='roomsSideBar' style={{ marginLeft: (menuOption[5] && !isCategory ? 0 : -400) }} >
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>Consultation</h6>
                    <span className='close'>X</span>
                </div>
            </div>

            <div className='roomsSideBar' style={{ marginLeft: (menuOption[6] && !isCategory ? 0 : -400) }} >
                <div className='d-flex r_title border-bottom'>
                    <h6 className='trig-btn  py-3 w-100' style={{ color: "#555", marginTop: "0" }}>Exit Plan</h6>
                    <span className='close'>X</span>
                </div>
            </div>
            <div className="col-12 position-relative p-0 m-0">
                <div id='measures' style={{ display: STORE.view !== 1 ? '' : 'none' }} className="top-0 start-0 position-absolute w-100 h-100">
                </div>
                <div className='canvas'>
                    <div id="canvas-container" className='border col-12' style={{ "backgroundColor": "#ddd" }}>

                    </div>
                    <div className='functionBoard' onClick={() => { deleteObject() }}><i className='fa fa-trash'></i></div>
                </div>
                <div className="rightSideBar" style={{ left: window.innerWidth - 150 }}>
                    <div>
                        <img onClick={e => STORE.view = 0} className={(STORE.view === 0 ? 'active ' : '') + 'btn p-2 bg-light m-3 rounded-1 padding'} src="assets/ui/2d.png" alt="" />
                        <img onClick={e => STORE.view = 1} className={(STORE.view === 1 ? 'active ' : '') + 'btn p-2 bg-light  m-3 rounded-1 padding'} src="assets/ui/3d.png" alt="" />
                        <img className="btn p-2 bg-light  m-3 rounded-1 padding" src="assets/ui/VR.png" alt="" />
                        <img onClick={e => { STORE.scale += 0.1; console.log(STORE.scale); init() }} className='d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius' src="assets/ui/zoomin.svg" alt="" />
                        <img onClick={e => { STORE.scale -= 0.1; console.log(STORE.scale); init() }} className='d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius' src="assets/ui/zoomout.svg" alt="" />
                        <img className='d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius1' src="assets/ui/back.png" style={{ width: "37px" }} alt="" />
                        <img className='d-block shadow-focus btn p-2 bg-light  m-3 rounded-1 radius1' src="assets/ui/forward.png" style={{ width: "37px" }} alt="" />
                    </div>
                </div>
                <div className='modal' style={{ display: (show ? "block" : "none") }}>
                    <div className='create_window'>
                        <div className='main_window1'>
                            <span className='close1' onClick={() => setShow(false)}>&times;</span>
                            <label><small>Image file </small></label>
                            <input type='file' onChange={handleChange} accept="" />
                            <br />
                            <button onClick={handleUpload}>Upload to Firebase</button>
                            <p>{percent} % done</p>
                            <label><small>3D model file </small></label>
                            <input type='file' onChange={handleChange1} accept="" />
                            <br />
                            <button onClick={handleUpload1}>Upload to Firebase</button>
                            <p>{percent1} % done</p>
                            <div className='image_info'>
                                <label>Title:&nbsp;
                                    <input type='text' value={title} onChange={onChangeTitle} required />
                                </label>
                                <img className='uploadimage' src={imageURL} alt="" />
                                <button className='submit_button' onClick={saveData}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
});

export default UI;