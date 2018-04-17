"use strict";

class View2D {

  constructor(model, HALF_LENGTH, gl) {
    this.gl = gl;
		this.model = model;
		this.HALF_LENGTH = HALF_LENGTH;
	  
    this.VERTEX_SIZE = 3;
	  this.mesh_head = this.VERTEX_SIZE; // in float index, skip first entry, that one is reserved for end/front mesh connection
	  this.mesh_tail = this.VERTEX_SIZE;
	  
	  this.transform = mat4.create();
    this.worldView = mat4.create();

		this.mesh_full = this.gl.createBuffer();
		this.mesh_half = this.gl.createBuffer();
		this.mesh_data = new Float32Array(2 * HALF_LENGTH * this.VERTEX_SIZE);

		this.mesh_target = this.gl.createBuffer();

		this.wall_mesh = this.gl.createBuffer();
    let thickness = this.model.thickness;
    let wall_data = [
      -.5 + thickness, -.5 + thickness, 0,
      -.5 + thickness,  .5 - thickness, 0,
       .5 - thickness,  .5 - thickness, 0,
       .5 - thickness, -.5 + thickness, 0,
      -.5 + thickness, -.5 + thickness, 0,
    ];
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.wall_mesh);
    this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wall_data), gl.STATIC_DRAW);

    Object.preventExtensions(this);
  }

	render() {
		if (!this.model.started) return;
    let SIZE_OF_FLOAT = 4;
    this.gl.vertexAttrib4f(SHADER_ATTRIB_COLOR, 1, 1, 1, 1);
    this.gl.vertexAttrib3f(SHADER_ATTRIB_NORMAL, 0, 1, 0);
    this.gl.disableVertexAttribArray(SHADER_ATTRIB_COLOR);
    this.gl.disableVertexAttribArray(SHADER_ATTRIB_NORMAL);

		// set mesh data
    this.gl.enableVertexAttribArray(SHADER_ATTRIB_POSITION);
		if (this.mesh_tail < this.mesh_head) {
      // just one continuous array (this is how it starts)
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_full);
      this.gl.bufferData(gl.ARRAY_BUFFER, this.mesh_data, gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, this.mesh_tail * SIZE_OF_FLOAT);
      this.gl.drawArrays(gl.LINE_STRIP, 0, (this.mesh_head - this.mesh_tail) / this.VERTEX_SIZE);
		} else {
      // circular array is broken in two section (this is the common case)
			if (this.mesh_tail < this.HALF_LENGTH) {
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_full);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.mesh_data, gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, this.mesh_tail * SIZE_OF_FLOAT);
        this.gl.drawArrays(gl.LINE_STRIP, 0, (this.mesh_data.length - this.mesh_tail) / this.VERTEX_SIZE);
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_half);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.mesh_data, gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(gl.LINE_STRIP, 0, this.mesh_head / this.VERTEX_SIZE);
			} else {
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_half);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.mesh_data, gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, this.mesh_tail * SIZE_OF_FLOAT);
        this.gl.drawArrays(gl.LINE_STRIP, 0, (this.mesh_data.length - this.mesh_tail) / this.VERTEX_SIZE);
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_full);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.mesh_data, gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(gl.LINE_STRIP, 0, this.mesh_head / this.VERTEX_SIZE);
			}
		}

    // wall mesh    
    this.gl.bindBuffer(gl.ARRAY_BUFFER, this.wall_mesh);
    this.gl.vertexAttribPointer(SHADER_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(gl.LINE_STRIP, 0, 5);

    // target
    if(this.model.pickup_exists) {
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh_target);
      this.gl.vertexAttrib3f(SHADER_ATTRIB_POSITION, this.model.pickup_x, this.model.pickup_y, 0);
      this.gl.disableVertexAttribArray(SHADER_ATTRIB_POSITION);
      this.gl.drawArrays(gl.POINTS, 0, 1);
    }
	}

	// Model Listener
	onHeadPush(id_gained) {
		// artefact: copy end/front so mesh connect
		if (this.mesh_head == this.mesh_data.length) {
			for (this.mesh_head = 0; this.mesh_head < this.VERTEX_SIZE; this.mesh_head++) {
				this.mesh_data[this.mesh_head] = this.mesh_data[this.mesh_data.length - this.VERTEX_SIZE + this.mesh_head];
			}
		}
		// append new position to mesh
		let p = this.model.getPoint(id_gained);
		this.mesh_data[this.mesh_head++] = p.x;
		this.mesh_data[this.mesh_head++] = p.y;
		this.mesh_data[this.mesh_head++] = 0;
	}

	onTailPop(id_lost, was_in_tip) {
		// advance tail
		this.mesh_tail += this.VERTEX_SIZE;
		if (this.mesh_tail == this.mesh_data.length) this.mesh_tail = this.VERTEX_SIZE;
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
	}

	onReset() {
		this.mesh_head = this.VERTEX_SIZE;
		this.mesh_tail = this.VERTEX_SIZE;
	}

}
