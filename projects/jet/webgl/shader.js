/*
 * Written by David Lareau on March 5, 2011.
 * 
 * Encapsulate shader variables. 
 * Also has matrix stacks for the model and projection view.
 * Also does some binding operation when it comes to texture and vertex buffer.
 * 
 * Even though this class is used everytwhere, it is not generic to any shaders, it is very specific to "my" shaders.
 * Change in the shader functionality will cause change here, and may cause change all over the app code and library code.
 */
 
// == MatrixStack ==
function MatrixStack(shaderIndex, capacity) {

	// Construct
	if(arguments.length == 2) {
		this.index = 0;
		this.shaderIndex = shaderIndex;
		this.stack = new Array(capacity);
		for (var i = 0; i < capacity; i++) {
			this.stack[i] = new Matrix4x4();
		}
		this.stack[0].identity();
	}	else throw({name: "ArgumentException", message: "Unsupported parameter arity: " + arguments.length });

	// Stack Methods
	this.push = function() {
		this.index++;
		this.stack[this.index].set(this.stack[this.index - 1]);
	}

	this.pop = function() {
		this.index--;
		if (this.index < 0) throw({name: "ArrayIndexOutOfBoundsException", message: index }); // fail-fast
	}

	// Shader Method
	this.commit = function(gl) {
		S._matrix(gl, this.shaderIndex, this.stack[this.index].m);
	}

	// Transformation
	this.empty = function() {
		this.stack[this.index].empty();
	}

	this.identity = function() {
		this.stack[this.index].identity();
	}

	this.translate = function(x, y, z) {
		this.stack[this.index].translate(x, y, z);
	}

	this.scale = function(x, y, z) {
		this.stack[this.index].scale(x, y, z);
	}

	this.rotate = function(angle, axis) {
		this.stack[this.index].rotate(angle, axis);
	}

	// Fancy Methods
	this.orthographicProjection = function(left, right, bottom, top, near, far) {
		this.stack[this.index].orthographicProjection(left, right, bottom, top, near, far);
	}

	this.lookAt = function(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) {
		this.stack[this.index].lookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ);
	}

	this.perspective = function(fovyInDegrees, aspectRatio, zNear, zFar) {
		this.stack[this.index].perspective(fovyInDegrees, aspectRatio, zNear, zFar);
	}

	this.frustum = function(left, right, bottom, top, near, far) {
		this.stack[this.index].frustum(left, right, bottom, top, near, far);
	}

}

// == S == (this class is static)
var S = {}

// Shader Attribute
S.shaderState = null;
S.shaderProgram = null;

// Variable Index
S.index_projection = null;
S.index_model = null;

S.index_position = null;
S.index_color = null;

S.index_activeTexture = null;
S.index_textureCoordinates = null;

S.index_eye = null;
S.index_fogColor = null;
S.index_fogStart = null;
S.index_fogDepth = null;

// Matrix Stack
S.projectionView = null;
S.modelView = null;

// Load Methods
S.loadShader = function(gl, vertexCode, fragmentCode) {
	// Create & Compile the two shader objects
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexCode);
	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) throw new E("VertexShaderException", gl.getShaderInfoLog(vertexShader));
	
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentCode);
	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) throw new E("FragmentShaderException", gl.getShaderInfoLog(fragmentShader));

	// Create & Link the shader program
	this.shaderProgram = gl.createProgram();
	gl.attachShader(this.shaderProgram, vertexShader);
	gl.attachShader(this.shaderProgram, fragmentShader);
	gl.linkProgram(this.shaderProgram);
	if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) throw new E("ShaderException", "Could not attach and link shaders");
	gl.useProgram(this.shaderProgram);
				
	this.initIndices(gl);
	this.initStacks();
}

S.initIndices = function(gl) {
	this.index_projection = gl.getUniformLocation(this.shaderProgram, "projection");
	this.index_model = gl.getUniformLocation(this.shaderProgram, "model");

	this.index_position = gl.getAttribLocation(this.shaderProgram, "position");
	this.index_color = gl.getUniformLocation(this.shaderProgram, "color");

	this.index_activeTexture = gl.getUniformLocation(this.shaderProgram, "activeTexture");
	this.index_textureCoordinates = gl.getAttribLocation(this.shaderProgram, "textureCoordinates");

	this.index_eye = gl.getUniformLocation(this.shaderProgram, "eye");
	this.index_fogColor = gl.getUniformLocation(this.shaderProgram, "fogColor");
	this.index_fogStart = gl.getUniformLocation(this.shaderProgram, "fogStart");
	this.index_fogDepth = gl.getUniformLocation(this.shaderProgram, "fogDepth");
}

S.initStacks = function() {
	this.projectionView = new MatrixStack(this.index_projection, 5);
	this.modelView = new MatrixStack(this.index_model, 10);
}

// Sync Methods
S.position = function(gl, buffer, type, normalized, stride, pointer) {
	if(arguments.length == 2) this.position(gl, buffer, gl.FLOAT, false, 0, 0);
	else this.arrayBuffer(gl, buffer, this.index_position, buffer.itemSize, type, normalized, stride, pointer);
}

S.color = function(gl, r, g, b, a) {
	gl.uniform4f(this.index_color, r, g, b, a);
}

S.texturedModel = function(gl, vertexBufferId, textureCoordBufferId, textureId) {
	this.texture(gl, textureId, 0, textureCoordBufferId);
	this.position(gl, vertexBufferId);
}

S.textureClear = function(gl) {
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.disableVertexAttribArray(S.index_textureCoordinates);
}

S.texture = function(gl, textureId, activeTexture, textureCoordBufferId) {
	this.activeTexture(gl, activeTexture);
	gl.bindTexture(gl.TEXTURE_2D, textureId);
	this.textureCoord(gl, textureCoordBufferId);
}

S.activeTexture = function(gl, activeTexture) {
	gl.activeTexture(gl.TEXTURE0 + activeTexture); // Warning: this works, but only because the constants are sequential
	gl.uniform1i(this.index_activeTexture, activeTexture); // this number is 0 because of GL_TEXTURE0  
}

S.textureCoord = function(gl, bufferId, type, normalized, stride, pointer) {
	if(arguments.length == 2) this.textureCoord(gl, bufferId, gl.FLOAT, false, 0, 0);
	else this.arrayBuffer(gl, bufferId, this.index_textureCoordinates, 2, type, normalized, stride, pointer);
}

S.eye = function(gl, x, y, z) {
	gl.uniform3f(this.index_eye, x, y, z);
}

S.fog = function(gl, r, g, b, a, start, depth) {
	this.fogColor(gl, r, g, b, a);
	this.fogStart(gl, start);
	this.fogDepth(gl, depth);
}

S.fogColor = function(gl, r, g, b, a) {
	gl.uniform4f(this.index_fogColor, r, g, b, a);
}

S.fogStart = function(gl, start) {
	gl.uniform1f(this.index_fogStart, start);
}

S.fogDepth = function(gl, depth) {
	gl.uniform1f(this.index_fogDepth, depth);
}

// Low Level Methods
S._projection = function(gl, m) {
	this._matrix(gl, this.index_projection, m);
}

S._model = function(gl, m) {
	this._matrix(gl, this.index_model, m);
}

S._matrix = function(gl, index, m) {
	gl.uniformMatrix4fv(index, false, m);
}

// Private Methods
S.arrayBuffer = function(gl, buffer, shaderIndex, channels, type, normalized, stride, pointer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(shaderIndex, channels, type, normalized, stride, pointer);
	gl.enableVertexAttribArray(shaderIndex);
}
