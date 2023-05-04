import React from 'react'

import { GLCanvas } from 'dok-gl-canvas'
import 'dok-gl-canvas/dist/index.css'
import { GetAttributeLocation, GlConfig } from '../../dist/control/gl-controller';

const vertex =  `#version 300 es

precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec3 color;

out vec3 vColor;

void main() {
    vColor = color;
    gl_Position = position;
}
`;
const fragment = `#version 300 es

precision highp float;
in vec3 vColor;
out vec4 fragColor;

void main() {
    fragColor = vec4(vColor, 1.0);
}
`;

function initialize(gl: WebGL2RenderingContext, getAttributeLocation: GetAttributeLocation) {
  const triangleArray = gl.createVertexArray();
    gl.bindVertexArray(triangleArray);

    const positionLocation = getAttributeLocation("position");
    const positions = positionLocation >= 0 ? new Float32Array([
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ]) : undefined;
    const positionBuffer = positionLocation >= 0 ? gl.createBuffer() : undefined;
    if (positionLocation >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer ?? null);
      gl.bufferData(gl.ARRAY_BUFFER, positions ?? null, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionLocation);
    }

    const colorLocation = getAttributeLocation("color");
    const colors = colorLocation >= 0 ? new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ]) : undefined;
    const colorBuffer = colorLocation >= 0 ? gl.createBuffer() : undefined;
    if (colorLocation >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer ?? null);
      gl.bufferData(gl.ARRAY_BUFFER, colors ?? null, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);
    }

    //  Cleanup
    return () => {
      gl.deleteVertexArray(triangleArray);
      gl.deleteBuffer(positionBuffer ?? null);
      gl.deleteBuffer(colorBuffer ?? null);
      if (positionLocation >= 0) {
        gl.disableVertexAttribArray(positionLocation);
      }
      if (colorLocation >= 0) {
        gl.disableVertexAttribArray(colorLocation);
      }    
    };
}

const onChange = ({gl, getAttributeLocation}: GlConfig): undefined => {
  const cleanup = initialize(gl, getAttributeLocation);
  ////////////////
  // DRAW
  ////////////////
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  cleanup();
  return;
}

const App = () => {
  return <GLCanvas
    showDebugInfo={true}
    programs={[{
        id: "sample-multicolor",
        vertex,
        fragment,
    }]}
    onChange={onChange}
  />;
}

export default App
