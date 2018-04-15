"use strict";

class Grid {

  constructor(points, minX, minY, maxX, maxY, rows, cols, thickness) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.rows = rows;
    this.cols = cols;
    this.points = points;
    this.thickness = thickness;
    this.thickness_x2_square = (thickness + thickness) * (thickness + thickness);
    //this.outside = [];
    //this.grid = [];
  }

  reset() {
    //this.outside = [];
    //this.grid = [];
  }

  register(id) {
  }

  unregister(id) {
  }

	collides(id, near_threshold) {
    return {
      collides: false,
      near: false
    };
	}

	collides_pts(x, y) {
    return false;
	}
}

