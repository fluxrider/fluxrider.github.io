"use strict";

class SnakeAudio {

  constructor() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    this.buffers = [];
    this.preload("start", "res/go.ogg");
    this.preload("death", "res/death.ogg");
    this.preload("yeah_01", "res/yeah_01.ogg");
    this.preload("yeah_02", "res/yeah_02.ogg");
    this.preload("yeah_03", "res/yeah_03.ogg");
    //this.preload("music", "res/music.ogg"); // I want that one streamed
    Object.preventExtensions(this);
  }

  preload(key, url) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    let audiobuffer;
    let self = this;

    request.onload = function() {
      
      if (request.status == 200) {
        self.context.decodeAudioData(request.response, function(buffer) {
          self.buffers[key] = buffer;
        }, function(e) {
          console.log('Error decoding audio data:' + e);
        });
      } else {
        console.log('Audio didn\'t load successfully; error code:' + request.statusText);
      }
    }
    request.send();
  }

  play(key) {
    if(this.buffers[key]) {
      let source = this.context.createBufferSource();
      source.buffer = this.buffers[key];
      source.connect(this.context.destination);
      source.start();
    }
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
    this.play("death");
	}

	onNear(near) {
	}

	onPickup(x, y) {
    this.play("yeah_01");
	}

	onPickupAppears(x, y) {
	}

	onReset() {
    this.play("start");
	}

}
