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

		// snake
/*
		if (mesh_tail != mesh_head) {
			if (mesh_tail < mesh_head) {
				mesh_full.setVertices(mesh_data, mesh_tail, mesh_head - mesh_tail);
			} else {
				if (mesh_tail < HALF_LENGTH) {
					mesh_full.setVertices(mesh_data, mesh_tail, mesh_data.length - mesh_tail);
					mesh_half.setVertices(mesh_data, 0, mesh_head);
				} else {
					mesh_half.setVertices(mesh_data, mesh_tail, mesh_data.length - mesh_tail);
					mesh_full.setVertices(mesh_data, 0, mesh_head);
				}
			}
		}

		shader.begin();
		shader.setUniformMatrix("u_worldView", worldView);
		if (mesh_tail != mesh_head) {
			mesh_full.render(shader, GL20.GL_TRIANGLE_STRIP);
			if (mesh_tail >= mesh_head) {
				mesh_half.render(shader, GL20.GL_TRIANGLE_STRIP);
			}
			mesh_circle_1.render(shader, GL20.GL_TRIANGLE_FAN);
			mesh_circle_2.render(shader, GL20.GL_TRIANGLE_FAN);
		}
*/
		if (this.mesh_tail != this.mesh_head) {
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_circle_1);
      this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(gl.TRIANGLE_FAN, 0, this.half_circle_data.length / this.VERTEX_SIZE);
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_circle_2);
      this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(gl.TRIANGLE_FAN, 0, this.half_circle_data.length / this.VERTEX_SIZE);
    }

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
		// append new position to mesh
		if (this.previous_head_id == -1) {
			this.head_start = true;
			this.previous_head_id = id_gained;
		} else {
			// compute the thickness vector from the point to make the two triangle strip points
			let p1 = this.model.getPoint(id_gained);
			let p2 = this.model.getPoint(this.previous_head_id);
			let dy = p2.x - p1.x;
			let dx = p2.y - p1.y;
			let factor = this.model.thickness / Math.sqrt(dx * dx + dy * dy);
			dy *= factor;
			dx *= factor;
			this.previous_head_id = id_gained;

			// one shot
			if (this.head_start) {
				// add an extra first point that we skipped when we didn't have enough points to make a line
				this.head_start = false;
        this.mesh_data[this.mesh_head++] = p2.x - dx;
        this.mesh_data[this.mesh_head++] = p2.y + dy;
        this.mesh_data[this.mesh_head++] = 0;
        this.mesh_data[this.mesh_head++] = p2.x + dx;
        this.mesh_data[this.mesh_head++] = p2.y - dy;
        this.mesh_data[this.mesh_head++] = 0;

				// create the tail semi circle
				this.updateTailSemi(true);
			}

			// adjust the old head points to average to both lines
			// this is visible when the turn is very big (like 90 degree turn)
			let old_head = this.mesh_head - this.INDEX_DELTA;
			this.mesh_data[old_head] += p2.x - dx;
			this.mesh_data[old_head] /= 2;
			this.mesh_data[old_head + 1] += p2.y + dy;
			this.mesh_data[old_head + 1] /= 2;
			this.mesh_data[old_head + this.VERTEX_SIZE] += p2.x + dx;
			this.mesh_data[old_head + this.VERTEX_SIZE] /= 2;
			this.mesh_data[old_head + this.VERTEX_SIZE + 1] += p2.y - dy;
			this.mesh_data[old_head + this.VERTEX_SIZE + 1] /= 2;
			// artefact: adjust end/front so mesh connect
			if (old_head == 0) {
				this.mesh_data[this.mesh_data.length - this.INDEX_DELTA] = this.mesh_data[old_head];
				this.mesh_data[this.mesh_data.length - this.INDEX_DELTA + 1] = this.mesh_data[old_head + 1];
				this.mesh_data[this.mesh_data.length - this.INDEX_DELTA + this.VERTEX_SIZE] = this.mesh_data[old_head + this.VERTEX_SIZE];
				this.mesh_data[this.mesh_data.length - this.INDEX_DELTA + this.VERTEX_SIZE + 1] = this.mesh_data[old_head + this.VERTEX_SIZE + 1];
			}

			// artefact: copy end/front so mesh connect
			if (this.mesh_head == this.mesh_data.length) {
				for (this.mesh_head = 0; this.mesh_head < this.INDEX_DELTA; this.mesh_head++) {
					this.mesh_data[this.mesh_head] = this.mesh_data[this.mesh_data.length - this.INDEX_DELTA + this.mesh_head];
				}
			}
			// add the point
      this.mesh_data[this.mesh_head++] = p1.x - dx;
      this.mesh_data[this.mesh_head++] = p1.y + dy;
      this.mesh_data[this.mesh_head++] = 0;
      this.mesh_data[this.mesh_head++] = p1.x + dx;
      this.mesh_data[this.mesh_head++] = p1.y - dy;
      this.mesh_data[this.mesh_head++] = 0;

			// update head semi circle
			let base = 0;
      this.half_circle_data[base++] = p1.x;
      this.half_circle_data[base++] = p1.y;
      this.half_circle_data[base++] = 0;
      this.half_circle_data[base++] =  p1.x + dx;
      this.half_circle_data[base++] = p1.y - dy;
      this.half_circle_data[base++] = 0;
      let delta_angle = Math.PI / (this.half_circle_data.length / this.VERTEX_SIZE - 2);
			let angle = delta_angle;
			while (base < this.half_circle_data.length - this.VERTEX_SIZE) {
				p2 = G.rot_around(p1.x, p1.y, p1.x + dx, p1.y - dy, -angle);
        this.half_circle_data[base++] = p2.x;
        this.half_circle_data[base++] = p2.y;
        this.half_circle_data[base++] = 0;
				angle += delta_angle;
			}
      this.half_circle_data[base++] = p1.x - dx;
      this.half_circle_data[base++] = p1.y + dy;
      this.half_circle_data[base++] = 0;
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_circle_1);
      this.gl.bufferData(gl.ARRAY_BUFFER, this.half_circle_data, gl.STATIC_DRAW);
		}
	}

	onTailPop(id_lost, was_in_tip) {
		// advance tail
		this.mesh_tail += this.INDEX_DELTA;
		if (this.mesh_tail == this.mesh_data.length) this.mesh_tail = this.INDEX_DELTA;
		this.updateTailSemi(was_in_tip);
	}

	updateTailSemi(in_tip) {
		// update tail semi circle
		let p1 = this.model.getPoint(this.model.tail);
		let base = 0;
    this.half_circle_data[base++] = p1.x;
    this.half_circle_data[base++] = p1.y;
    this.half_circle_data[base++] = 0;
    this.half_circle_data[base++] = this.mesh_data[this.mesh_tail];
    this.half_circle_data[base++] = this.mesh_data[this.mesh_tail + 1];
    this.half_circle_data[base++] = 0;
		let delta_angle = Math.PI / (this.half_circle_data.length / this.VERTEX_SIZE - 2);
		let angle = delta_angle;

		while (base < this.half_circle_data.length - this.VERTEX_SIZE) {
			let p2 = G.rot_around(p1.x, p1.y, this.mesh_data[this.mesh_tail], this.mesh_data[this.mesh_tail + 1], -angle);
      this.half_circle_data[base++] = p2.x;
      this.half_circle_data[base++] = p2.y;
      this.half_circle_data[base++] = 0;
			angle += delta_angle;
		}
    this.half_circle_data[base++] = this.mesh_data[this.mesh_tail + this.VERTEX_SIZE];
    this.half_circle_data[base++] = this.mesh_data[this.mesh_tail + this.VERTEX_SIZE + 1];
    this.half_circle_data[base++] = 0;
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_circle_2);
    this.gl.bufferData(gl.ARRAY_BUFFER, this.half_circle_data, gl.STATIC_DRAW);
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
