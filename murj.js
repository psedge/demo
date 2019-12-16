let container;
let camera;
let renderer;
let scene;
let halted = false;

let columns = []

function init() {
    // Get a reference to the container element that will hold our scene
    container = document.querySelector("#scene-container");

    // create scenes
    backgroundScene = new THREE.Scene();
    backgroundScene.background = new THREE.Color(0x000000);
    scene = new THREE.Scene();

    // set up the options for a perspective camera
    const fov = 60; // fov = Field Of View
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // every object is initially created at ( 0, 0, 0 )
    // we'll move the camera back a bit so that we can view the scene
    camera.position.set(0, -2, -10);

    // Create a directional light
    const light = new THREE.DirectionalLight(0x5a5a5a, 10.0);
    light.position.set(0, 10, 0);
    scene.add(light);

    const foreLight = new THREE.SpotLight(0xFFFFFF, 1.0);
    foreLight.position.set(0, 5, 25);
    foreLight.target.position.set(0, 0, 10);
    scene.add(foreLight);

    var ambientLight = new THREE.AmbientLight(0x404040); // soft white light

    // create a WebGLRenderer and set its width and height
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.autoClear = false;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);

    // add the automatically created <canvas> element to the page
    container.appendChild(renderer.domElement);

    for (var x = -400; x < 400; x += 25) {
        for (var z = 0; z > -200; z -= 25) {
            if (x > -4 && x < 4) {
                continue
            }
            columns.push(column(x, 1, z))
        }
    }
    
    var columnsGeo = new THREE.Geometry();
    for (c in columns) {
        columnsGeo.merge(columns[c].geometry, columns[c].matrix)
    }
    let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true});
    material.opacity = 0.5;
    let innerMesh = new THREE.Mesh(columnsGeo, material);
    scene.add(innerMesh)
}

let camPos = 10;

setInterval(function () {
    if (camPos < -200 ) return
    camera.position.z = camPos;
    camPos -= 0.05;
}, 1)

function animate() {
    if (halted) return

    requestAnimationFrame(animate);

    columns.forEach(function (c, i) {
        if (c.position.z > camPos) {
            scene.remove(c)
            delete columns[i];
        }
    })

    renderer.render(backgroundScene, camera);
    renderer.render(scene, camera);
}

function column(x, y, z) {
    let geometry = new THREE.BoxGeometry(20, 75, 20);
    let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true});
    material.opacity = 0.1;

    let innerMesh = new THREE.Mesh(geometry, material);
    innerMesh.position.set(x, y, z);
    innerMesh.updateMatrix();
    return innerMesh;
}

init();

animate();
