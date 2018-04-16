"use strict";

class Grid {

  constructor(model, minX, minY, maxX, maxY, rows, cols, thickness) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.rows = rows;
    this.cols = cols;
    this.model = model;
    this.thickness = thickness;
    // TODO currently just use a list of registered points
    this.registered = new Set();
    Object.preventExtensions(this);
  }

  reset() {
    this.registered.clear();
  }

  register(id) {
    this.registered.add(id);
  }

  unregister(id) {
    this.registered.delete(id);
  }

	static sign(x) {
		if (x < -M_EPSILON) return -1;
		if (x > M_EPSILON) return 1;
		return 0;
	}

	collides(id, near_threshold) {
		let near = false;
		let b = id;
		let a = id - this.model.POINT_SIZE;
		if (a < 0) a = this.model.points.length - this.model.POINT_SIZE;
		let ax = this.model.points[a];
		let ay = this.model.points[a + 1];
		let bx = this.model.points[b];
		let by = this.model.points[b + 1];

		let dx = bx - ax;
		let dy = by - ay;
		let length = Math.sqrt(dx * dx + dy * dy);
    if(length == 0) {
      //console.log("division by zero");
      return {
        collides: false,
        near: near
      };
    }

		dx /= length;
		dy /= length;

		let b2x = ax + dx * near_threshold;
		let b2y = ay + dy * near_threshold;

		// Note: The tip (i.e. neck) strategy isn't perfect. I need to confirm that the line we are testing against is in the direction we are moving.
		// Due to high co-linear problems with the direction test, I have to fudge it forward a little.
		let nx = ax + .1 * (bx - ax);
		let ny = ay + .1 * (by - ay);
		let mx = nx + dy;
		let my = ny + dx;
		let towards_sign = Grid.sign(G.orient2dfast_non_robust(nx, ny, mx, my, bx, by));

		for (let index of this.registered.values()) {
			let q = index;
			let p = index - this.model.POINT_SIZE;
			if (p < 0) p = this.model.points.length - this.model.POINT_SIZE;
			let px = this.model.points[p];
			let py = this.model.points[p + 1];
			let qx = this.model.points[q];
			let qy = this.model.points[q + 1];

			// first test if we are moving towards this line (i.e. this is to avoid testing against our neck)
			if ((Grid.sign(G.orient2dfast_non_robust(nx, ny, mx, my, qx, qy)) == towards_sign) || (Grid.sign(G.orient2dfast_non_robust(nx, ny, mx, my, px, py)) == towards_sign)) {
				if (Math.sqrt(G.segment_segment_dist_squared_robust(ax, ay, bx, by, px, py, qx, qy)) < this.thickness * 2) {
					return {
            collides: true,
            near: near
          };
				}
				if (Math.sqrt(G.segment_segment_dist_squared_robust(ax, ay, b2x, b2y, px, py, qx, qy)) < this.thickness) {
					near = true;
				}

			}
		}

    return {
      collides: false,
      near: near
    };
	}

	collides_pts(x, y) {
		for (let index of this.registered.values()) {
			let q = index;
			let p = index - this.model.POINT_SIZE;
			if (p < 0) p = this.model.points.length - this.model.POINT_SIZE;
			if (Math.sqrt(G.ptSegDistSq(this.model.points[p], this.model.points[p + 1], this.model.points[q], this.model.points[q + 1], x, y)) < this.thickness * 2) {
				return true;
			}
		}
    return false;
	}
}

