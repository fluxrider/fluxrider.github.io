"use strict";

class G {

  // TODO Jonathan Richard Shewchuk robust orientation predicate
  // NOTE: I'm not using his robust solution yet because it's quite hard to port to java (i.e. riddled with side-effect macros)
  // Positive if p,q,c are in counter clockwise order (c is to the left), and negative if p,q,c are clockwise (c is to the right), 0 if co-linear.
  static orient2dfast_non_robust(px, py, qx, qy, cx, cy) {
    let acx = px - cx;
    let bcx = qx - cx;
    let acy = py - cy;
    let bcy = qy - cy;
    return acx * bcy - acy * bcx;
  }

  static eucliendian_distance_squared(px, py, qx, qy) {
    let dx = qx - px;
    let dy = qy - py;
    return dx * dx + dy * dy;
  }

  static eucliendian_distance(px, py, qx, qy) {
    return Math.sqrt(G.eucliendian_distance_squared(px, py, qx, qy));
  }

  static dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
  }

  static rot_around(cx, cy, x, y, angle_radian, out_p) {
    let s = Math.sin(angle_radian);
    let c = Math.cos(angle_radian);

    // translate point back to origin:
    x -= cx;
    y -= cy;

    // rotate point and translate back
    return {
      x: x * c - y * s + cx,
      y: x * s + y * c + cy
    };
  }

  static collides_1D(x1, x2, y1, y2) {
    let x_min = Math.min(x1, x2);
    let x_max = Math.max(x1, x2);
    let y_min = Math.min(y1, y2);
    let y_max = Math.max(y1, y2);
    return x_max >= y_min && y_max >= x_min;
  }

  static collides_2D(x1, y1, w1, h1, x2, y2, w2, h2) {
    return G.collides_1D(x1, x1 + w1, x2, x2 + w2) && G.collides_1D(y1, y1 + h1, y2, y2 + h2);
  }

  // Polygon
  static point_in_polygon(point, polygon) {
    // Originally from: http://www.ecse.rpi.edu/~wrf/Research/Short_Notes/pnpoly.html
    let c = false;
    let j = polygon.length - 1;
    for(let i = 0; i < polygon.length; j = i++) {
      if(
        ((polygon[i].y > point.y) != (polygon[j].y > point.y)) && 
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)
      ) {
        c = !c;
      }
    }
    return c;
  }

  // From Line2D (http://grepcode.com/file/repository.grepcode.com/java/root/jdk/openjdk/7-b147/java/awt/geom/Line2D.java#Line2D.linesIntersect%28double,double,double,double,double,double,double,double%29)
  static linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    return (
      (G.relativeCCW(x1, y1, x2, y2, x3, y3) * G.relativeCCW(x1, y1, x2, y2, x4, y4) <= 0) && 
      (G.relativeCCW(x3, y3, x4, y4, x1, y1) * G.relativeCCW(x3, y3, x4, y4, x2, y2) <= 0)
    );
  }

  static relativeCCW(x1, y1, x2, y2, px, py) {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    let ccw = px * y2 - py * x2;
    if(ccw == 0.0) {
      ccw = px * x2 + py * y2;
      if(ccw > 0.0) {
        px -= x2;
        py -= y2;
        ccw = px * x2 + py * y2;
        if(ccw < 0.0) {
          ccw = 0.0;
        }
      }
    }
    return (ccw < 0.0) ? -1 : ((ccw > 0.0) ? 1 : 0);
  }

  static ptSegDistSq(x1, y1, x2, y2, px, py) {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    let dotprod = px * x2 + py * y2;
    let projlenSq;
    if (dotprod <= 0.0) {
      projlenSq = 0.0;
    } else {
      px = x2 - px;
      py = y2 - py;
      dotprod = px * x2 + py * y2;
      if (dotprod <= 0.0) {
        projlenSq = 0.0;
      } else {
        projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
      }
    }
    let lenSq = px * px + py * py - projlenSq;
    if (lenSq < 0) {
      lenSq = 0;
    }
    return lenSq;
  }

  //Robust 2D Segment-Segment distance adapted from:
  //David Eberly, Geometric Tools, Redmond WA 98052
  //Copyright (c) 1998-2016
  //Distributed under the Boost Software License, Version 1.0.
  //http://www.boost.org/LICENSE_1_0.txt
  //http://www.geometrictools.com/License/Boost/LICENSE_1_0.txt

  static segment_segment_dist_squared_robust(P0x, P0y, P1x, P1y, Q0x, Q0y, Q1x, Q1y) {
    // these are pretty stupid use of arrays but it was the simplest way to transcore without inlining the two util functions
    let _segment_segment_dist_squared_robust_parameter = new Array(2);
    let _segment_segment_dist_squared_robust_sValue = new Array(2);
    let _segment_segment_dist_squared_robust_edge = new Array(2);
    let _segment_segment_dist_squared_robust_end = [ [0, 0], [0, 0] ];

    // Result
    let sqrDistance;
    let closest0x;
    let closest0y;
    let closest1x;
    let closest1y;

    // The coefficients of R(s,t), not including the constant term.
    let mA, mB, mC, mD, mE;

    // dR/ds(i,j) at the four corners of the domain
    let mF00, mF10, mF01, mF11;

    // dR/dt(i,j) at the four corners of the domain
    let mG00, mG10, mG01, mG11;

    // The code allows degenerate line segments; that is, P0 and P1 can be
    // the same point or Q0 and Q1 can be the same point.  The quadratic
    // function for squared distance between the segment is
    //   R(s,t) = a*s^2 - 2*b*s*t + c*t^2 + 2*d*s - 2*e*t + f
    // for (s,t) in [0,1]^2 where
    //   a = Dot(P1-P0,P1-P0), b = Dot(P1-P0,Q1-Q0), c = Dot(Q1-Q0,Q1-Q0),
    //   d = Dot(P1-P0,P0-Q0), e = Dot(Q1-Q0,P0-Q0), f = Dot(P0-Q0,P0-Q0)

    let P1mP0x = P1x - P0x;
    let P1mP0y = P1y - P0y;
    let Q1mQ0x = Q1x - Q0x;
    let Q1mQ0y = Q1y - Q0y;
    let P0mQ0x = P0x - Q0x;
    let P0mQ0y = P0y - Q0y;
    mA = G.dot(P1mP0x, P1mP0y, P1mP0x, P1mP0y);
    mB = G.dot(P1mP0x, P1mP0y, Q1mQ0x, Q1mQ0y);
    mC = G.dot(Q1mQ0x, Q1mQ0y, Q1mQ0x, Q1mQ0y);
    mD = G.dot(P1mP0x, P1mP0y, P0mQ0x, P0mQ0y);
    mE = G.dot(Q1mQ0x, Q1mQ0y, P0mQ0x, P0mQ0y);

    mF00 = mD;
    mF10 = mF00 + mA;
    mF01 = mF00 - mB;
    mF11 = mF10 - mB;

    mG00 = -mE;
    mG10 = mG00 - mB;
    mG01 = mG00 + mC;
    mG11 = mG10 + mC;

    if (mA > 0 && mC > 0) {
      // Compute the solutions to dR/ds(s0,0) = 0 and dR/ds(s1,1) = 0.  The
      // location of sI on the s-axis is stored in classifyI (I = 0 or 1).  If
      // sI <= 0, classifyI is -1.  If sI >= 1, classifyI is 1.  If 0 < sI < 1,
      // classifyI is 0.  This information helps determine where to search for
      // the minimum point (s,t).  The fij values are dR/ds(i,j) for i and j in
      // {0,1}.

      _segment_segment_dist_squared_robust_sValue[0] = G._segment_segment_dist_squared_robust_GetClampedRoot(mA, mF00, mF10);
      _segment_segment_dist_squared_robust_sValue[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mA, mF01, mF11);

      let classify = new Array(2);
      for (let i = 0; i < 2; ++i) {
        if (_segment_segment_dist_squared_robust_sValue[i] <= 0) {
          classify[i] = -1;
        } else if (_segment_segment_dist_squared_robust_sValue[i] >= 1) {
          classify[i] = +1;
        } else {
          classify[i] = 0;
        }
      }

      if (classify[0] == -1 && classify[1] == -1) {
        // The minimum must occur on s = 0 for 0 <= t <= 1.
        _segment_segment_dist_squared_robust_parameter[0] = 0;
        _segment_segment_dist_squared_robust_parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG00, mG01);
      } else if (classify[0] == +1 && classify[1] == +1) {
        // The minimum must occur on s = 1 for 0 <= t <= 1.
        _segment_segment_dist_squared_robust_parameter[0] = 1;
        _segment_segment_dist_squared_robust_parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG10, mG11);
      } else {
        // The line dR/ds = 0 intersects the domain [0,1]^2 in a
        // nondegenerate segment.  Compute the endpoints of that segment,
        // end[0] and end[1].  The edge[i] flag tells you on which domain
        // edge end[i] lives: 0 (s=0), 1 (s=1), 2 (t=0), 3 (t=1).
        G._segment_segment_dist_squared_robust_ComputeIntersection(_segment_segment_dist_squared_robust_sValue, classify, _segment_segment_dist_squared_robust_edge, _segment_segment_dist_squared_robust_end, mF00, mB, mF10);

        // The directional derivative of R along the segment of
        // intersection is
        //   H(z) = (end[1][1]-end[1][0])*dR/dt((1-z)*end[0] + z*end[1])
        // for z in [0,1].  The formula uses the fact that dR/ds = 0 on
        // the segment.  Compute the minimum of H on [0,1].
        G._segment_segment_dist_squared_robust_ComputeMinimumParameters(_segment_segment_dist_squared_robust_edge, _segment_segment_dist_squared_robust_end, _segment_segment_dist_squared_robust_parameter, mB, mC, mE, mG00, mG01, mG10, mG11);
      }
    } else {
      if (mA > 0) {
        // The Q-segment is degenerate (Q0 and Q1 are the same point) and
        // the quadratic is R(s,0) = a*s^2 + 2*d*s + f and has (half)
        // first derivative F(t) = a*s + d.  The closest P-point is
        // interior to the P-segment when F(0) < 0 and F(1) > 0.
        _segment_segment_dist_squared_robust_parameter[0] = G._segment_segment_dist_squared_robust_GetClampedRoot(mA, mF00, mF10);
        _segment_segment_dist_squared_robust_parameter[1] = 0;
      } else if (mC > 0) {
        // The P-segment is degenerate (P0 and P1 are the same point) and
        // the quadratic is R(0,t) = c*t^2 - 2*e*t + f and has (half)
        // first derivative G(t) = c*t - e.  The closest Q-point is
        // interior to the Q-segment when G(0) < 0 and G(1) > 0.
        _segment_segment_dist_squared_robust_parameter[0] = 0;
        _segment_segment_dist_squared_robust_parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG00, mG01);
      } else {
        // P-segment and Q-segment are degenerate.
        _segment_segment_dist_squared_robust_parameter[0] = 0;
        _segment_segment_dist_squared_robust_parameter[1] = 0;
      }
    }

    closest0x = (1 - _segment_segment_dist_squared_robust_parameter[0]) * P0x + _segment_segment_dist_squared_robust_parameter[0] * P1x;
    closest0y = (1 - _segment_segment_dist_squared_robust_parameter[0]) * P0y + _segment_segment_dist_squared_robust_parameter[0] * P1y;
    closest1x = (1 - _segment_segment_dist_squared_robust_parameter[1]) * Q0x + _segment_segment_dist_squared_robust_parameter[1] * Q1x;
    closest1y = (1 - _segment_segment_dist_squared_robust_parameter[1]) * Q0y + _segment_segment_dist_squared_robust_parameter[1] * Q1y;
    let diffx = closest0x - closest1x;
    let diffy = closest0y - closest1y;
    sqrDistance = G.dot(diffx, diffy, diffx, diffy);
    return sqrDistance;
  }

  // Compute the root of h(z) = h0 + slope*z and clamp it to the interval
  // [0,1].  It is required that for h1 = h(1), either (h0 < 0 and h1 > 0)
  // or (h0 > 0 and h1 < 0).
  static _segment_segment_dist_squared_robust_GetClampedRoot(slope, h0, h1) {
    // Theoretically, r is in (0,1).  However, when the slope is nearly zero,
    // then so are h0 and h1.  Significant numerical rounding problems can
    // occur when using floating-point arithmetic.  If the rounding causes r
    // to be outside the interval, clamp it.  It is possible that r is in
    // (0,1) and has rounding errors, but because h0 and h1 are both nearly
    // zero, the quadratic is nearly constant on (0,1).  Any choice of p
    // should not cause undesirable accuracy problems for the final distance
    // computation.
    //
    // NOTE:  You can use bisection to recompute the root or even use
    // bisection to compute the root and skip the division.  This is generally
    // slower, which might be a problem for high-performance applications.

    let r;
    if (h0 < 0) {
      if (h1 > 0) {
      r = -h0 / slope;
      if (r > 1) {
        r = 0.5;
      }
      // The slope is positive and -h0 is positive, so there is no
      // need to test for a negative value and clamp it.
      } else {
        r = 1;
      }
    } else {
      r = 0;
    }
    return r;
  }

  // Compute the intersection of the line dR/ds = 0 with the domain [0,1]^2.
  // The direction of the line dR/ds is conjugate to (1,0), so the algorithm
  // for minimization is effectively the conjugate gradient algorithm for a
  // quadratic function.
  static _segment_segment_dist_squared_robust_ComputeIntersection(sValue, classify, edge, end, mF00, mB, mF10) {
    // The divisions are theoretically numbers in [0,1].  Numerical rounding
    // errors might cause the result to be outside the interval.  When this
    // happens, it must be that both numerator and denominator are nearly
    // zero.  The denominator is nearly zero when the segments are nearly
    // perpendicular.  The numerator is nearly zero when the P-segment is
    // nearly degenerate (mF00 = a is small).  The choice of 0.5 should not
    // cause significant accuracy problems.
    //
    // NOTE:  You can use bisection to recompute the root or even use
    // bisection to compute the root and skip the division.  This is generally
    // slower, which might be a problem for high-performance applications.

    if (classify[0] < 0) {
        edge[0] = 0;
        end[0][0] = 0;
        end[0][1] = mF00 / mB;
        if (end[0][1] < 0 || end[0][1] > 1) {
          end[0][1] = 0.5;
        }

        if (classify[1] == 0) {
          edge[1] = 3;
          end[1][0] = sValue[1];
          end[1][1] = 1;
        } else // classify[1] > 0
        {
          edge[1] = 1;
          end[1][0] = 1;
          end[1][1] = mF10 / mB;
          if (end[1][1] < 0 || end[1][1] > 1) {
            end[1][1] = 0.5;
          }
        }
      } else if (classify[0] == 0) {
        edge[0] = 2;
        end[0][0] = sValue[0];
        end[0][1] = 0;

        if (classify[1] < 0) {
          edge[1] = 0;
          end[1][0] = 0;
          end[1][1] = mF00 / mB;
          if (end[1][1] < 0 || end[1][1] > 1) {
            end[1][1] = 0.5;
          }
        } else if (classify[1] == 0) {
          edge[1] = 3;
          end[1][0] = sValue[1];
          end[1][1] = 1;
        } else {
          edge[1] = 1;
          end[1][0] = 1;
          end[1][1] = mF10 / mB;
          if (end[1][1] < 0 || end[1][1] > 1) {
            end[1][1] = 0.5;
          }
        }
      } else // classify[0] > 0
    {
      edge[0] = 1;
      end[0][0] = 1;
      end[0][1] = mF10 / mB;
      if (end[0][1] < 0 || end[0][1] > 1) {
        end[0][1] = 0.5;
      }

      if (classify[1] == 0) {
        edge[1] = 3;
        end[1][0] = sValue[1];
        end[1][1] = 1;
      } else {
        edge[1] = 0;
        end[1][0] = 0;
        end[1][1] = mF00 / mB;
        if (end[1][1] < 0 || end[1][1] > 1) {
          end[1][1] = 0.5;
        }
      }
    }
  }

  // Compute the location of the minimum of R on the segment of intersection
  // for the line dR/ds = 0 and the domain [0,1]^2.
  static _segment_segment_dist_squared_robust_ComputeMinimumParameters(edge, end, parameter, mB, mC, mE, mG00, mG01, mG10, mG11) {
    let delta = end[1][1] - end[0][1];
    let h0 = delta * (-mB * end[0][0] + mC * end[0][1] - mE);
    if (h0 >= 0) {
      if (edge[0] == 0) {
        parameter[0] = 0;
        parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG00, mG01);
      } else if (edge[0] == 1) {
        parameter[0] = 1;
        parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG10, mG11);
      } else {
        parameter[0] = end[0][0];
        parameter[1] = end[0][1];
      }
    } else {
      let h1 = delta * (-mB * end[1][0] + mC * end[1][1] - mE);
      if (h1 <= 0) {
        if (edge[1] == 0) {
          parameter[0] = 0;
          parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG00, mG01);
        } else if (edge[1] == 1) {
          parameter[0] = 1;
          parameter[1] = G._segment_segment_dist_squared_robust_GetClampedRoot(mC, mG10, mG11);
        } else {
          parameter[0] = end[1][0];
          parameter[1] = end[1][1];
        }
      } else // h0 < 0 and h1 > 0
      {
        let z = Math.min(Math.max(h0 / (h0 - h1), 0), 1);
        let omz = 1 - z;
        parameter[0] = omz * end[0][0] + z * end[1][0];
        parameter[1] = omz * end[0][1] + z * end[1][1];
      }
    }
  }


}
