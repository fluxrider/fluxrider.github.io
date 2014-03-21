/*
 * Written by David Lareau on March 5, 2011.
 * 
 * This file contains various Data Structure that I find useful:
 * - Circular list that overwrites old values as new values are added (set does not refresh the freshness of a value)
 */

function OverwriteCircularArray(capacity) {

	// Attributes/Construct
	this.capacity = capacity;
	this.t = new Array(capacity);
	this.length = 0;
	this.cursor = 0; // points at position that will be overwritten next

	// Methods
	this.add = function(x) {
		this.t[this.cursor] = x;
		this.cursor = (this.cursor + 1) % this.capacity;
		this.length = Math.min(this.length + 1, this.capacity);
	}

	this.set = function(i, x) {
		if (i >= this.length || i < 0) throw new E("ArrayIndexOutOfBoundsException", i);
		this.t[this.index(i)] = x;
	}

	this.remove = function(i) {
		if (i >= this.length || i < 0) throw new E("ArrayIndexOutOfBoundsException", i);
		if (this.length == 0) return;
		// remove last
		if (i == this.length - 1) {
			this.length--;
			this.cursor--;
			if (this.cursor < 0) this.cursor = this.capacity - 1;
		}
		// remove first
		else if (i == 0) {
			this.length--;
		}
		// remove any other
		else {
			var previous = this.index(i);
			for (var j = (previous + 1) % this.capacity; j != this.cursor; j = (j + 1) % this.capacity) {
				this.t[previous] = this.t[j];
				previous = j;
			}
			this.length--;
			this.cursor = previous;
		}
	}

	this.clear = function() {
		this.length = 0;
	}

	this.get = function(i) {
		if (i >= this.length || i < 0) throw new E("ArrayIndexOutOfBoundsException", i);
		return this.t[this.index(i)];
	}

	this.size = function() {
		return this.length;
	}

	this.full = function() {
		return this.length == this.capacity;
	}

	this.empty = function() {
		return this.length == 0;
	}

	// Private Methods
	this.index = function(i) {
		var first = this.cursor - this.length;
		if (first < 0) first += this.capacity;
		return (first + i) % this.capacity;
	}

	// Test
	this.toString = function() {
		var s = "";
		s += "Size ";
		s += this.size();
		s += ": ";
		for (var i = 0; i < this.size(); i++) {
			s += this.get(i);
			if (i != this.size() - 1) s += ' ';
		}
		return s;
	}

}
