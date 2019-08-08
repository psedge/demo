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
    roadScene = new THREE.Scene();

    // set up the options for a perspective camera
    const fov = 35; // fov = Field Of View
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
    roadScene.add(ambientLight);
    const roadLight = new THREE.SpotLight(0xFFFFFF, 1.0);
    roadLight.position.set(0, 5, 25);
    roadLight.target.position.set(0, 0, 10);
    roadScene.add(roadLight)

    // create a WebGLRenderer and set its width and height
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.autoClear = false;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);

    // add the automatically created <canvas> element to the page
    container.appendChild(renderer.domElement);

    for (var x = -30; x < 30; x += 2) {
        for (var z = 0; z > -200; z -= 2) {
            if (x > -2 && x < 2) {
                continue
            }
            if (Math.random() * 200 > 1 / (Math.abs(z) / 200)) columns.push(column(x, 1, z))
        }
    }

    var material = new THREE.MeshStandardMaterial({color: 0x00cc00});

    var roadShape = new THREE.Shape();
    roadShape.moveTo(-1, 0)
    roadShape.lineTo(-.25, 28)
    roadShape.lineTo(0.25, 28)
    roadShape.lineTo(1, 0)
    var roadGeo = new THREE.ExtrudeGeometry(roadShape, {amount: 1, bevelEnabled: false})
    roadMesh = new THREE.Mesh(roadGeo, new THREE.MeshPhongMaterial({color: 0x000000}))
    roadMesh.rotation.x = 4.72;
    roadMesh.position.z = 5;
    roadMesh.position.y = -5;
    roadScene.add(roadMesh)
}

let camPos = 10;

setInterval(function () {
    if (camPos < -100 ) return
    camera.position.z = camPos;
    camPos -= 0.5;
    roadMesh.position.z -= 0.5
}, 10)

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
    renderer.render(roadScene, camera);
}

function column(x, y, z) {
    let geometry = new THREE.BoxBufferGeometry(1, 10, 1);
    let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true});
    material.opacity = Math.random();

    let innerMesh = new THREE.Mesh(geometry, material);
    innerMesh.position.set(x, y, z);
    scene.add(innerMesh);

    return innerMesh;
}

init();

animate();
