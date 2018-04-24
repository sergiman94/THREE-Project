//----------------------------------------------------
// Author: Sergiman94 - Sergio Andres Manrique
// Universidad San Buenaventura
// Curso de Computacion Grafica
// Profesor Andres Felipe Barco Santa - Anfelbar
//----------------------------------------------------

// X red, Y green, Z blue

function Axis() {

  this.show = function (size) {

    var axis = new THREE.AxisHelper(size);
    scene.add(axis);

    return axis;

  }

}
