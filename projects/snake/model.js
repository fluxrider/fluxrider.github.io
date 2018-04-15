"use strict";

let O_show_fps = true;
let O_apply_slowmo = true;
let O_show_line_view = true;
let O_show_thickness_view = true;
let O_play_music = true;
let O_play_sound = true;
let O_show_pickup_score = true;
let O_show_arrows = true;
let O_serpentine = true;
let O_continuous = true;
let O_high_score = 0;


class Model {

  constructor(max_points) {
    this.listeners = [];

    // input
    this.leftHeld = false;
    this.rightHeld = false;
    this.leftPressed = false;
    this.rightPressed = false;

    // Model
    this.started = false;
    this.score = 0;
    this.length = 0;
    this.tip_length = 0;
    this.thickness = .01; // cut corner design: a few things assume static thickness, so it's final
    this.max_tip_length = 0;
    this.dead = false;
    this.goalSpeed = false;
    this.goalTurnSpeed = false;

    this.direction = 0;
    this.px = 0;
    this.py = 0;

    this.INIT_TURN_SPEED = 7;
    this.scoreTurnSpeedInc = 0; // unused
    this.gradualTurnSpeedIncPerSec = 0; // unused

    this.INIT_SPEED = .2;
    this.scoreSpeedInc = this.INIT_SPEED / 10;
    this.gradualSpeedIncPerSec = this.scoreSpeedInc / 2;
    this.FINAL_SPEED = this.INIT_SPEED + this.scoreSpeedInc * 22;

    this.INIT_MAX_LENGTH = 0.1;
    this.scoreMaxLengthInc = this.INIT_MAX_LENGTH;
    this.FINAL_MAX_LENGTH = this.INIT_MAX_LENGTH + this.scoreMaxLengthInc * 22;

    this.turnSpeed = this.INIT_TURN_SPEED;
    this.speed = this.INIT_SPEED;
    this.max_length = this.INIT_MAX_LENGTH;

    this.POINT_SIZE = 2;
    this.head = 0;
    this.tail = 0;
    this.tip = 0;

    this.pickup_exists = false;
    this.pickup_x = 0;
    this.pickup_y = 0;

    this.nearCollision = false;

    this.points = new Array(max_points * this.POINT_SIZE); // xy (circular array)
    this.points[max_points * this.POINT_SIZE - 1] = 0;
    this.points[max_points * this.POINT_SIZE - 2] = 0;
    this.grid = new Grid(this, -.5, -.5, .5, .5, 32, 32, this.thickness);

    Object.preventExtensions(this);
  }

  getNearThreshold() {
    return 5 * this.thickness * 5 * this.speed;
  }

  getPoint(id) {
    if ((id < this.tail && id > this.head) || (id > this.head && id < this.tail)) throw "invalid id";
    return {
      x: this.points[id],
      y: this.points[id + 1]
    }
  }

  getPickup() {
    return {
      x: this.pickup_x,
      y: this.pickup_y
    };
  }

  reset() {
		this.started = true;
		this.score = 0;
		this.length = 0;
		this.tip_length = 0;
		this.max_tip_length = this.thickness * 5;
		this.dead = false;
		this.goalSpeed = 0;
		this.goalTurnSpeed = 0;

		if (O_continuous) {
			this.direction = Math.random() * 2 * Math.PI;
		} else {
			this.direction = (int) (Math.random() * 4) * (Math.PI / 2);
		}
		this.px = 0;
		this.py = 0;

		this.turnSpeed = this.INIT_TURN_SPEED;
		this.speed = this.INIT_SPEED;
		this.max_length = this.INIT_MAX_LENGTH;

		this.head = 0;
		this.tail = 0;
		this.tip = 0;

		this.nearCollision = false;

		this.pickup_exists = false;

    this.grid.reset();

		for (let listener of this.listeners) {
			listener.onReset();
		}
	}

