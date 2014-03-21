/*
 * Written by David Lareau on March 5, 2011.
 * 
 * Math library for matrix, vector, and axis enum.
 * (depends: on a integer division function called div)
 */
 
// == Axim Enum ==
var Axis = {"X" : 0, "Y" : 1, "Z" : 2};


// == Vector3 ==
function Vector3(param1, param2, param3) {
	// Methods
	this.toString = function() {
		return "[" + this.x + "," + this.y + "," + this.z + "]";
	}

	this.set = function(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	// Methods (In-Place)
	this.normalize = function() {
		this.scale(1 / this.length());
	}

	this.scale = function(s) {
		this.x *= s;
		this.y *= s;
		this.z *= s;
	}

	this.add = function(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
	}

	this.sub = function(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
	}

	this.cross = function(v) {
		this.set(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
	}
	
	// Attributes
	this.x = 0;
	this.y = 0;
	this.z = 0;

	// Construct
	switch(arguments.length) {
		case 0:
			// Default Constructor
			break;
		case 1:
			// Copy Constructor
			if(param1 instanceof Vector3) {
				this.set(param1.x, param1.y, param1.z);
			} 
			// Error (unsupported type)
			else throw new E("ArgumentException", "Unsupported parameter type: " + param1);
			break;
		case 3:
			// x,y,z
			this.set(param1, param2, param3);
			break;
		default:
			// Error (unssuppored arity)
			throw new E("ArgumentException", "Unsupported parameter arity: " + arguments.length);
			break;
	}
	
}

// Static Methods
Vector3_dot = function(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

Vector3_angle = function(a, b) {
	return Math.acos(dot(a, b) / (a.length() * b.length()));
}

Vector3_cross = function(a, b) {
	return new Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}


// == Matrix4x4 == (the matrix 1D indices are column major)
function Matrix4x4(param) {
	// Methods
	this.toString = function() {
		var s = "Matrix4x4\n";
		for (var r = 0; r < 4; r++) {
			s = s.concat('[');
			for (var c = 0; c < 4; c++) {
				s = s.concat(this.m[c * 4 + r]);
				if (c < 3) s = s.concat(',');
			}
			s = s.concat(']');
			s = s.concat('\n');
		}
		return s;
	}

	this.empty = function() {
		for (var i = 0; i < 16; i++) {
			this.m[i] = 0;
		}
	}

	this.identity = function() {
		this.empty();
		this.m[0] = this.m[5] = this.m[10] = this.m[15] = 1;
	}

	this.set = function(a) {
		for (var i = 0; i < 16; i++) {
			this.m[i] = a.m[i];
		}
	}

	this.mul = function(a) {
		var i;
		var k;

		var temp = new Array(16);

		for (i = 0; i < 16; i++) {
			temp[i] = 0.0;

			for (k = 0; k < 4; k++) {
				//			  		row   column   		   row column
				temp[i] += this.m[(i % 4) + (k * 4)] * a.m[(k) + (div(i,4) * 4)];
			}
		}

		for (i = 0; i < 16; i++) {
			this.m[i] = temp[i];
		}
	}

	this.translate = function(x, y, z) {
		var buffer = new Matrix4x4();
		buffer.identity();
		buffer.m[12] = x;
		buffer.m[13] = y;
		buffer.m[14] = z;
		this.mul(buffer);
	}

	this.scale = function(x, y, z) {
		var buffer = new Matrix4x4();
		buffer.identity();
		buffer.m[0] = x;
		buffer.m[5] = y;
		buffer.m[10] = z;
		this.mul(buffer);
	}

	this.rotate = function(angle, axis) {
		angle = -angle;
		var d2r = 0.0174532925199; /* PI / 180 */
		var cos1 = [ 5, 0, 0 ];
		var cos2 = [ 10, 10, 5 ];
		var sin1 = [ 6, 2, 1 ];
		var sin2 = [ 9, 8, 4 ];
		var buffer = new Matrix4x4();
		buffer.identity();
		buffer.m[cos1[axis]] = Math.cos(d2r * angle);
		buffer.m[sin1[axis]] = -Math.sin(d2r * angle);
		buffer.m[sin2[axis]] = -buffer.m[sin1[axis]];
		buffer.m[cos2[axis]] = buffer.m[cos1[axis]];
		this.mul(buffer);
	}

	// Fancy Methods
	this.orthographicProjection = function(left, right, bottom, top, near, far) {
		var buffer = new Matrix4x4();
		buffer.identity();
		buffer.m[0] = 2 / (right - left);
		buffer.m[5] = 2 / (top - bottom);
		buffer.m[10] = -2 / (far - near);
		buffer.m[12] = -(right + left) / (right - left);
		buffer.m[13] = -(top + bottom) / (top - bottom);
		buffer.m[14] = -(far + near) / (far - near);
		this.mul(buffer);
	}

	this.lookAt = function(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ) {
		var forward = new Vector3(atX - eyeX, atY - eyeY, atZ - eyeZ);
		forward.normalize();

		var up = new Vector3(upX, upY, upZ);

		var side = Vector3_cross(forward, up);
		side.normalize();

		up = Vector3_cross(side, forward);
		var buffer = new Matrix4x4();
		buffer.empty();
		buffer.m[0] = side.x;
		buffer.m[1] = up.x;
		buffer.m[2] = -forward.x;
		buffer.m[3] = 0.0;
		buffer.m[4] = side.y;
		buffer.m[5] = up.y;
		buffer.m[6] = -forward.y;
		buffer.m[7] = 0.0;
		buffer.m[8] = side.z;
		buffer.m[9] = up.z;
		buffer.m[10] = -forward.z;
		buffer.m[11] = 0.0;
		buffer.m[12] = 0.0;
		buffer.m[13] = 0.0;
		buffer.m[14] = 0.0;
		buffer.m[15] = 1.0;

		this.mul(buffer);
		this.translate(-eyeX, -eyeY, -eyeZ);
	}

	this.perspective = function(fovyInDegrees, aspectRatio, zNear, zFar) {
		var xmin, xmax, ymin, ymax;

		ymax = (zNear * Math.tan(fovyInDegrees * Math.PI / 360.0));
		ymin = -ymax;
		xmin = ymin * aspectRatio;
		xmax = ymax * aspectRatio;

		this.frustum(xmin, xmax, ymin, ymax, zNear, zFar);
	}

	this.frustum = function(left, right, bottom, top, near, far) {
		this.m[0] = 2.0 * near / (right - left);
		this.m[1] = 0.0;
		this.m[2] = 0.0;
		this.m[3] = 0.0;
		this.m[4] = 0.0;
		this.m[5] = 2.0 * near / (top - bottom);
		this.m[6] = 0.0;
		this.m[7] = 0.0;
		this.m[8] = (right + left) / (right - left);
		this.m[9] = (top + bottom) / (top - bottom);
		this.m[10] = -(far + near) / (far - near);
		this.m[11] = -1.0;
		this.m[12] = 0.0;
		this.m[13] = 0.0;
		this.m[14] = -(2.0 * far * near) / (far - near);
		this.m[15] = 0.0;
	}
	
	// Attributes
	this.m = new Array(16); // column-major
	
	// Construct
	switch(arguments.length) {
		case 0:
			// Default Constructor
			this.empty();
				break;
		case 1:
			// Copy Constructor
			if(param instanceof Matrix4x4) {
				this.set(param);
			} 
			// Construct with an Array
			else if (param instanceof Array && param.length == 16) {
				for (var i = 0; i < 16; i++) {
					this.m[i] = param[i];
				}
			} 
			// Error (unsupported type)
			else throw new E("ArgumentException", "Unsupported parameter type: " + param);
			break;
		default:
			// Error (unssuppored arity)
			throw new E("ArgumentException", "Unsupported parameter arity: " + arguments.length);
			break;
	}
}