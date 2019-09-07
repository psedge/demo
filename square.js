// contexts
let container;
let camera;
let renderer;
let scene;
let clock = new THREE.Clock();
let foreLight;

// metronome
//let audioContext = new AudioContext();

// stats
let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
let columns = []

// initials
let cameraPositionInitial = {x: 0, y: 1250, z:0}

function createLights() {
    // Create a directional light
//    const light = new THREE.DirectionalLight(0x5a5a5a, 10.0);
    const light = new THREE.DirectionalLight(0xFFFFFF, 10.0);
    light.position.set(0, 100, 0);
    scene.add(light);
}

function addForelight() {
    foreLight = new THREE.SpotLight(0xFFFFFF, 1.0);
    foreLight.position.set(0, 5, 25);
    foreLight.target.position.set(0, 0, 10);
    scene.add(foreLight);
}

function removeForelight() {
    scene.remove(foreLight)
}

function playNote(freq, bpm) {
    let osc = audioContext.createOscillator();
    osc.connect( audioContext.destination );
    osc.frequency.value = freq;
    osc.start( audioContext.currentTime );
    osc.stop( audioContext.currentTime + 1/bpm );
}

function init() {
    // Get a reference to the container element that will hold our scene
    container = document.querySelector("#scene-container");

    // create scenes
    backgroundScene = new THREE.Scene();
    backgroundScene.background = new THREE.Color(0x000000);
    scene = new THREE.Scene();

    // set up the options for a perspective camera
    const fov = 35; // fov = Field Of View
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1500;

    createLights()

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // every object is initially created at ( 0, 0, 0 )
    // we'll move the camera back a 4bit so that we can view the scene
    camera.position.set(cameraPositionInitial.x, cameraPositionInitial.y, cameraPositionInitial.z);
    camera.lookAt( new THREE.Vector3(0, 0, 0));

    // create a WebGLRenderer and set its width and height
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.autoClear = false;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);

    // add the automatically created <canvas> element to the page
    container.appendChild(renderer.domElement);
    quant = 6;
    for (var x = -quant; x <= quant; x += 1) {
        for (var z = -quant; z <= quant; z += 1) {
            columns.push({
                mesh: column(x, 1, z),
                position: {'x': x, 'y': 1, 'z': z}
            })
        }
    }
}

let camPos = 10;

function animate() {
    setTimeout( function() {
        stats.begin();
        requestAnimationFrame( animate );
        window.requestIdleCallback(routine)
        stats.end();
    }, 1000 / 60 );

    renderer.render(backgroundScene, camera);
    renderer.render(scene, camera);

    if (typeof roadScene != 'undefined') renderer.render(roadScene, camera);
}

let order = [];

let halt = false
let routineItem = 0;
let itemCount = cameraPositionInitial.y;
let lastTime = 0;

clock.start()

function routine() {
    if (halt) return
//    if (order.length == 0) order = [0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, -1]
    if (order.length == 0) order = [0, 1, 2, 1, 2, 1, 2, 1, -1]
    // if (order.length == 0) order = [1]
    resetCamera(true, false, true)

    if (order[0] == -1) {
        itemCount = cameraPositionInitial.y
        camera.position.y = cameraPositionInitial.y
        resetColumns()
        order.shift()
    }

    // initial zoom
    if (order[0] == 0) {
        if (itemCount > 100) {
            itemCount -= 10
            ifReady(0.01, function() { camera.position.y = itemCount })
            return
        }
        order.shift()
        itemCount = 0
    }

    // explode
    if (order[0] == 1) {
        moveColumns(0.03, 0, 0.03)
        if (itemCount > 30) {
            order.shift()
            itemCount = 0
            return
        }
        itemCount++
    }

    // camera rotate on axis
    if (order[0] == 2) {
        rotations = 45

        if (itemCount <= rotations) {
            camera.rotation.z += 2*Math.PI / 180
            itemCount += 1
        }

        if (itemCount >= rotations) {
            camera.rotation.z = roundUpToNearest(camera.rotation.z, Math.PI/2)
            itemCount = 0
            order.shift()
            return
        }
    }

    // implode
    if (order[0] == 3) {
        moveColumns(-0.01, 0, -0.01)
        if (itemCount > 30) {
            order.shift()
            itemCount = 0
            return
        }
        itemCount++
    }

    // camera rotate back on axis
    if (order[0] == 4) {
        rotations = 45

        if (itemCount <= rotations) {
            camera.rotation.z += 2 * Math.PI / 180
            itemCount += 1
        }

        if (itemCount >= rotations) {
            camera.rotation.z = roundUpToNearest(camera.rotation.z, Math.PI/2)
            if (camera.rotation.z == 2*Math.PI) camera.rotation.z = 0
            itemCount = 0
            order.shift()
            return
        }
    }

    // make some pink
    if (order[0] == 5) {
        colors(0)
        order.shift()
    }

    // make some pink
    if (order[0] == 6) {

        columns.forEach(function (c, i) {
            if (c.position.x > 0) {
                c.mesh.material.color.setHex(0xFC427B)
            }
        })
        order.shift()
    }

    // perspective
    if (routineItem == 'a') {
        if (itemCount < 2) {
            if (lastTime > 0.1 && itemCount == 0) {
                addForelight()
                lastTime = 0
                itemCount = 1
            }

            if (lastTime > 0.5) {
                removeForelight()
                lastTime = 0
                itemCount = 2
            }

            lastTime += clock.getDelta()

        }
        routineItem = 0
    }
}

