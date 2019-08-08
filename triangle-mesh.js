function triangle(scene) {
    //create a triangular geometry
    var geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vector3( -5, -5, 0 ) );
    geometry.vertices.push( new THREE.Vector3(  5, -5, 0 ) );
    geometry.vertices.push( new THREE.Vector3(  5,  5, 0 ) );

//create a new face using vertices 0, 1, 2
    var normal = new THREE.Vector3( 0, 1, 0 ); //optional
    var color = new THREE.Color( 0xffaa00 ); //optional
    var face = new THREE.Face3( 0, 1, 2, normal, color, 0 );

//add the face to the geometry's faces array
    geometry.faces.push( face );

//the face normals and vertex normals can be calculated automatically if not supplied above
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    scene.add( new THREE.Mesh( geometry, material ) );
}
