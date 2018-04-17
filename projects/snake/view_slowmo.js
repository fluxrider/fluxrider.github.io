"use strict";

class Slowmo {

  constructor() {
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
	}

	onCollision() {
	}

	onNear(near) {
    // slowmo  // TODO interpolate
    if(near) {
      game_time_factor = .2;
    } else {
      game_time_factor = 1;
    }
	}

	onPickup(x, y) {
	}

	onPickupAppears(x, y) {
	}

	onReset() {
    game_time_factor = 1;
	}

}
