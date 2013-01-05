class Cube
  constructor: (@gl, @x, @y, @z) ->
    @initShaders()
    @initBuffers()
    @loadTexture()

  xRot: 0
  yRot: 0
  xSpeed: 3
  ySpeed: -3
  mvMatrix: mat4.create()
  mvMatrixStack: []
  pMatrix: mat4.create()

  loadTexture: ->
    @texture = @gl.createTexture()
    @texture.image = new Image()
    @texture.image.onload = =>
      @handleLoadedTexture()

    @texture.image.src = "img/texture.jpg"

  handleLoadedTexture: ->
    @gl.pixelStorei(@gl.UNPACK_FLIP_Y_WEBGL, true)

    @gl.bindTexture @gl.TEXTURE_2D, @texture
    @gl.texImage2D @gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA, @gl.UNSIGNED_BYTE, @texture.image
    @gl.texParameteri @gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR
    @gl.texParameteri @gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR_MIPMAP_NEAREST
    @gl.generateMipmap @gl.TEXTURE_2D

    @gl.bindTexture @gl.TEXTURE_2D, null

  getShader: (id) ->
    shaderScript = document.getElementById(id)
    return null  unless shaderScript

    str = ""
    k = shaderScript.firstChild
    while k
      str += k.textContent  if k.nodeType is 3
      k = k.nextSibling

    shader = undefined
    if shaderScript.type is "x-shader/x-fragment"
      shader = @gl.createShader(@gl.FRAGMENT_SHADER)
    else if shaderScript.type is "x-shader/x-vertex"
      shader = @gl.createShader(@gl.VERTEX_SHADER)
    else
      return null

    @gl.shaderSource shader, str
    @gl.compileShader shader

    unless @gl.getShaderParameter(shader, @gl.COMPILE_STATUS)
      alert @gl.getShaderInfoLog(shader)
      return null
    shader

  initShaders: ->
    fragmentShader = @getShader("shader-fs")
    vertexShader = @getShader("shader-vs")

    @shaderProgram = @gl.createProgram()
    @gl.attachShader @shaderProgram, vertexShader
    @gl.attachShader @shaderProgram, fragmentShader
    @gl.linkProgram @shaderProgram

    alert "Could not initialise shaders"  unless @gl.getProgramParameter(@shaderProgram, @gl.LINK_STATUS)

    @gl.useProgram @shaderProgram

    @shaderProgram.vertexPositionAttribute = @gl.getAttribLocation(@shaderProgram, "aVertexPosition")
    @gl.enableVertexAttribArray @shaderProgram.vertexPositionAttribute

    @shaderProgram.vertexNormalAttribute = @gl.getAttribLocation(@shaderProgram, "aVertexNormal")
    @gl.enableVertexAttribArray @shaderProgram.vertexNormalAttribute

    @shaderProgram.textureCoordAttribute = @gl.getAttribLocation(@shaderProgram, "aTextureCoord")
    @gl.enableVertexAttribArray @shaderProgram.textureCoordAttribute

    @shaderProgram.pMatrixUniform = @gl.getUniformLocation(@shaderProgram, "uPMatrix")
    @shaderProgram.mvMatrixUniform = @gl.getUniformLocation(@shaderProgram, "uMVMatrix")
    @shaderProgram.nMatrixUniform = @gl.getUniformLocation(@shaderProgram, "uNMatrix")
    @shaderProgram.samplerUniform = @gl.getUniformLocation(@shaderProgram, "uSampler")
    @shaderProgram.useLightingUniform = @gl.getUniformLocation(@shaderProgram, "uUseLighting")
    @shaderProgram.ambientColorUniform = @gl.getUniformLocation(@shaderProgram, "uAmbientColor")
    @shaderProgram.lightingDirectionUniform = @gl.getUniformLocation(@shaderProgram, "uLightingDirection")
    @shaderProgram.directionalColorUniform = @gl.getUniformLocation(@shaderProgram, "uDirectionalColor")
    @shaderProgram.alphaUniform = @gl.getUniformLocation(@shaderProgram, "uAlpha")

  initBuffers: ->
    @vertexPositionBuffer = @gl.createBuffer()
    @gl.bindBuffer @gl.ARRAY_BUFFER, @vertexPositionBuffer

    @gl.bufferData @gl.ARRAY_BUFFER, new Float32Array(@vertices), @gl.STATIC_DRAW
    @vertexPositionBuffer.itemSize = 3
    @vertexPositionBuffer.numItems = 24

    @vertexNormalBuffer = @gl.createBuffer()
    @gl.bindBuffer @gl.ARRAY_BUFFER, @vertexNormalBuffer

    @gl.bufferData @gl.ARRAY_BUFFER, new Float32Array(@vertexNormals), @gl.STATIC_DRAW
    @vertexNormalBuffer.itemSize = 3
    @vertexNormalBuffer.numItems = 24

    @vertexTextureCoordBuffer = @gl.createBuffer()
    @gl.bindBuffer @gl.ARRAY_BUFFER, @vertexTextureCoordBuffer

    @gl.bufferData @gl.ARRAY_BUFFER, new Float32Array(@textureCoords), @gl.STATIC_DRAW
    @vertexTextureCoordBuffer.itemSize = 2
    @vertexTextureCoordBuffer.numItems = 24

    @vertexIndexBuffer = @gl.createBuffer()
    @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, @vertexIndexBuffer

    @gl.bufferData @gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(@vertexIndices), @gl.STATIC_DRAW
    @vertexIndexBuffer.itemSize = 1
    @vertexIndexBuffer.numItems = 36

  draw: ->
    mat4.perspective 45, @gl.viewportWidth / @gl.viewportHeight, 0.1, 100.0, @pMatrix

    mat4.identity @mvMatrix

    mat4.translate @mvMatrix, [0.0, 0.0, @z]

    mat4.rotate @mvMatrix, @degToRad(@xRot), [1, 0, 0]
    mat4.rotate @mvMatrix, @degToRad(@yRot), [0, 1, 0]

    @gl.bindBuffer @gl.ARRAY_BUFFER, @vertexPositionBuffer
    @gl.vertexAttribPointer @shaderProgram.vertexPositionAttribute, @vertexPositionBuffer.itemSize, @gl.FLOAT, false, 0, 0

    @gl.bindBuffer @gl.ARRAY_BUFFER, @vertexNormalBuffer
    @gl.vertexAttribPointer @shaderProgram.vertexNormalAttribute, @vertexNormalBuffer.itemSize, @gl.FLOAT, false, 0, 0

    @gl.bindBuffer @gl.ARRAY_BUFFER, @vertexTextureCoordBuffer
    @gl.vertexAttribPointer @shaderProgram.textureCoordAttribute, @vertexTextureCoordBuffer.itemSize, @gl.FLOAT, false, 0, 0

    @gl.activeTexture @gl.TEXTURE0
    @gl.bindTexture @gl.TEXTURE_2D, @texture
    @gl.uniform1i @shaderProgram.samplerUniform, 0

    blending = document.getElementById("blending").checked
    if blending
      @gl.blendFunc @gl.SRC_ALPHA, @gl.ONE
      @gl.enable @gl.BLEND
      @gl.disable @gl.DEPTH_TEST
      @gl.uniform1f @shaderProgram.alphaUniform, parseFloat(document.getElementById("alpha").value)
    else
      @gl.disable @gl.BLEND
      @gl.enable @gl.DEPTH_TEST

    lighting = document.getElementById("lighting").checked
    @gl.uniform1i @shaderProgram.useLightingUniform, lighting
    if lighting
      @gl.uniform3f(
        @shaderProgram.ambientColorUniform,
        parseFloat(document.getElementById("ambientR").value),
        parseFloat(document.getElementById("ambientG").value),
        parseFloat(document.getElementById("ambientB").value)
      )

      lightingDirection = [
        parseFloat(document.getElementById("lightDirectionX").value) * -1,
        parseFloat(document.getElementById("lightDirectionY").value) * -1,
        parseFloat(document.getElementById("lightDirectionZ").value)
      ]
      adjustedLD = vec3.create()
      vec3.normalize lightingDirection, adjustedLD
      vec3.scale adjustedLD, -1
      @gl.uniform3fv @shaderProgram.lightingDirectionUniform, adjustedLD

      @gl.uniform3f(
        @shaderProgram.directionalColorUniform,
        parseFloat(document.getElementById("directionalR").value),
        parseFloat(document.getElementById("directionalG").value),
        parseFloat(document.getElementById("directionalB").value)
      )

    @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, @vertexIndexBuffer
    @setMatrixUniforms()
    @gl.drawElements @gl.TRIANGLES, @vertexIndexBuffer.numItems, @gl.UNSIGNED_SHORT, 0

  animate: ->
    timeNow = new Date().getTime()
    unless @lastTime is `undefined`
      elapsed = timeNow - @lastTime

      @xRot += (@xSpeed * elapsed) / 1000.0
      @yRot += (@ySpeed * elapsed) / 1000.0

    @lastTime = timeNow

  setMatrixUniforms: ->
    @gl.uniformMatrix4fv @shaderProgram.pMatrixUniform, false, @pMatrix
    @gl.uniformMatrix4fv @shaderProgram.mvMatrixUniform, false, @mvMatrix

    normalMatrix = mat3.create()
    mat4.toInverseMat3 @mvMatrix, normalMatrix
    mat3.transpose normalMatrix
    @gl.uniformMatrix3fv @shaderProgram.nMatrixUniform, false, normalMatrix

  degToRad: (degrees) ->
    degrees * Math.PI / 180

  vertices: [
    # Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    # Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    # Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    # Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    # Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    # Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ]

  vertexNormals: [
    # Front face
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    # Back face
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    # Top face
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    # Bottom face
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    # Right face
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    # Left face
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ]

  textureCoords: [
    # Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    # Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    # Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    # Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    # Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    # Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ]

  vertexIndices: [
    0, 1, 2,      0, 2, 3,    # Front face
    4, 5, 6,      4, 6, 7,    # Back face
    8, 9, 10,     8, 10, 11,  # Top face
    12, 13, 14,   12, 14, 15, # Bottom face
    16, 17, 18,   16, 18, 19, # Right face
    20, 21, 22,   20, 22, 23  # Left face
  ]