	tick(monotonic_ms, delta_seconds) {
		if (this.dead) return;
		let max_direction = 2 * Math.PI;

		// speed up
		if (this.speed < this.goalSpeed) {
			this.speed += this.gradualSpeedIncPerSec * delta_seconds;
			if (this.speed > this.goalSpeed) this.speed = this.goalSpeed;
		}
		if (this.turnSpeed < this.goalTurnSpeed) {
			this.turnSpeed += this.gradualTurnSpeedIncPerSec * delta_seconds;
			if (this.turnSpeed > this.goalTurnSpeed) this.turnSpeed = this.goalTurnSpeed;
		}

		// turn
		if (O_continuous) {
			if (!this.leftHeld || !this.rightHeld) {
				if (this.leftHeld) {
					this.direction += this.turnSpeed * delta_seconds;
				}
				if (this.rightHeld) {
					this.direction -= this.turnSpeed * delta_seconds;
				}
			}
		} else {
			if (this.leftPressed) {
				this.direction += Math.PI / 2;
			}
			if (this.rightPressed) {
				this.direction -= Math.PI / 2;
			}
		}
		while (this.direction < 0)
			this.direction += max_direction;
		while (this.direction > max_direction)
			this.direction -= max_direction;
		// serpentine motion
		let serpentine = 0;
		if (O_serpentine) {
			let s = monotonic_ms / 1000.0;
			s = s - Math.trunc(s);
			let F = 20;
			let A = 10;
			serpentine = A * delta_seconds * Math.sin(F * s);
		}
		let dx = Math.cos(this.direction + serpentine) * this.speed * delta_seconds;
		let dy = Math.sin(this.direction + serpentine) * this.speed * delta_seconds;
		this.px += dx;
		this.py += dy;
		let head_length = Math.sqrt(dx * dx + dy * dy);
		this.length += head_length;

		if (this.head == this.points.length) {
			this.head = 0;
		}
		// append new position to mesh
		let head_id = this.head;
		this.points[this.head++] = this.px;
		this.points[this.head++] = this.py;
		for (let listener of this.listeners) {
			listener.onHeadPush(head_id);
		}

		// cut tail short (forced due to buffer)
		let circular_buffer_full = this.tail == this.head;
		let special_edge_case = this.tail == 0 && this.head == this.points.length;
		if (circular_buffer_full || special_edge_case) {
			this.tail_pop();
		}

		// cut tail short (because of snake length)
    let tmp = performance.now();
		while (this.length > this.max_length) {
      //alert("Poping cause " + this.length + " > " + this.max_length + " tmp: " + tmp);
			this.tail_pop();
		}

		// update tip (head section we don't collide with)
		this.tip_length += head_length;
		while (this.tip_length > this.max_tip_length) {
      //alert("tip");
      
			let a = this.tip;
			let b = this.tip + this.POINT_SIZE;
			if (b == this.points.length) b = 0;
			let tail_of_tip_length = G.eucliendian_distance(this.points[b], this.points[b + 1], this.points[a], this.points[a + 1]);
			// the max is really the min max, I don't want to cut it too short
			if (this.tip_length - tail_of_tip_length <= this.max_tip_length) break;
			this.tip_pop(tail_of_tip_length, false);
      this.grid.register(b);
		}

		// collision detection (with self)
    let collides_ret = this.grid.collides(head_id, this.getNearThreshold());
		if (collides_ret.collides) {
			this.dead = true;
			for (let listener of this.listeners) {
				listener.onCollision();
			}
		}

    if(!this.dead) {
			// collision detection (with walls) (remember arena is -.5 to .5, and walls are at tickness)
			let thickness_x3 = 3 * this.thickness; // the 2 thickness of the wall + the worms
			if ((this.px - thickness_x3 < -.5) || (this.px + thickness_x3 > .5) || (this.py - thickness_x3 < -.5) || (this.py + thickness_x3 > .5)) {
				this.dead = true;
				for (let listener of this.listeners) {
					listener.onCollision();
				}
			}

			// collision warning (with walls)
			if (!this.dead) {
				let nearWall = false;
				let p2x = this.px - dx + (dx / head_length) * this.getNearThreshold();
				let p2y = this.py - dy + (dy / head_length) * this.getNearThreshold();
				if ((p2x - thickness_x3 < -.5) || (p2x + thickness_x3 > .5) || (p2y - thickness_x3 < -.5) || (p2y + thickness_x3 > .5)) {
					nearWall = true;
				}

				if (!this.nearCollision && (nearWall || collides_ret.near)) {
					this.nearCollision = true;
					for (let listener of this.listeners) {
						listener.onNear(this.nearCollision);
					}
				} else if (this.nearCollision && (!nearWall && !collides_ret.near)) {
					this.nearCollision = false;
					for (let listener of this.listeners) {
						listener.onNear(this.nearCollision);
					}
				}
			}

		  // spawn pickup
		  if (!this.pickup_exists) {
			  this.pickup_exists = true;
			  do {
				  do {
					  do {
						  this.pickup_x = (Math.random() - .5) * (1 - 2 * thickness_x3);
						  this.pickup_y = (Math.random() - .5) * (1 - 2 * thickness_x3);
						  // spawn it in the circle within the arena box, that should be fair (it's not like I wrote a proof though)
					  } while (this.pickup_x * this.pickup_x + this.pickup_y * this.pickup_y > .5 * .5);
					  // spawn without being too close to your neck /*&& distance from head */
				  } while (G.eucliendian_distance_squared(this.px, this.py, this.pickup_x, this.pickup_y) < this.tip_length * this.tip_length);
				  // spawn it without colliding with your own body
			  } while (this.grid.collides_pts(this.pickup_x, this.pickup_y));
			  for (let listener of this.listeners) {
				  listener.onPickupAppears(this.pickup_x, this.pickup_y);
			  }
		  }

			// collision with pickup
			if (Math.sqrt(G.ptSegDistSq(this.px, this.py, this.px - dx, this.py - dy, this.pickup_x, this.pickup_y)) < 2 * this.thickness) {
				this.pickup_exists = false;
				this.score++;
				if (O_high_score < this.score) {
					O_high_score++;
					// TODO O_save();
				}
				this.goalSpeed = Math.min(this.INIT_SPEED + this.score * this.scoreSpeedInc, this.FINAL_SPEED);
				this.goalTurnSpeed = this.INIT_TURN_SPEED + this.score * this.scoreTurnSpeedInc;
				this.max_length = Math.min(this.INIT_MAX_LENGTH + this.score * this.scoreMaxLengthInc, this.FINAL_MAX_LENGTH);
				for (let listener of this.listeners) {
					listener.onPickup(this.pickup_x, this.pickup_y);
				}
			}

    }

		for (let listener of this.listeners) {
			listener.onTick(monotonic_ms, delta_seconds);
		}

		this.leftPressed = false;
		this.rightPressed = false;
	}

