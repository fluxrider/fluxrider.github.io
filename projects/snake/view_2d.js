"use strict";

class View2D {

  constructor(model, HALF_LENGTH, gl, SHADER_UNIFORM_MODEL) {
    this.gl = gl;
		this.model = model;
		this.HALF_LENGTH = HALF_LENGTH;
    this.VERTEX_SIZE = 3;
    this.INDEX_DELTA = this.VERTEX_SIZE * 2;

    this.SHADER_UNIFORM_MODEL = SHADER_UNIFORM_MODEL;
    this.transform = mat4.create();

    this.previous_head_id = -1; // onHeadPush
	  this.head_start = false; // onHeadPush
	  
	  // head/tail/ti are in float index, and skip the first entry. That one is reserved for end/front mesh connection.
	  this.mesh_head = this.INDEX_DELTA;
	  this.mesh_tail = this.INDEX_DELTA;

		this.mesh_full = this.gl.createBuffer();
		this.mesh_half = this.gl.createBuffer();
    this.mesh_data = new Float32Array(2 * this.HALF_LENGTH * this.INDEX_DELTA);

		this.half_circle_data = new Float32Array(this.VERTEX_SIZE * (3 + 12)); // need at least 3 vertex,  the other number is arbitrarily chosen
		this.mesh_circle_1 = this.gl.createBuffer();
		this.mesh_circle_2 = this.gl.createBuffer();

		// init_wall_mesh
		let N = 10;
		let thickness2 = 2 * this.model.thickness;
		let wall_data = [
      -.5 + thickness2, -.5 + thickness2, 0,
      -.5, -.5, 0,
      -.5 + thickness2, .5 - thickness2, 0,
      -.5, .5, 0,
      .5 - thickness2, .5 - thickness2, 0,
      .5, .5, 0,
      .5 - thickness2, -.5 + thickness2, 0,
      .5, -.5, 0,
      -.5 + thickness2, -.5 + thickness2, 0,
      -.5, -.5, 0,
    ];
    this.wall_mesh = this.gl.createBuffer();
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.wall_mesh);
    this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wall_data), gl.STATIC_DRAW);

		// init_target_mesh
		// triangle fan circle with rad = thickness centered on zero
		this.target_data_n = 1 + 2 + 12;
		let target_data = new Float32Array(this.target_data_n * this.VERTEX_SIZE);
		const delta_angle = (2 * Math.PI) / (this.target_data_n - 2);
		let angle = 0;
    let base = 0;
    target_data[base++] = 0;
    target_data[base++] = 0;
    target_data[base++] = 0;
		for (let i = 1; i < this.target_data_n; i++) {
			let p = G.rot_around(0, 0, this.model.thickness, 0, -angle);
      target_data[base++] = p.x;
      target_data[base++] = p.y;
      target_data[base++] = 0;
			angle += delta_angle;
		}
		this.target_mesh = this.gl.createBuffer();
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.target_mesh);
    this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(target_data), gl.STATIC_DRAW);

    Object.preventExtensions(this);
  }



	render() {
    if (!this.model.started) return;

    // common settings to all draws
    this.gl.vertexAttrib4f(SHADER_ATTRIB_COLOR, 1, 1, 1, 1);
    this.gl.vertexAttrib3f(SHADER_ATTRIB_NORMAL, 0, 1, 0);
    this.gl.disableVertexAttribArray(SHADER_ATTRIB_COLOR);
    this.gl.disableVertexAttribArray(SHADER_ATTRIB_NORMAL);
    this.gl.enableVertexAttribArray(SHADER_ATTRIB_POSITION);

    // wall mesh
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.wall_mesh);
    this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);

		if (this.model.pickup_exists) {
      // push transform
      this.gl.uniformMatrix4fv(this.SHADER_UNIFORM_MODEL, false, this.transform);
      // draw target
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.target_mesh);
      this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(gl.TRIANGLE_FAN, 0, this.target_data_n);
      // pop transform
      let identity = mat4.create();
      this.gl.uniformMatrix4fv(this.SHADER_UNIFORM_MODEL, false, identity);
		}
	}

	// Model Listener
	onHeadPush(id_gained) {
	}

	onTailPop(id_lost, was_in_tip) {
	}

	onTipPop(id_lost, was_in_tail) {
	}

	onTick(monotonic_ms, delta_seconds) {
	}

	onCollision() {
	}

	onNear(near) {
	}

	onPickup(x, y) {
	}

	onPickupAppears(x, y) {
    let v = vec3.fromValues(x, y, 0);
    mat4.fromTranslation(this.transform, v);
	}

	onReset() {
		this.mesh_head = this.INDEX_DELTA;
		this.mesh_tail = this.INDEX_DELTA;
		this.previous_head_id = -1; // onHeadPush
		this.head_start = false; // onHeadPush
	}

}
