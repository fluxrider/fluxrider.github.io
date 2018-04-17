"use strict";

class ScoreView {

  constructor(model) {
		this.model = model;
    this.score = document.getElementById("score");
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
	}

	onPickup(x, y) {
    this.score.innerHTML = this.model.score;
	}

	onPickupAppears(x, y) {
	}

	onReset() {
    this.score.innerHTML = this.model.score;
	}

}
