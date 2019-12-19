import {VRButton} from './vrbutton.js';

let Murj = {
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
        this.user.position.set(12, -2, 0);
        let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.user.add(camera);
        this.scene.add(this.user);

        const light = new THREE.DirectionalLight(0x5a5a5a, 10.0);
        light.position.set(0, 10, 0);
        this.scene.add(light);

        const foreLight = new THREE.SpotLight(0xFFFFFF, 1.0);
        foreLight.position.set(0, 5, 25);
        foreLight.target.position.set(0, 0, 10);
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
        window.murj.renderer.render(window.murj.backgroundScene, window.murj.user.children[0]);
        window.murj.renderer.render(window.murj.scene, window.murj.user.children[0]);

        const zp = Math.round(window.murj.user.position.z);
        if (Math.round(zp) % 25 != 0) {
            console.log(Math.round(zp))
            return
        }

        let removeOldRows = function(zp, distance) {
            for (let child in window.murj.scene.children) {
                let row = window.murj.scene.children[child];
                if (row.z > zp + distance) {
                    row.geometry.dispose();
                    row.material.dispose();
                    window.murj.scene.remove(row);
                }
            }
        };

        let getRowMesh = function(z) {
            for (let child in window.murj.scene.children) {
                let row = window.murj.scene.children[child];
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
        for (let z = zp+50; z > zp-200; z -= 25) {
            if (!getRowMesh(Math.round(z))) {
                let columns = [];
                for (let x = -25; x < 51; x += 25) {
                    columns.push(window.murj.column(x, 1, z))
                }
                addRowToScene(columns, window.murj.scene, z)
            }
        }
    },
    column: function (x, y, z) {
        let geometry = new THREE.BoxGeometry(15, 75, 15);
        let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true, opacity: 0.1});
        let innerMesh = new THREE.Mesh(geometry, material);
        innerMesh.position.set(x, y, z);
        innerMesh.updateMatrix();
        return innerMesh;
    },
    start: function () {
        setInterval(function () {
            if (window.murj.user.position.z < -10000) return;
            // if (window.murj.user.position.z % 40 < 0.05) {
            //     window.murj.directon = 'W'
            // }
            switch (window.murj.direction) {
                case "N":
                    window.murj.user.position.z -= window.murj.time;
                    break;
                default:
                    console.log(window.murj.direction);
                    break;
            }
            window.murj.time += 0.0005
        }, 10)
    }
};

window.murj = Murj;