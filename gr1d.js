import {VRButton} from './vrbutton.js';

let Gr1d = {
    direction: 'N',
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
        this.user.position.set(12, -2, -0);
        let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.user.add(camera);
        this.scene.add(this.user);

        const light = new THREE.HemisphereLight(0xFFFFFF, 10.0);
        light.position.set(0, 10, -20);
        this.scene.add(light);

        const foreLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        foreLight.position.set(0, 5, 25);
//        foreLight.target.position.set(0, 0, 10);
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

        this.start();

        return this
    },
    animate: function () {
        window.gr1d.renderer.render(window.gr1d.backgroundScene, window.gr1d.user.children[0]);
        window.gr1d.renderer.render(window.gr1d.scene, window.gr1d.user.children[0]);

        const zp = Math.round(window.gr1d.user.position.z);

        if (Math.round(zp) % 25 != 0) {
            console.log(window.gr1d.user.position)
            return
        }

        let removeOldRows = function(zp, distance) {
            for (let child in window.gr1d.scene.children) {
                let row = window.gr1d.scene.children[child];
                if (row.z > zp + distance) {
                    row.geometry.dispose();
                    row.material.dispose();
                    window.gr1d.scene.remove(row);
                }
            }
        };

        let getRowMesh = function(z) {
            for (let child in window.gr1d.scene.children) {
                let row = window.gr1d.scene.children[child];
                if (row.type == 'Mesh' && row.z == z) {
                    return row
                }
            }
            return false
        };

        let addRowToScene = function(columns, scene, z) {
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

        removeOldRows(zp, 75);
        for (let z = zp+50; z > zp-200; z -= 30) {
            if (!getRowMesh(Math.round(z))) {
                let columns = [];
                for (let x = -25; x < 51; x += 25) {
                    columns.push(window.gr1d.column(x, 1, z))
                }
                addRowToScene(columns, window.gr1d.scene, z)
            }
        }
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
        setInterval(function () {
             if (Math.round(window.gr1d.user.position.z) == -22) {
                 window.gr1d.direction = 'W'
                 window.gr1d.user.rotateY(1.5708)
                 window.gr1d.user.position.z -= 1;
             }
             if (Math.round(window.gr1d.user.position.x) == -2) {
                window.gr1d.user.position.set(12, -2, -0);
                window.gr1d.direction = "N"
             }
            switch (window.gr1d.direction) {
                case "N":
                    window.gr1d.user.position.z -= 0.1;
                    break;
                case "W":
                    window.gr1d.user.position.x -= 0.1;
                    break;
                default:
                    console.log(window.gr1d.direction);
                    break;
            }
            window.gr1d.time += 0.0005
        }, 1)
    }
};

window.gr1d = Gr1d;