/*
 * Written by David Lareau on April 10, 2011.
 * 
 * Polled Input wrapper
 */
 
 var VK_LEFT = 37;
 var VK_RIGHT = 39;
 var VK_A = 65;
 var VK_D = 68;
 var VK_L = 76;
 var VK_P = 80;
 var VK_PAUSE = 19;
 var VK_ENTER = 13;
 var VK_SPACE = 32;
 var VK_BACK_SPACE = 8;
 var VK_BACK_QUOTE = 192;
 var VK_ESCAPE = 27;
 
 var VK_TOUCH_LOWER_LEFT_QUADRANT = 1024
 var VK_TOUCH_LOWER_RIGHT_QUADRANT = 1025
 var VK_TOUCH_UPPER_LEFT_QUADRANT = 1026
 var VK_TOUCH_UPPER_RIGHT_QUADRANT = 1027
 
 function PolledInput() {

	// Attributes/Construct
	this.keyboard_pressed = new Array();
	this.keyboard_changed = new Array();
	this.keyboard_lost = new Array();

	this.focusedVar = true; // BUG: not exact, maybe the component is not focused on start
	this.destroyedVar = false;

	// Methods
	this.typed = function(key) {
		return (this.held(key) && this.changed(key)) || this.lost(key);
	}

	this.held = function(key) {
		return this.keyboard_pressed[key] != undefined && this.keyboard_pressed[key] != 0;
	}

	this.changed = function(key) {
		return this.keyboard_changed[key] != undefined && this.keyboard_changed[key] != 0;
	}

	this.lost = function(key) {
		return this.keyboard_lost[key] != undefined && this.keyboard_lost[key] != 0;
	}

	this.polled = function() {
		this.keyboard_changed.length = 0;
		this.keyboard_lost.length = 0;
	}

	this.clearKeys = function() {
		this.keyboard_pressed.length = 0;
		this.keyboard_changed.length = 0;
		this.keyboard_lost.length = 0;
	}

	this.focused = function() {
		return this.focusedVar;
	}

	this.destroyed = function() {
		return this.destroyedVar;
	}

	// Private Methods
	this.value = function(v) {
		return v ? 1 : 0;
	}

	this.setKey = function(key, state) {
		this.keyboard_lost[key] = this.value(this.held(key) && !state && this.changed(key));
		this.keyboard_changed[key] = this.value(this.held(key) != state);
		this.keyboard_pressed[key] = this.value(state);
	}

	// KeyListener
	this.keyPressed = function(e) {
		this.setKey(e.keyCode, true);
	}

	this.keyReleased = function(e) {
		this.setKey(e.keyCode, false);
	}

	// WindowListener
	this.windowDestroyNotify = function(e) {
		destroyedVar = true;
	}

	this.windowGainedFocus = function(e) {
		clearKeys();
		focusedVar = true;
	}

	this.windowLostFocus = function(e) {
		clearKeys();
		focusedVar = false;
	}

}

