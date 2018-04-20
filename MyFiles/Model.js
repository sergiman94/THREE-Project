
var mixer;

function Model() {

  this.showModelWithTexture = function (x, y, z, rotate, modelMtl, modelObj) {
    var mtlLoader = new THREE.MTLLoader();
  	mtlLoader.load(modelMtl, function(materials){

  		materials.preload();
  		var objLoader = new THREE.OBJLoader();
  		objLoader.setMaterials(materials);

  		objLoader.load(modelObj, function(mesh){

  			mesh.traverse(function(node){
  				if( node instanceof THREE.Mesh ){
  					node.castShadow = true;
  					node.receiveShadow = true;
  				}
  			});
  			scene.add(mesh);
  			mesh.position.set(x, y, z);
  			mesh.rotation.y = -Math.PI/rotate;
  		});

  	});
  }

  this.showModelWithoutTexture = function (x, y, z, rotate, modelObj) {
    var objLoader = new THREE.OBJLoader();
  	objLoader.load(modelObj, function(mesh){

  		mesh.traverse(function(node){
  			if( node instanceof THREE.Mesh ){
  				node.castShadow = true;
  				node.receiveShadow = true;
  			}
  		});

  		scene.add(mesh);
  		mesh.position.set(x, y, z);
  		mesh.rotation.y = -Math.PI/rotate;
  	});
  }

  this.modelLoadWithJSON = function (objPath) {

    mixer = new THREE.AnimationMixer( scene );
		var loader = new THREE.JSONLoader();

    loader.load( objPath, function ( geometry, materials ) {
			//adjust color a bit
		  //var material = materials[0];

			//materials.morphTargets = true;
			//materials.color.setHex( 0xFACC2E );

			var mesh = new THREE.Mesh( geometry, materials );

      mesh.scale.set(40, 40, 40);

      mesh.position.set(-80,50,-14);
      mesh.rotation.y = -Math.PI/2;
			mesh.matrixAutoUpdate = false;
			mesh.updateMatrix();
			scene.add( mesh );

    });
  }
}
