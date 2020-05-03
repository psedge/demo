import {VRButton} from './vrbutton.js';

let Gr1d = {
    bpm: 131,
    direction: 'N',
    color: 'black',
    user: null,
    renderer: null,
    backgroundScene: null,
    scene: null,
    mesh: null,
    time: 0,
    init: function () {
        let container = document.querySelector("#scene-container");
        this.backgroundScene = new THREE.Scene();
        this.backgroundScene.background = new THREE.Color(0x000000);
        this.scene = new THREE.Scene();

        const fov = 60;
        const aspect = container.clientWidth / container.clientHeight;
        const near = 0.1;
        const far = 1000;

        this.user = new THREE.Group();
        this.user.position.set(0, 0, 0);
        let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.user.add(camera);
        this.scene.add(this.user);

        const light = new THREE.HemisphereLight(0xFFFFFF, 10.0);
        light.position.set(0, 10, -20);
        this.scene.add(light);

        const foreLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        foreLight.position.set(0, 5, 25);
        this.scene.add(foreLight);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.vr.enabled = true;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.autoClear = false;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setAnimationLoop(this.animate);

        container.appendChild(this.renderer.domElement);
        document.body.appendChild(VRButton.createButton(this.renderer));

        this.initBoxes();
        this.start();

        return this
    },
    initBoxes: function () {
        let getRowMesh = function (z) {
            for (let child in window.gr1d.scene.children) {
                let row = window.gr1d.scene.children[child];
                if (row.type == 'Mesh' && row.z == z) {
                    return row
                }
            }
            return false
        };

        let addRowToScene = function (columns, scene, z) {
            let row = new THREE.Geometry();
            for (let c in columns) {
                row.merge(columns[c].geometry, columns[c].matrix)
            }
            let mesh = new THREE.Mesh(row, new THREE.MeshStandardMaterial({
                color: 0x5500FF,
                transparent: true,
                opacity: 0.5
            }));
            mesh.z = z;
            scene.add(mesh);
        };
        for (let y = -37.5; y <= 37.5; y += 25) {
            for (let z = -87.5; z < 100; z += 25) {
                if (!getRowMesh(Math.round(z))) {
                    let columns = [];
                    for (let x = -87.5; x <= 87.5; x += 25) {
                        columns.push(window.gr1d.column(x, y, z))
                    }
                    addRowToScene(columns, window.gr1d.scene, z)
                }
            }
        }
    },
    animate: function () {
        window.gr1d.renderer.render(window.gr1d.backgroundScene, window.gr1d.user.children[0]);
        window.gr1d.renderer.render(window.gr1d.scene, window.gr1d.user.children[0]);

    },
    column: function (x, y, z) {
        let geometry = new THREE.BoxGeometry(15, 15, 15);
        let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true, opacity: 0.1});
        let innerMesh = new THREE.Mesh(geometry, material);
        innerMesh.position.set(x, y, z);
        innerMesh.updateMatrix();
        return innerMesh;
    },
    start: function () {
        let beat = 60000 / window.gr1d.bpm;
        setInterval(function () {
            switch (window.gr1d.direction) {
                case "N":
                    window.gr1d.user.position.z -= 250 / beat;
                    break;
                case "E":
                    window.gr1d.user.position.x += 250 / beat;
                    break;
                case "W":
                    window.gr1d.user.position.x -= 250 / beat;
                    break;
                case "S":
                    window.gr1d.user.position.z += 250 / beat;
                    break;
                case "D":
                    window.gr1d.user.position.y -= 250 / beat;
                    break;
                case "U":
                    window.gr1d.user.position.y += 250 / beat;
                    break;
            }
        }, 10)
        setInterval(function () {

            // Please return to the game area
            if (window.gr1d.user.position.z > 74) {
                window.gr1d.direction = "N"
                return
            }
            if (window.gr1d.user.position.z < -62) {
                window.gr1d.direction = "S"
                return
            }
            if (window.gr1d.user.position.x > 62) {
                window.gr1d.direction = "W"
                return
            }
            if (window.gr1d.user.position.x < -62) {
                window.gr1d.direction = "E"
                return
            }
            if (window.gr1d.user.position.y > 37.5) {
                window.gr1d.direction = "D"
                return
            }
            if (window.gr1d.user.position.y < -37.5) {
                window.gr1d.direction = "U"
                return
            }

            let directions = ["N", "E", "S", "W", "U", "D"]
            directions.splice(directions.indexOf(window.gr1d.direction), 1)
            window.gr1d.direction = directions[Math.floor(Math.random() * directions.length)]

        }, beat)
        setInterval(function () {
            let colors = ["#FFC312", "#C4E538", "#12CBC4", "#FDA7DF", "#ED4C67", "#F79F1F", "#A3CB38", "#1289A7", "#D980FA",
                "#B53471", "#EE5A24", "#009432", "#0652DD", "#9980FA", "#833471", "#EA2027", "#006266", "#1B1464", "#5758BB"]
            let color = colors[Math.floor(Math.random() * colors.length)]
            for (let child in window.gr1d.scene.children) {
                let row = window.gr1d.scene.children[child];
                if (row.type == 'Mesh') {
                    row.material.color.set(color)
                }
            }
            // window.gr1d.user.rotateY(1.5708)
        }, beat * 4)
        setInterval(function () {
            if (window.gr1d.color == 'black') {
                window.gr1d.backgroundScene.background = new THREE.Color(255, 255, 255);
                window.gr1d.color = 'white'
                return
            }
            window.gr1d.backgroundScene.background = new THREE.Color(0, 0, 0);
        }, beat * 16)
    }
};

window.gr1d = Gr1d;