function waitFor(milliseconds, callback) {
    var c = new THREE.Clock(true)

    sinceStart = 0
    while (sinceStart < milliseconds) {
        sinceStart += c.getDelta()
    }
    return callback()
}

let c = new THREE.Clock(true)
let since = 0;
function ifReady(milliseconds, callback) {
    since += c.getDelta()
    if (since > milliseconds) {
        since = 0
        return callback()
    }
}

function colors(subRoutine) {
    candidates = []

    if (subRoutine == 0) {
        candidates = {
            '{"x":-2,"y":1,"z":-4}': 0xFF0000,
            '{"x":2,"y":1,"z":-4}': 0xFF0000,
            //mouth
            '{"x":-4,"y":1,"z":4}': 0x000000,
            '{"x":-4,"y":1,"z":2}': 0x000000,
            '{"x":-2,"y":1,"z":4}': 0x000000,
            '{"x":0,"y":1,"z":4}': 0x000000,
            '{"x":2,"y":1,"z":4}': 0x000000,
            '{"x":4,"y":1,"z":4}': 0x000000,
            '{"x":4,"y":1,"z":2}': 0x000000,
        }
    }
    if (subRoutine == 1) {
        candidates = {
            '{"x":-2,"y":1,"z":-4}': 0xFF0000,
            '{"x":2,"y":1,"z":-4}': 0xFF0000,
            //mouth
            '{"x":-4,"y":1,"z":4}': 0x000000,
            '{"x":-4,"y":1,"z":2}': 0x000000,
            '{"x":-2,"y":1,"z":4}': 0x000000,
            '{"x":0,"y":1,"z":4}': 0x000000,
            '{"x":2,"y":1,"z":4}': 0x000000,
            '{"x":4,"y":1,"z":4}': 0x000000,
            '{"x":4,"y":1,"z":2}': 0x000000,
        }
    }

    columns.forEach(function (c, i) {
        index = Object.keys(candidates).indexOf(JSON.stringify(c.position))
        if (index > -1) {
            c.mesh.material.color.setHex(candidates[JSON.stringify(c.position)])
        }
    })
}

function roundUpToNearest(number, multiple) {
    var half = multiple/2
    return Math.max(multiple, number+half - (number+half) % multiple)
}

let material = new THREE.MeshLambertMaterial({color: 0xFFFFFF, transparent: true});
let geometry = new THREE.BoxBufferGeometry(1, 10, 1);

function column(x, y, z) {
    let innerMesh = new THREE.Mesh(geometry, material);
    innerMesh.position.set(x, y, z);
    scene.add(innerMesh);
    return innerMesh;
}

function moveColumns(x, y, z) {
    ifReady(0.01, () => columns.forEach(function (c, i) {
        c.mesh.position.x += x * c.mesh.position.x
        c.mesh.position.y += y * c.mesh.position.y
        c.mesh.position.z += z * c.mesh.position.z
    }))
}

function resetColumns() {
    columns.forEach(function (c, i) {
        c.mesh.position.x = c.position.x
        c.mesh.position.y = c.position.y
        c.mesh.position.z = c.position.z
    })
}

function resetCamera(x, y, z) {
    // if we had odd numbers, set camera to center col
    if (columns.length % 2 != 0) {
        var col = columns[Math.round(columns.length/2)-1].mesh.position
        if (x) camera.position.x = col.x
        if (y) camera.position.y = col.y
        if (z) camera.position.z = col.z
        return
    }
    let avgPosition = {x: 0, y: 0, z: 0}

    columns.forEach(function (c, i) {
        avgPosition.x += c.mesh.position.x
        avgPosition.y += c.mesh.position.y
        avgPosition.z += c.mesh.position.z
    })

    camera.position.x = avgPosition.x / columns.length + cameraPositionInitial.x
    camera.position.y = (avgPosition.y / columns.length) + cameraPositionInitial.y
    camera.position.z = avgPosition.z / columns.length + cameraPositionInitial.z
}

init()

resetCamera()

animate()

addForelight()