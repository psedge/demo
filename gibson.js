// contexts
let container;
let camera;
let renderer;
let scene;
let clock = new THREE.Clock();
let foreLight;

let columns = []

// initials
let cameraPositionInitial = {x: 0, y: 1000, z:0}
let bpm = 100
let msPerBeat = 60000 / bpm

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createLights() {
    // Create a directional light
//    const light = new THREE.DirectionalLight(0x5a5a5a, 10.0);
    const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(0, 10, 0);
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
    const far = 1000;

    createLights()

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // every object is initially created at ( 0, 0, 0 )
    // we'll move the camera back a 4bit so that we can view the scene
//    camera.position.set(0, -2, -10);
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

    for (var x = -30; x < 30; x += 2) {
        for (var z = 30; z > -30; z -= 2) {
            columns.push({
                mesh: column(x, 1, z),
                position: {'x': x, 'y': 1, 'z': z}
            })
        }
    }

    var material = new THREE.MeshBasicMaterial({color: 0x00cc00});
}

let camPos = 10;

function animate() {
    requestAnimationFrame(animate);

    renderer.render(backgroundScene, camera);
    renderer.render(scene, camera);

    if (typeof roadScene != 'undefined') renderer.render(roadScene, camera);
}

let halt = false
let routineItem = -1;
let subRoutineItem = 0;
let itemCount = 500;
let lastTime = 0;

clock.start()

function routine() {
    setInterval(async function () {
        if (halt) return

        // initial zoom
        if (routineItem == -1) {
            if (itemCount > 100) {
//                camera.position.y = itemCount
                itemCount -= 1
                waitFor(0.01, function() { camera.position.y = itemCount })
                return
            }
            routineItem = 0;
        }

        // explode
        if (routineItem == 0) {
            moveColumns(0.01, 0, 0.01)
            if (itemCount > 50) {
                routineItem = 1
                itemCount = 0
            }
            itemCount++
        }

        // camera rotate on axis
        if (routineItem == 1) {
            rotations = 91

            if (itemCount <= rotations) {
                if (lastTime > (msPerBeat / 1000)) {
                    camera.rotation.z += Math.PI / 180
                    itemCount += 1
                } else {
                    console.log("waiting")
                }
                lastTime += clock.getDelta()
            }

            if (itemCount >= rotations) {
                itemCount = 0
                routineItem = 2
            }
        }

        // implode
        if (routineItem == 2) {
            clock.start()
            moveColumns(-0.01, 0, -0.01)
            if (itemCount > 50) {
                routineItem = 3
                itemCount = 0
                console.log(clock.getDelta() * 1000)
            }
            itemCount++
        }

        // camera rotate back on axis
        if (routineItem == 3) {
            rotations = 91

            if (itemCount <= rotations) {
                if (lastTime > ( msPerBeat / 1000 )) {
                    camera.rotation.z += Math.PI / 180
                    itemCount += 1
                } else {
                    console.log("waiting")
                }
                lastTime += clock.getDelta()
            }

            if (itemCount >= rotations) {
                itemCount = 0
                routineItem = 4
            }
        }

        // make some pink
        if (routineItem == 4) {
            colors()
            routineItem = 0
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

    }, 10)

}

function waitFor(milliseconds, callback) {
//    sinceStart = 0
//
//    while (sinceStart < milliseconds) {
//        sinceStart += clock.getDelta()
//    }
    return callback()
}

function colors() {
    candidates = []
    subRoutineItem = 0

    if (subRoutineItem == 0) {
        candidates = {
            '{"x":0,"y":1,"z":-2}': 0xFC427B,
            '{"x":0,"y":1,"z":2}': 0xFC427B,
            '{"x":-2,"y":1,"z":0}': 0xFC427B,
            '{"x":2,"y":1,"z":0}': 0xFC427B
        }

        waitFor(0.5, function () {
            columns.forEach(function (c, i) {
                index = Object.keys(candidates).indexOf(JSON.stringify(c.position))
                if (index > -1) {
                    c.mesh.material.color.setHex(JSON.stringify(c.position))
                }
            })
        })

        subRoutineItem +=1
    }
    if (subRoutineItem == 1) {
        candidates = {
            '{"x":-2,"y":1,"z":2}': 0xFD7272,
            '{"x":-2,"y":1,"z":0}': 0xFD7272,
            '{"x":-2,"y":1,"z":-2}': 0xFD7272,

            '{"x":0,"y":1,"z":-2}': 0xFD7272,
            '{"x":0,"y":1,"z":2}': 0xFD7272,

            '{"x":2,"y":1,"z":2}': 0xFD7272,
            '{"x":2,"y":1,"z":0}': 0xFD7272,
            '{"x":2,"y":1,"z":-2}': 0xFD7272
        }
        waitFor(0.5, function () {
            columns.forEach(function (c, i) {
                index = Object.keys(candidates).indexOf(JSON.stringify(c.position))
                if (index > -1) {
                    c.mesh.material.color.setHex(JSON.stringify(c.position))
                }
            })
        })

        subRoutineItem +=1
    }
    if (subRoutineItem == 3) {
        candidates = {
            '{"x":-2,"y":1,"z":2}': 0xFFFFF,
            '{"x":-2,"y":1,"z":0}': 0xFFFFF,
            '{"x":-2,"y":1,"z":-2}': 0xFFFFF,

            '{"x":0,"y":1,"z":-2}': 0xFFFFF,
            '{"x":0,"y":1,"z":2}': 0xFFFFF,

            '{"x":2,"y":1,"z":2}': 0xFFFFF,
            '{"x":2,"y":1,"z":0}': 0xFFFFF,
            '{"x":2,"y":1,"z":-2}': 0xFFFFF,
        }
    }

    subRoutineItem += 1
}

function column(x, y, z) {
    let geometry = new THREE.BoxBufferGeometry(1, 10, 1);
//    let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true});
    let material = new THREE.MeshStandardMaterial({color: 0xFFFFFF, transparent: true});
//    material.opacity = Math.random();

    let innerMesh = new THREE.Mesh(geometry, material);
    innerMesh.position.set(x, y, z);
    scene.add(innerMesh);

    return innerMesh;
}

function moveColumns(x, y, z) {
    columns.forEach(function (c, i) {
        c.mesh.position.x += x * c.mesh.position.x
        c.mesh.position.y += y * c.mesh.position.y
        c.mesh.position.z += z * c.mesh.position.z

        return
//        if (c.position.z > camPos) {
//            scene.remove(c)
//            delete columns[i];
//        }
    })

}

function drawRoad() {
    roadScene = new THREE.Scene();

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

init();

animate();

routine();