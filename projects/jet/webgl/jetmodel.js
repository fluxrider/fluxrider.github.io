/*
 * Written by David Lareau on April 9, 2011
 * 
 * Simple Jet Slalom clone.
 *  - static memory
 *  - double precision position
 *  - tick takes a deltaZ, deltaX as parameters (versus assuming deltaZ = 1 like in the int-based model)
 *  - no edge of world limit
 */

function JetModel(halfWidth, depth, obstacleRate, obstacleCapacity, playerRadius, obstacleRadiusMean, obstacleRadiusRange, passedThreshold) {

	// Attributes
	// player position and radius (radius = width / 2)
	this.px = 0;
	this.pz = 0;
  this.pr = 0;
	// misc stats
	this.obstaclesPassed = 0;

	// Construct
	this.levelHalfWidth = halfWidth; // relative to player, there is no actual level width
	this.levelDepth = depth;
	this.obstacleRate = obstacleRate; // chance of creating a new obstacle (creates until fails so that multiple obstacles can be created at the same instant)
	this.passedThreshold = passedThreshold;

	this.ox = new OverwriteCircularArray(obstacleCapacity);
	this.oz = new OverwriteCircularArray(obstacleCapacity);
	this.or = new OverwriteCircularArray(obstacleCapacity);

	this.pr = playerRadius;
	this.orMean = obstacleRadiusMean;
	this.orRange = obstacleRadiusRange;

	this.reset = function() {
		this.px = this.pz = 0;
		this.ox.clear();
		this.oz.clear();
		this.or.clear();
		this.obstaclesPassed = 0;
	}

	// Methods
	this.tick = function(deltaX, deltaZ) {
		// compute new player location
		var px2 = this.px + deltaX;
		var pz2 = this.pz + deltaZ;

		// test player crashing in obstacles (and reposition player so that they are at the crash point)
		var n = this.getObstacleCount();
		var collision = false;
		for (var i = 0; i < n && !collision; i++) {
			var z = this.oz.get(i);
			// test for collision (obstacle line VS player movement paralelogram
			if (z >= this.pz && z <= pz2) {
				var x = this.ox.get(i);
				var r = this.or.get(i);
				// find what px was at z
				var t = (z - this.pz) / (pz2 - this.pz);
				var xAtZ = this.px + t * (px2 - this.px);
				collision = this.line_line_1D_double(xAtZ - this.pr, xAtZ + this.pr, x - r, x + r);
				// reposition if there was a collision
				if (collision) {
					px2 = xAtZ;
					pz2 = z;
				}
			}
			if (z > pz2) break;
		}

		// advance player (pz2/px2 may have been modied if there was a collision)
		deltaX = px2 - this.px;
		deltaZ = pz2 - this.pz;
		this.pz = pz2;
		this.px = px2;

		if (deltaZ > 0) {
			// count passed obstacles
			var passed = 0;
			for (var i = 0; i < n; i++) {
				var z = this.oz.get(i);
				if (z < this.pz - this.passedThreshold) passed++; // count passed obstacles to remove them on a later step
				if (z >= this.pz) break;
			}

			// remove passed obstacles (the ones that use to be < pz that we counted
			for (var i = 0; i < passed; i++) {
				// remove head
				this.ox.remove(0);
				this.oz.remove(0);
				this.or.remove(0);
			}
			this.obstaclesPassed += passed;
		}

		// create new obstacles (for each slice of deltaZ=1, do while (!ox.full() && Math.random() < obstacleRate))
		// for the remainder, do while (!ox.full() && Math.random() < obstacleRate*deltaZ))
		for (var i = 0; i < cast_int(deltaZ); i++) {
			while (!this.ox.full() && Math.random() < this.obstacleRate) {
				this.createObstacle(deltaZ);
			}
		}
		while (!this.ox.full() && Math.random() < this.obstacleRate * (deltaZ - cast_int(deltaZ))) {
			this.createObstacle(deltaZ);
		}

		// return true if player survives
		return !collision;
	}

	this.getPlayerX = function() {
		return this.px;
	}

	this.getPlayerZ = function() {
		return this.pz;
	}

	this.getPlayerRadius = function() {
		return this.pr;
	}

	this.getObstacleCount = function() {
		return this.ox.size();
	}

	this.getObstacleX = function(i) {
		return this.ox.get(i);
	}

	this.getObstacleZ = function(i) {
		return this.oz.get(i);
	}

	this.getObstacleRadius = function(i) {
		return this.or.get(i);
	}

	this.getObstaclePassed = function() {
		return this.obstaclesPassed;
	}

	this.getLevelWidth = function() {
		return this.levelHalfWidth + this.levelHalfWidth;
	}

	this.getLevelDepth = function() {
		return this.levelDepth;
	}

	this.getPassedThreshold = function() {
		return this.passedThreshold;
	}

	this.setLevelHalfWidth = function(levelHalfWidth) {
		this.levelHalfWidth = levelHalfWidth;
	}

	this.setLevelDepth = function(levelDepth) {
		this.levelDepth = levelDepth;
	}

	this.setObstacleRate = function(obstacleRate) {
		this.obstacleRate = obstacleRate;
	}

	this.setPassedThreshold = function(passedThreshold) {
		this.passedThreshold = passedThreshold;
	}

	this.setRadius = function(radius) {
		this.pz = radius;
	}

	this.isCapacityReached = function() {
		return this.ox.full();
	}

	// Private Methods
	this.insertionSortAdd = function(t, v) {
		t.add(v);
		var i;
		for (i = t.size() - 2; i >= 0 && t.get(i) > v; i--) {
			t.set(i + 1, t.get(i));
		}
		t.set(i + 1, v);
	}

	this.createObstacle = function(deltaZ) {
		this.ox.add(uniformD(this.px - this.levelHalfWidth, this.px + this.levelHalfWidth)); // NOTE: uniformD will never return exactly px+levelHalfWidth but whatever
		this.insertionSortAdd(this.oz, this.pz + this.levelDepth - uniformD(0, deltaZ));
		this.or.add(uniformD(this.orMean - this.orRange, this.orMean + this.orRange));
	}
	
	// Util
	this.line_line_1D_double = function(p1, p2, q1, q2) {
		return Math.max(q1, q2) >= Math.min(p1, p2) && Math.min(q1, q2) <= Math.max(p1, p2);
	}

}
