// https://www.codeconvert.ai/java-to-javascript-converter. It has a character and usage limit per day, and you got to know it's probably using an unnamed open source tool to do the job like all online tools.

const C = {
  a: (argb) => (argb >> 24) & 0xFF,
  r: (argb) => (argb >> 16) & 0xFF,
  g: (argb) => (argb >> 8) & 0xFF,
  b: (argb) => argb & 0xFF,

  argb_safe: (a, r, g, b) => {
    if (a < 0) a = 0; else if (a > 255) a = 255;
    if (r < 0) r = 0; else if (r > 255) r = 255;
    if (g < 0) g = 0; else if (g > 255) g = 255;
    if (b < 0) b = 0; else if (b > 255) b = 255;
    return (a << 24) | (r << 16) | (g << 8) | b;
  },

  argb: (a, r, g, b) => {
    if (a < 0 || a > 255 || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error(`Color argb components out of range [0-255]: ${a} ${r} ${g} ${b}`);
    }
    return (a << 24) | (r << 16) | (g << 8) | b;
  },

  rgb: (r, g, b) => C.argb(255, r, g, b),

  dargb: (a, r, g, b) => C.argb((a * 255) | 0, (r * 255) | 0, (g * 255) | 0, (b * 255) | 0),

  drgb: (r, g, b) => C.argb(255, (r * 255) | 0, (g * 255) | 0, (b * 255) | 0),

  fa: (argb) => C.a(argb) / 255.0,
  fr: (argb) => C.r(argb) / 255.0,
  fg: (argb) => C.g(argb) / 255.0,
  fb: (argb) => C.b(argb) / 255.0,

  da: (argb) => C.a(argb) / 255.0,
  dr: (argb) => C.r(argb) / 255.0,
  dg: (argb) => C.g(argb) / 255.0,
  db: (argb) => C.b(argb) / 255.0,

  gray: (level) => C.argb(255, level, level, level),
  dgray: (level) => C.gray((level * 255) | 0),

  black: 0xFF000000,
  white: 0xFFFFFFFF,

  brighter: (argb) => {
    const sqrt2 = Math.SQRT2;
    let r = C.r(argb);
    let g = C.g(argb);
    let b = C.b(argb);
    let a = C.a(argb);
    if (r === 0 && g === 0 && b === 0) {
      return C.argb(a, 3, 3, 3);
    }
    const br = (r > 0 && r < 3) ? 3 : Math.floor(r * sqrt2);
    const bg = (g > 0 && g < 3) ? 3 : Math.floor(g * sqrt2);
    const bb = (b > 0 && b < 3) ? 3 : Math.floor(b * sqrt2);
    return C.argb_safe(a, br, bg, bb);
  }
};