	tail_pop() {
		// get tail points
		let a = this.tail;
		let b = this.tail + this.POINT_SIZE;
		if (b == this.points.length) b = 0;
		// decrement length
		let tail_length = G.eucliendian_distance(this.points[b],  this.points[b + 1], this.points[a], this.points[a + 1]);
		this.length -= tail_length;
		// if tail is part of tip, advance tip too
		let is_in_tip = this.tip == this.tail;
		if (is_in_tip) {
			this.tip_pop(this.tail_length, true);
		} else {
      this.grid.unregister(b);
		}
		// advance tail
		let tail_lost = this.tail;
		this.tail += this.POINT_SIZE;
		if (this.tail == this.points.length) this.tail = 0;

		for (let listener of this.listeners) {
			listener.onTailPop(tail_lost, is_in_tip);
		}
	}

	tip_pop(delta_length, is_in_tail) {
		this.tip_length -= delta_length;
		let tip_lost = this.tip;
		this.tip += this.POINT_SIZE;
		if (this.tip == this.points.length) {
			this.tip = 0;
		}
		for (let listener of this.listeners) {
			listener.onTipPop(tip_lost, is_in_tail);
		}
	}

	setInput(leftHeld, rightHeld) {
		if (!this.leftHeld && leftHeld) this.leftPressed = true;
		if (!this.rightHeld && rightHeld) this.rightPressed = true;
		this.leftHeld = leftHeld;
		this.rightHeld = rightHeld;
	}

}
