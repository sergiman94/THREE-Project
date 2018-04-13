


// - Global variables -


    // Graphics variables
    var container, stats, speedometer;
    var camera, controls, scene, renderer;
    var terrainMesh, texture;
    var clock = new THREE.Clock();
    var materialDynamic, materialStatic, materialInteractive;





function Vehicle() {

  this.show = function() {

    // Vehicle contants

				var chassisWidth = 1.8;
				var chassisHeight = .6;
				var chassisLength = 4;
				var massVehicle = 800;

				var wheelAxisPositionBack = -1;
				var wheelRadiusBack = .4;
				var wheelWidthBack = .3;
				var wheelHalfTrackBack = 1;
				var wheelAxisHeightBack = .3;

				var wheelAxisFrontPosition = 1.7;
				var wheelHalfTrackFront = 1;
				var wheelAxisHeightFront = .3;
				var wheelRadiusFront = .35;
				var wheelWidthFront = .2;

				var friction = 1000;
				var suspensionStiffness = 20.0;
				var suspensionDamping = 2.3;
				var suspensionCompression = 4.4;
				var suspensionRestLength = 0.6;
				var rollInfluence = 0.2;

				var steeringIncrement = .04;
				var steeringClamp = .5;
				var maxEngineForce = 2000;
				var maxBreakingForce = 100;

				// Chassis
				var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
				var transform = new Ammo.btTransform();
				transform.setIdentity();
				transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
				transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
				var motionState = new Ammo.btDefaultMotionState(transform);
				var localInertia = new Ammo.btVector3(0, 0, 0);
				geometry.calculateLocalInertia(massVehicle, localInertia);
				var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
				// body.setActivationState(DISABLE_DEACTIVATION);
				physicsWorld.addRigidBody(body);
				var chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

				// Raycast Vehicle
				var engineForce = 0;
				var vehicleSteering = 0;
				var breakingForce = 0;
				var tuning = new Ammo.btVehicleTuning();
				var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
				var vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
				vehicle.setCoordinateSystem(0, 1, 2);
				physicsWorld.addAction(vehicle);

				// Wheels
				var FRONT_LEFT = 0;
				var FRONT_RIGHT = 1;
				var BACK_LEFT = 2;
				var BACK_RIGHT = 3;
				var wheelMeshes = [];
				var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
				var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

				function addWheel(isFront, pos, radius, width, index) {

					var wheelInfo = vehicle.addWheel(
							pos,
							wheelDirectionCS0,
							wheelAxleCS,
							suspensionRestLength,
							radius,
							tuning,
							isFront);

					wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
					wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
					wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
					wheelInfo.set_m_frictionSlip(friction);
					wheelInfo.set_m_rollInfluence(rollInfluence);

					wheelMeshes[index] = createWheelMesh(radius, width);
				}

				addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
				addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
				addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
				addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

				// Sync keybord actions and physics and graphics
				function sync(dt) {

					var speed = vehicle.getCurrentSpeedKmHour();

					speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';

					breakingForce = 0;
					engineForce = 0;

					if (actions.acceleration) {
						if (speed < -1)
							breakingForce = maxBreakingForce;
						else engineForce = maxEngineForce;
					}
					if (actions.braking) {
						if (speed > 1)
							breakingForce = maxBreakingForce;
						else engineForce = -maxEngineForce / 2;
					}
					if (actions.left) {
						if (vehicleSteering < steeringClamp)
							vehicleSteering += steeringIncrement;
					}
					else {
						if (actions.right) {
							if (vehicleSteering > -steeringClamp)
								vehicleSteering -= steeringIncrement;
						}
						else {
							if (vehicleSteering < -steeringIncrement)
								vehicleSteering += steeringIncrement;
							else {
								if (vehicleSteering > steeringIncrement)
									vehicleSteering -= steeringIncrement;
								else {
									vehicleSteering = 0;
								}
							}
						}
					}

					vehicle.applyEngineForce(engineForce, BACK_LEFT);
					vehicle.applyEngineForce(engineForce, BACK_RIGHT);

					vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
					vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
					vehicle.setBrake(breakingForce, BACK_LEFT);
					vehicle.setBrake(breakingForce, BACK_RIGHT);

					vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
					vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

					var tm, p, q, i;
					var n = vehicle.getNumWheels();
					for (i = 0; i < n; i++) {
						vehicle.updateWheelTransform(i, true);
						tm = vehicle.getWheelTransformWS(i);
						p = tm.getOrigin();
						q = tm.getRotation();
						wheelMeshes[i].position.set(p.x(), p.y(), p.z());
						wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
					}

					tm = vehicle.getChassisWorldTransform();
					p = tm.getOrigin();
					q = tm.getRotation();
					chassisMesh.position.set(p.x(), p.y(), p.z());
					chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
				}

				syncList.push(sync);
  }

}
