window.onload = (function() {
  var gl, cube, currentlyPressedKeys = {};

  function webGLStart() {
    var canvas = document.getElementById("canvas");

    gl = initGL(canvas);
    cube = new Cube(gl, 0, 0, -5.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    tick();
  }

  function initGL(canvas) {
    var gl;
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
    }
    return gl;
  }

  function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
  }

  function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
  }

  function handleKeys() {
    if (currentlyPressedKeys[33]) {
      // Page Up
      cube.z -= 0.05;
    }
    if (currentlyPressedKeys[34]) {
      // Page Down
      cube.z += 0.05;
    }
    if (currentlyPressedKeys[37]) {
      // Left cursor key
      cube.ySpeed -= 1;
    }
    if (currentlyPressedKeys[39]) {
      // Right cursor key
      cube.ySpeed += 1;
    }
    if (currentlyPressedKeys[38]) {
      // Up cursor key
      cube.xSpeed -= 1;
    }
    if (currentlyPressedKeys[40]) {
      // Down cursor key
      cube.xSpeed += 1;
    }
  }

  function tick() {
    requestAnimFrame(tick);
    handleKeys();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    cube.draw();
    cube.animate();
  }

  webGLStart()

});
