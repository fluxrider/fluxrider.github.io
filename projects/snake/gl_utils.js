"use strict";

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  alert(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if(gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  alert(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return undefined;
}


