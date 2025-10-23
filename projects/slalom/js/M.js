// https://www.codeconvert.ai/java-to-javascript-converter. It has a character and usage limit per day, and you got to know it's probably using an unnamed open source tool to do the job like all online tools.

const M = (() => {
  const sqrt2 = 1.414213562373095048801688724209698079;

  // [0, INT_MAX) the classic, never negative
  function rand() {
    return Math.floor(Math.random() * 0x7fffffff);
  }

  // [0, 1) the weird, never 1
  function drand() {
    return Math.random();
  }

  // [min, max]
  function rand_range(min, max) {
    if (min > max) throw new Error(`min > max (${min} > ${max})`);
    return min + (rand() % (max - min + 1));
  }

  function drand_range(min, max) {
    if (min > max) throw new Error(`min > max (${min} > ${max})`);
    if (min === max) return min;
    let r = drand();
    if (max - min < Number.POSITIVE_INFINITY) {
      r = r * (max - min) + min;
    } else {
      const half_min = 0.5 * min;
      r = (r * (0.5 * max - half_min) + half_min) * 2.0;
    }
    if (r > max) r = max;
    return r;
  }

  // games
  function coin() {
    return Math.random() < 0.5;
  }
  function d4() {
    return rand_range(1, 4);
  }
  function d6() {
    return rand_range(1, 6);
  }
  function d8() {
    return rand_range(1, 8);
  }
  function d12() {
    return rand_range(1, 12);
  }
  function d20() {
    return rand_range(1, 20);
  }
  function d(faces) {
    return rand_range(1, faces);
  }

  // array utils
  function rand_index(length) {
    return rand_range(0, length - 1);
  }
  function rand_from_array(arr) {
    return arr[rand_index(arr.length)];
  }

  return {
    sqrt2,
    rand,
    drand,
    rand_range,
    drand_range,
    coin,
    d4,
    d6,
    d8,
    d12,
    d20,
    d,
    rand_index,
    rand_from_array,
  };
})();