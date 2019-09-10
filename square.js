// contexts
let container;
let camera;
let renderer;
let scene;
let foreLight;
let clock = new THREE.Clock();
let columns = []

// stats
let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// initials
let cameraPositionInitial = {x: 0, y: 1600, z:0}

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

function init(quant) {
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
    const far = 3000;

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
    columns = []
    container.appendChild(renderer.domElement);
    for (var x = -quant; x <= quant; x += 1) {
        for (var z = -quant; z <= quant; z += 1) {
            columns.push({
                mesh: column(x, 1, z),
                position: {'x': x, 'y': 1, 'z': z}
            })
        }
    }
}

function animate() {
    setTimeout( function() {
        stats.begin();
        requestAnimationFrame( animate );
        window.requestIdleCallback(start)
        stats.end();
    }, 1000 / 60 );

    renderer.render(backgroundScene, camera);
    renderer.render(scene, camera);

    if (typeof roadScene != 'undefined') renderer.render(roadScene, camera);
}

let order = [];
let halt = false
let routineItem = 0;

function start() {
    if (halt) return;
    let zoom1 = 1
    let move1 = 1
    let zoom2 = 1
    let move2 = 1.5

    return zoomIn((zoom1 - (zoom1 - clock.getElapsedTime())) / zoom1,  {start: cameraPositionInitial.y, end: 250}, function() {
        return moveColumn((move1 - (move1 - clock.getElapsedTime() + zoom1)) / move1,  {x: 0.05, y: 0, z: 0.05}, function() {
            return zoomIn((zoom2 - (zoom2 - clock.getElapsedTime() + zoom1+move1)) / zoom2,  {start: 250, end: 100}, function() {
                return moveColumn((move2 - (move2 - clock.getElapsedTime() + zoom1+move1+zoom2)) / move2,  {x: 0.1, y: 0, z: 0.1}, function() {
                    resetCamera(true, false, true)
                    resetColumns()
                    clock.start()
                })
            })
        })
    })
}

function zoomIn(progress, options, callback) {
    if (progress > 1) {
        return callback();
    }
    camera.position.y = options['start'] - (progress * (options['start'] - options['end']))
}

function moveColumn(progress, options, callback) {
    if (progress > 1) {
        return callback();
    }
    moveColumns((progress)*options['x'], (progress)*options['y'], (progress)*options['z'])
}

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

let c = new THREE.Clock(true)
let since = 0;
function ifReady(milliseconds, callback) {
    since += c.getDelta()
    if (since > milliseconds) {
        since = 0
        return callback()
    }
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
    ifReady(0.005, () => columns.forEach(function (c, i) {
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
    camera.position.x = cameraPositionInitial.x
    camera.position.y = cameraPositionInitial.y
    camera.position.z = cameraPositionInitial.z
    return;

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

init(3)

resetCamera()

animate()

addForelight()