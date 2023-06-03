import React from 'react'

import { GLCanvas } from 'dok-gl-canvas'

const vertex =  `#version 300 es
  precision highp float;
  layout (location=0) in vec4 position;
  layout (location=1) in vec3 color;
  layout (location=2) in vec4 shift;

  out vec3 vColor;

  void main() {
      vColor = color;
      gl_Position = position + shift;
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

const instanceCount = 3;
const vertexCount = 3;

const sample = () => <GLCanvas
  scripts={[
      {
        name: "redraw",
        actions: [
          {
            clear: { color: true },
            drawArrays: {
              vertexCount,
              instanceCount,
            },
          },
        ]
      },
      {
        name: "initBuffer",
        actions: [
          {
            vertexAttribPointer: {
              location: "{location}",
              size: "{size}",
              enable: true,
              divisor: "{divisor}",
            },
            bufferData: {
              location: "{location}",
              buffer: "{buffer}",
            },
          },
        ],
      },
      {
        actions: [
          {
            script: "initBuffer",
            parameters: {
              location: "position",
              size: 3,
              buffer: [
                0.0, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
              ],
              divisor: 0,  
            },
          },
          {
            script: "initBuffer",
            parameters: {
              location: "color",
              size: 3,
              buffer: [
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0,
              ],
              divisor: 0,  
            },
          },
          {
            script: "initBuffer",
            parameters: {
              location: "shift",
              size: 3,
              buffer: instanceCount * vertexCount * Float32Array.BYTES_PER_ELEMENT,    
              divisor: 1,  
            },
            bufferSubData: {
              dstByteOffset: 2 * vertexCount * Float32Array.BYTES_PER_ELEMENT,
              data: [.5, .5, 0],      
            },
          },
        ],
        tags: ["init"],
      },
      {
        actions: [
          {
            action: "custom",
            location: "shift",
            modifyAttributeBuffer(shift, time) {
                shift[3] = Math.sin(time / 100);
                shift[4] = Math.cos(time / 100);
            },
          },
          {
            script: "redraw",
          },
        ],
        tags: ["loop"],
      }
    ]}
    programs={[{
        id: "sample-multicolor",
        vertex,
        fragment,
    }]}
/>;

export default sample;