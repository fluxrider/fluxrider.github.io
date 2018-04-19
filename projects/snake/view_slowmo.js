"use strict";

class Slowmo {

  constructor() {
    this.go_back = false;
    Object.preventExtensions(this);
  }

	// Model Listener
	onHeadPush(id_gained) {
	}

	onTailPop(id_lost, was_in_tip) {
	}

	onTipPop(id_lost, was_in_tail) {
	}

	onTick(monotonic_ms, delta_seconds) {
    // slowly move back towards speed of 1
    if(this.go_back) {
      let t = 1 * delta_seconds;
      game_time_factor = game_time_factor * (1 - t) + t;
    }
	}

	onCollision() {
	}

	onNear(near) {
    if(!O_apply_slowmo) return;
    // slowmo
    if(near) {
       game_time_factor = .2;
    } else {
      // go back to regular speed gradually
      this.go_back = true;
    }
	}

	onPickup(x, y) {
	}

	onPickupAppears(x, y) {
	}

	onReset() {
    this.go_back = false;
    game_time_factor = 1;
	}

}
