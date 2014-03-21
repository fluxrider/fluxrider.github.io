/*
 * Written by David Lareau on April 9, 2011.
 * 
 * Standard function needed by all.
 */

// Integer
function div(a, b) {
	return Math.floor(a / b) + (a % b < 0? 1 : 0);
}

function cast_int(x) {
	if(x >= 0) return Math.floor(x);
	else return Math.floor(x) + 1;
}

// Exception
// usage example: throw new E("ArgumentException", "Unsupported parameter type: " + param1);
function E(name, message) {
	this.name = name;
	this.message = message;
}

// Random
function uniformD(min, max) {
	return min + (Math.random() * (max - min));
}

function uniform(k, l) {
	return k + cast_int((Math.random() * (l - k + 1)));
}

// Math
function toDegrees(radian) {
	return radian / Math.PI * 180;
}

function greaterOrEqualPowerOfTwo(x) {
	var p = 1;
	while (p < x)
		p *= 2;
	return p;
}

function round(x, n) {
	// @param n: number of decimals
	var p = Math.pow(10, n);
	return Math.round(x * p) / p;
}


// Time
function currentTimeMillis() {
	return new Date().getTime();
}

// Timer
function Timer() {
	// Attributes
	this.t0 = 0;
	this.lastCheckVar = 0;

	this.reset = function() {
		this.t0 = currentTimeMillis();
		this.lastCheckVar = this.t0;
	}
	
	this.reset();

	this.lastCheck = function(interval) {
		var now = currentTimeMillis();
		if (this.lastCheckVar + interval > now) return false;
		this.lastCheckVar = now;
		return true;
	}

	this.deltaCheck = function() {
		var now = currentTimeMillis();
		var delta = now - this.lastCheckVar;
		this.lastCheckVar = now;
		return delta;
	}
	
	this.deltaCheckPassive = function() {
		var now = currentTimeMillis();
		var delta = now - this.lastCheckVar;
		return delta;
	}

	this.elapsed = function() {
		return currentTimeMillis() - this.t0;
	}

	this.toString = function() {
		var t = this.elapsed();
		return t.toString();
	}

}

// FPS
function FPS(interval, historyLength) {
	// Attributes
	this.frameCount = 0;
	this.fpsInterval = 0;
	this.fps = 0;
	this.fpsTimer = null;
	this.lastFPSTime = 0;
	this.history = null;

	// Construct
	if(arguments.length != 0 && arguments.length != 2) throw({name: "ArgumentException", message: "Unsupported parameter arity: " + arguments.length });
	if(arguments.length == 0) {
		interval = 1000;
		historyLength = 60;
	}
	this.fpsTimer = new Timer();
	this.fpsInterval = interval;
	this.history = new OverwriteCircularArray(historyLength);

	// Method
	this.frame = function() {
		// fps
		this.frameCount++;
		if (this.fpsTimer.lastCheck(this.fpsInterval)) {
			var now = currentTimeMillis();
			this.fps = this.frameCount * 1000 / (now - this.lastFPSTime);
			this.frameCount = 0;
			if (this.lastFPSTime > 0) this.history.add(this.fps);
			this.lastFPSTime = now;
		}
	}

	this.get = function() {
		return this.fps;
	}

	this.min = function() {
		if (!this.history.empty()) {
			var min = this.history.get(0);
			for (var i = 1; i < this.history.size(); i++) {
				var v = this.history.get(i);
				if (v < min) min = v;
			}
			return min;
		}
		return 0;
	}

	this.max = function() {
		if (!this.history.empty()) {
			var max = this.history.get(0);
			for (var i = 1; i < this.history.size(); i++) {
				var v = this.history.get(i);
				if (v > max) max = v;
			}
			return max;
		}
		return 0;
	}

	this.stddev = function() {
		var sum = 0;
		var sum2 = 0;
		var n = this.history.size();
		for (var i = 0; i < n; i++) {
			var v = this.history.get(i);
			sum += v;
			sum2 += v * v;
		}
		var mean = sum / n;
		var variance = (sum2 / (n - 1)) - ((n / (n - 1)) * mean * mean);
		return Math.sqrt(variance);
	}
}

// RGB
function RGB(r,g,b) {
	this.r = r;
	this.g = g;
	this.b = b;
}