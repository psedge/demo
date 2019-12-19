import { VRButton } from './vrbutton.js';

var Murj = {
    container: null,
    camera: null,
    renderer: null,
    backgroundScene: null,
    scene: null,
    columns: [],
    init: function() {
        this.container = document.querySelector("#scene-container");

        this.backgroundScene = new THREE.Scene();
        this.backgroundScene.background = new THREE.Color(0x000000);
        this.scene = new THREE.Scene();

        const fov = 60;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const near = 0.1;
        const far = 1000;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(12, -2, -10);

        const light = new THREE.DirectionalLight(0x5a5a5a, 10.0);
        light.position.set(0, 10, 0);
        this.scene.add(light);

        const foreLight = new THREE.SpotLight(0xFFFFFF, 1.0);
        foreLight.position.set(0, 5, 25);
        foreLight.target.position.set(0, 0, 10);
        this.scene.add(foreLight);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.vr.enabled = true;
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.autoClear = false;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setAnimationLoop(this.animate);

        this.container.appendChild(this.renderer.domElement);
        document.body.appendChild( VRButton.createButton( this.renderer ) );

        for (var x = -400; x < 400; x += 25) {
            for (var z = 0; z > -200; z -= 25) {
                this.columns.push(this.column(x, 1, z))
            }
        }

        var columnsGeo = new THREE.Geometry();
        for (var c in this.columns) {
            columnsGeo.merge(this.columns[c].geometry, this.columns[c].matrix)
        }
        let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true});
        material.opacity = 0.5;
        let innerMesh = new THREE.Mesh(columnsGeo, material);
        this.scene.add(innerMesh);
        this.start();

        return this
    },
    animate: function() {
        window.murj.columns.forEach(function (c, i) {
            if (c.position.z > window.murj.camPos) {
                window.murj.scene.remove(c);
                delete window.murj.columns[i];
            }
        });
        window.murj.renderer.render(window.murj.backgroundScene, window.murj.camera);
        window.murj.renderer.render(window.murj.scene, window.murj.camera);
    },
    column: function(x, y, z) {
        let geometry = new THREE.BoxGeometry(15, 75, 15);
        let material = new THREE.MeshStandardMaterial({color: 0x5500FF, transparent: true});
        material.opacity = 0.1;

        let innerMesh = new THREE.Mesh(geometry, material);
        innerMesh.position.set(x, y, z);
        innerMesh.updateMatrix();
        return innerMesh;
    },
    start: function() {
        window.murj.camPos = 10;
        setInterval(function () {
            if (window.murj.camPos < -200 ) return

            window.murj.camPos -= 0.05;
            window.murj.camera.position.z = window.murj.camPos;
            if (window.murj.camPos % 25 == 0) {
                window.murj.camera.lookAt(new THREE.Vector3(12, -2, window.murj.camPos))
            }
            window.murj.camera.updateProjectionMatrix();
        }, 10)
    }
};

window.murj = Murj;