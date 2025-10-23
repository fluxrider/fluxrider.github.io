// https://www.codeconvert.ai/java-to-javascript-converter. It has a character and usage limit per day, and you got to know it's probably using an unnamed open source tool to do the job like all online tools.

class DPoint3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  setXYZ(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Face {
  constructor() {
    this.points = [];
    this.maxZ = 0;
    this.rgb = 0;
  }
  calcMaxZ() {
    const d1 = this.points[1].x - this.points[0].x;
    const d2 = this.points[1].y - this.points[0].y;
    const d3 = this.points[1].z - this.points[0].z;
    const d4 = this.points[2].x - this.points[0].x;
    const d5 = this.points[2].y - this.points[0].y;
    const d6 = this.points[2].z - this.points[0].z;
    const a = d2 * d6 - d3 * d5;
    const b = d1 * d6 - d3 * d4;
    const c = d1 * d5 - d2 * d4;
    this.maxZ = Math.sqrt(a * a + b * b + c * c);
  }
}

class Obstacle {
  constructor() {
    this.points = [new DPoint3(), new DPoint3(), new DPoint3(), new DPoint3()];
    this.faces = [new Face(), new Face(), new Face()];
    this.rgb = 0;
    this.faces[0].points = [this.points[3], this.points[0], this.points[1]];
    this.faces[1].points = [this.points[3], this.points[2], this.points[1]];
  }
  prepareNewObstacle() {
    this.faces[0].calcMaxZ();
    this.faces[0].rgb = C.brighter(this.rgb);
    this.faces[1].calcMaxZ();
    this.faces[1].rgb = this.rgb;
  }
  move(x, y, z) {
    for (let i = 0; i < 4; i++) {
      const dPoint3 = this.points[i];
      dPoint3.x += x;
      dPoint3.y += y;
      dPoint3.z += z;
    }
  }
}

class RoundManager {
  constructor() {
    this.prevRound = null;

    this.nextRoundScore = 0;
    this.sky_rgb = 0;
    this.ground_rgb = 0;
    this.gameTime = 0;
  }

  setPrevRound(round) {
    this.prevRound = round;
  }

  getGroundRGB() {
    return this.ground_rgb;
  }

  getNextRoundScore() {
    return this.nextRoundScore;
  }

  createObstacle(x1, x2) {
    const o = new Obstacle();
    const arrayOfDPoint3 = o.points;
    arrayOfDPoint3[0].setXYZ(x1 - x2, 2.0, 25.5);
    arrayOfDPoint3[1].setXYZ(x1, -1.4, 25.0);
    arrayOfDPoint3[2].setXYZ(x1 + x2, 2.0, 25.5);
    arrayOfDPoint3[3].setXYZ(x1, 2.0, 24.5);

    switch (M.rand_index(4)) {
      case 0:
        o.rgb = C.gray(192);
        break;
      case 1:
        o.rgb = C.rgb(96, 160, 240);
        break;
      case 2:
        o.rgb = C.rgb(200, 128, 0);
        break;
      case 3:
        o.rgb = C.rgb(240, 210, 100);
        break;
    }
    o.prepareNewObstacle();
    return o;
  }

  createObstacleDefault() {
    return this.createObstacle(M.drand_range(-16.0, 16.0), 0.6);
  }

  isNextRound(score) {
    return !(score < this.nextRoundScore);
  }

  getSkyRGB() {
    if (this.prevRound === null || this.gameTime > 32) return this.sky_rgb;
    const i = this.gameTime;
    const j = 32 - i;
    const prev = this.prevRound.sky_rgb;
    const curr = this.sky_rgb;
    const k = C.r(prev) * j + C.r(curr) * i;
    const m = C.g(prev) * j + C.g(curr) * i;
    const n = C.b(prev) * j + C.b(curr) * i;
    return C.argb_safe(255, k / 32, m / 32, n / 32);
  }

  init() {}

  move(dx) {}

  generateObstacle() {
    throw new Error("Abstract method 'generateObstacle' must be implemented");
  }
}

class NormalRound extends RoundManager {
  constructor(round_score, sky_rgb, ground_rgb, interval) {
    super();
    this.nextRoundScore = round_score;
    this.sky_rgb = sky_rgb;
    this.ground_rgb = ground_rgb;
    this.interval = interval;
    this.counter = 0;
  }

  generateObstacle() {
    this.gameTime++;
    this.counter++;
    if (this.counter < this.interval) return null;
    this.counter = 0;
    return this.createObstacleDefault();
  }

  init() {
    this.counter = 0;
    this.gameTime = 0;
  }
}

class RoadRound extends RoundManager {
  constructor(score, sky_rgb, ground_rgb, is_broken) {
    super();
    this.nextRoundScore = score;
    this.sky_rgb = sky_rgb;
    this.ground_rgb = ground_rgb;
    this.isBrokenRoad = is_broken;

    this.OX1 = 0;
    this.OX2 = 0;
    this.OVX = 0;
    this.WX = 0;
    this.direction = 0;
    this.roadCounter = 0;
    this.gameTime = 0;
  }

  generateObstacle() {
    this.gameTime++;
    this.roadCounter--;
    let d1 = 1.1;
    let d2;

    if (this.isBrokenRoad && this.roadCounter % 13 < 7) {
      d1 = 0.7;
      d2 = M.drand_range(-16.0, 16.0);
      if (d2 < this.OX2 && d2 > this.OX1) {
        d1 = 1.2;
        if (M.coin()) {
          d2 = this.OX1;
        } else {
          d2 = this.OX2;
        }
      }
    } else if (this.roadCounter % 2 === 0) {
      d2 = this.OX1;
    } else {
      d2 = this.OX2;
    }

    if (this.OX2 - this.OX1 > 9.0) {
      this.OX1 += 0.6;
      this.OX2 -= 0.6;
      if (this.OX2 - this.OX1 > 10.0) d1 = 2.0;
    } else if (this.OX1 > 18.0) {
      this.OX2 -= 0.6;
      this.OX1 -= 0.6;
    } else if (this.OX2 < -18.0) {
      this.OX2 += 0.6;
      this.OX1 += 0.6;
    } else {
      if (this.roadCounter < 0) {
        this.direction = -this.direction;
        this.roadCounter += 2 * M.rand_range(4, 11);
      }
      if (this.direction > 0) {
        this.OVX += 0.125;
      } else {
        this.OVX -= 0.125;
      }
      if (this.OVX > 0.7) this.OVX = 0.7;
      if (this.OVX < -0.7) this.OVX = -0.7;
      this.OX1 += this.OVX;
      this.OX2 += this.OVX;
    }
    return this.createObstacle(d2, d1);
  }

  init() {
    this.OX1 = -17.0;
    this.OX2 = 17.0;
    this.OVX = 0.0;
    this.roadCounter = 0;
    this.direction = 1;
    this.gameTime = 0;
  }

  move(dx) {
    this.OX1 += dx;
    this.OX2 += dx;
  }
}

class Game {
  constructor() {
    this.rounds = [
      new NormalRound(8000, C.rgb(0, 160, 255), C.rgb(0, 200, 64), 4),
      new NormalRound(12000, C.rgb(240, 160, 160), C.rgb(64, 180, 64), 3),
      new NormalRound(25000, C.black, C.rgb(0, 128, 64), 2),
      new RoadRound(40000, C.rgb(0, 180, 240), C.rgb(0, 200, 64), false),
      new RoadRound(100000, C.gray(192), C.rgb(64, 180, 64), true),
      new NormalRound(1000000, C.black, C.rgb(0, 128, 64), 1)
    ];
    this.ground_points = [
      new DPoint3(-100.0, 2.0, 28.0),
      new DPoint3(-100.0, 2.0, 0.1),
      new DPoint3(100.0, 2.0, 0.1),
      new DPoint3(100.0, 2.0, 28.0)
    ];
    this.obstacles = [];
    this.vx = 0.0; // ship's left/right movement
    this.round = 0;
    this.damaged = 0;
    this.score = 0;
    this.prevScore = 0;
    this.hiscore = 0;
    this.contNum = 0;
    this.title_mode = true;

    this.nowSin = 0;
    this.nowCos = 0;

    for (let b = 1; b < this.rounds.length; b++) {
      this.rounds[b].setPrevRound(this.rounds[b - 1]);
    }
  }

  startGame(play_mode, resume) {
    this.title_mode = !play_mode;
    this.obstacles.length = 0;
    for (const r of this.rounds) r.init();
    this.damaged = 0;
    this.round = 0;
    this.score = 0;
    this.vx = 0.0;
    if (!resume) {
      this.contNum = 0;
    } else {
      while (this.prevScore >= this.rounds[this.round].getNextRoundScore()) this.round++;
      if (this.round > 0) {
        this.score = this.rounds[this.round - 1].getNextRoundScore();
        this.contNum++;
      }
    }
  }

  tick(left, right) {
    if (this.rounds[this.round].isNextRound(this.score)) this.round++;
    if (this.damaged > 0) this.damaged++;

    // ship input
    // turn
    if (this.damaged === 0 && !this.title_mode) {
      if (right) this.vx = Math.max(this.vx - 0.1, -0.6);
      if (left) this.vx = Math.min(this.vx + 0.1, 0.6);
    }
    // stabilize back
    if (!left && !right) {
      if (this.vx < 0.0) this.vx = Math.min(this.vx + 0.025, 0);
      if (this.vx > 0.0) this.vx = Math.max(this.vx - 0.025, 0);
    }

    // move obstacles
    let angle = Math.abs(this.vx) * 100.0; // [-60, 60]
    this.nowSin = Math.sin(Math.PI * angle / 180);
    this.nowCos = Math.cos(Math.PI * angle / 180);
    if (this.vx > 0.0) this.nowSin = -this.nowSin;

    for (let i = 0; i < this.obstacles.length; ) {
      const obstacle = this.obstacles[i];
      obstacle.move(this.vx, 0.0, -1.0);
      const points = obstacle.points;
      if (points[0].z <= 1.1) {
        const d = 0.7 * this.nowCos;
        if (-d < points[2].x && points[0].x < d) this.damaged++;
        this.obstacles.splice(i, 1);
      } else {
        i++;
      }
    }

    this.rounds[this.round].move(this.vx);
    const obstacle = this.rounds[this.round].generateObstacle();
    if (obstacle != null) this.obstacles.unshift(obstacle);

    // tick
    if (!this.title_mode) this.score += 20;
    if (this.damaged > 20) {
      if (!this.title_mode) this.prevScore = this.score;
      if (this.score - this.contNum * 1000 > this.hiscore && !this.title_mode)
        this.hiscore = this.score - this.contNum * 1000;
      this.title_mode = true;
    }
    if (this.title_mode) {
      this.vx = 0.0;
    }
  }
}