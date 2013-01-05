var Cube;

Cube = (function() {

  function Cube(gl, x, y, z) {
    this.gl = gl;
    this.x = x;
    this.y = y;
    this.z = z;
    this.initShaders();
    this.initBuffers();
    this.loadTexture();
  }

  Cube.prototype.xRot = 0;

  Cube.prototype.yRot = 0;

  Cube.prototype.xSpeed = 3;

  Cube.prototype.ySpeed = -3;

  Cube.prototype.mvMatrix = mat4.create();

  Cube.prototype.mvMatrixStack = [];

  Cube.prototype.pMatrix = mat4.create();

  Cube.prototype.loadTexture = function() {
    var _this = this;
    this.texture = this.gl.createTexture();
    this.texture.image = new Image();
    this.texture.image.onload = function() {
      return _this.handleLoadedTexture();
    };
    return this.texture.image.src = "img/texture.jpg";
  };

  Cube.prototype.handleLoadedTexture = function() {
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.texture.image);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    return this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  };

  Cube.prototype.getShader = function(id) {
    var k, shader, shaderScript, str;
    shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }
    str = "";
    k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType === 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }
    shader = void 0;
    if (shaderScript.type === "x-shader/x-fragment") {
      shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
      shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    } else {
      return null;
    }
    this.gl.shaderSource(shader, str);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      alert(this.gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  Cube.prototype.initShaders = function() {
    var fragmentShader, vertexShader;
    fragmentShader = this.getShader("shader-fs");
    vertexShader = this.getShader("shader-vs");
    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);
    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }
    this.gl.useProgram(this.shaderProgram);
    this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
    this.shaderProgram.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
    this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
    this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
    this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
    this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
    this.shaderProgram.nMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uNMatrix");
    this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
    this.shaderProgram.useLightingUniform = this.gl.getUniformLocation(this.shaderProgram, "uUseLighting");
    this.shaderProgram.ambientColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uAmbientColor");
    this.shaderProgram.lightingDirectionUniform = this.gl.getUniformLocation(this.shaderProgram, "uLightingDirection");
    this.shaderProgram.directionalColorUniform = this.gl.getUniformLocation(this.shaderProgram, "uDirectionalColor");
    return this.shaderProgram.alphaUniform = this.gl.getUniformLocation(this.shaderProgram, "uAlpha");
  };

  Cube.prototype.initBuffers = function() {
    this.vertexPositionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = 24;
    this.vertexNormalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertexNormals), this.gl.STATIC_DRAW);
    this.vertexNormalBuffer.itemSize = 3;
    this.vertexNormalBuffer.numItems = 24;
    this.vertexTextureCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), this.gl.STATIC_DRAW);
    this.vertexTextureCoordBuffer.itemSize = 2;
    this.vertexTextureCoordBuffer.numItems = 24;
    this.vertexIndexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexIndices), this.gl.STATIC_DRAW);
    this.vertexIndexBuffer.itemSize = 1;
    return this.vertexIndexBuffer.numItems = 36;
  };

  Cube.prototype.draw = function() {
    var adjustedLD, blending, lighting, lightingDirection;
    mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);
    mat4.identity(this.mvMatrix);
    mat4.translate(this.mvMatrix, [0.0, 0.0, this.z]);
    mat4.rotate(this.mvMatrix, this.degToRad(this.xRot), [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.degToRad(this.yRot), [0, 1, 0]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
    blending = document.getElementById("blending").checked;
    if (blending) {
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
      this.gl.enable(this.gl.BLEND);
      this.gl.disable(this.gl.DEPTH_TEST);
      this.gl.uniform1f(this.shaderProgram.alphaUniform, parseFloat(document.getElementById("alpha").value));
    } else {
      this.gl.disable(this.gl.BLEND);
      this.gl.enable(this.gl.DEPTH_TEST);
    }
    lighting = document.getElementById("lighting").checked;
    this.gl.uniform1i(this.shaderProgram.useLightingUniform, lighting);
    if (lighting) {
      this.gl.uniform3f(this.shaderProgram.ambientColorUniform, parseFloat(document.getElementById("ambientR").value), parseFloat(document.getElementById("ambientG").value), parseFloat(document.getElementById("ambientB").value));
      lightingDirection = [parseFloat(document.getElementById("lightDirectionX").value) * -1, parseFloat(document.getElementById("lightDirectionY").value) * -1, parseFloat(document.getElementById("lightDirectionZ").value)];
      adjustedLD = vec3.create();
      vec3.normalize(lightingDirection, adjustedLD);
      vec3.scale(adjustedLD, -1);
      this.gl.uniform3fv(this.shaderProgram.lightingDirectionUniform, adjustedLD);
      this.gl.uniform3f(this.shaderProgram.directionalColorUniform, parseFloat(document.getElementById("directionalR").value), parseFloat(document.getElementById("directionalG").value), parseFloat(document.getElementById("directionalB").value));
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    this.setMatrixUniforms();
    return this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
  };

  Cube.prototype.animate = function() {
    var elapsed, timeNow;
    timeNow = new Date().getTime();
    if (this.lastTime !== undefined) {
      elapsed = timeNow - this.lastTime;
      this.xRot += (this.xSpeed * elapsed) / 1000.0;
      this.yRot += (this.ySpeed * elapsed) / 1000.0;
    }
    return this.lastTime = timeNow;
  };

  Cube.prototype.setMatrixUniforms = function() {
    var normalMatrix;
    this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    normalMatrix = mat3.create();
    mat4.toInverseMat3(this.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    return this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
  };

  Cube.prototype.degToRad = function(degrees) {
    return degrees * Math.PI / 180;
  };

  Cube.prototype.vertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];

  Cube.prototype.vertexNormals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];

  Cube.prototype.textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

  Cube.prototype.vertexIndices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];

  return Cube;

})();
