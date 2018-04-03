var clock = new THREE.Clock();
var floorObject;
var clickRequest = false;
var mouseCoords = new THREE.Vector2();

// Graphics variables
var container, stats;
var camera, controls, scene, renderer;
var ambientLight;

//Physics variables
var gravityConstant = -9.8;
var gravity = new Ammo.btVector3( 0, gravityConstant, 0 );
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();
var margin = 0.05
var physicsWorld;
var rigidBodies = [];
var raycaster = new THREE.Raycaster();
var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );
var transformAux1 = new Ammo.btTransform()

var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
var broadphase = new Ammo.btDbvtBroadphase();
var solver = new Ammo.btSequentialImpulseConstraintSolver();
var softBodySolver = new Ammo.btDefaultSoftBodySolver();
physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver)
physicsWorld.setGravity( gravity );
physicsWorld.getWorldInfo().set_m_gravity( gravity);




function PObjects(){

  this.createParalellepiped = function ( sx, sy, sz, mass, pos, quat, material) {

    var threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( margin );
    createRigidBody( threeObject, shape, mass, pos, quat );

    threeObject.castShadow = true
    threeObject.receiveShadow = true;


    // textureLoader.load( "models/grid.png", function( texture ) {
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set( 40, 40 );
    // ground.material.map = texture;
    // ground.material.needsUpdate = true;
    //} );

    return threeObject;
  }

  this.floor = function () {
    pos.set( 0, - 0.5, 0 );
    quat.set( 0, 0, 0, 1 );
    this.createParalellepiped(2000, 1, 2000, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ));
  }

}

function CustomSinCurve( scale ) {

	THREE.Curve.call( this );

	this.scale = ( scale === undefined ) ? 1 : scale;

}

function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {

    threeObject.position.copy( pos);
    threeObject.quaternion.copy( quat );

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

    var motionState = new Ammo.btDefaultMotionState( transform );
    var localInertia = new Ammo.btVector3( 0, 0, 0 );

    physicsShape.calculateLocalInertia( mass, localInertia );

    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );

    threeObject.userData.physicsBody = body;
    scene.add( threeObject );

    if ( mass > 0 ) {
      rigidBodies.push( threeObject );
      // Disable deactivation
      body.setActivationState( 4 );
    }
    physicsWorld.addRigidBody( body );
      return body;
  }
