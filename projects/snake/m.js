var M_EPSILON = 0.00001;

class M {

  static is_normalized(x) {
    return x >= 0 && x <= 1;
  }

  static kinda_equals_dx(a, b, epsilon) {
    let absolute = a - b;
    if (absolute < 0) absolute = -absolute;
    return absolute <= epsilon;
  }

  static kinda_equals(a, b) {
    return M.kinda_equals_dx(a, b, M_EPSILON);
  }

  static round(number) {
    return (number >= 0) ? Math.trunc(number + 0.5) : Math.trunc(number - 0.5);
  }

  static round_dx(x, decimals) {
    p = Math.pow(10.0, decimals);
    return M.round(x * p) / p;
  }

  //Bezier
  static linear_bezier(t, p0, p1) {
    if (!M.is_normalized(t)) throw "t is not between 0 and 1";
    return p0 + t * (p1 - p0);
  }

  static quadratic_bezier(t, p0, p1, p2) {
    if (!M.is_normalized(t)) throw "t is not between 0 and 1";
    let T = 1 - t;
    return T * (T * p0 + t * p1) + t * (T * p1 + t * p2);
  }

  static cubic_bezier(t, p0, p1, p2, p3) {
    // linear combination of two quadratic bezier curves
    return (1 - t) * M.quadratic_bezier(t, p0, p1, p2) + t * M.quadratic_bezier(t, p1, p2, p3);
  }

}
