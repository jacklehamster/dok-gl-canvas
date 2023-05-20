import React from 'react'

import { GLCanvas } from 'dok-gl-canvas'

const vertex =  `#version 300 es
  precision highp float;
  layout (location=0) in vec4 position;
  layout (location=1) in vec3 color;
  layout (location=2) in vec4 shift;
  layout (location=3) in mat4 matrix;

  out vec3 vColor;

  void main() {
      vColor = color;
      gl_Position = shift + matrix * position;
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

const sample = () => <GLCanvas
    actionScripts={[
      {
        name: "redraw",
        actions: [
          {
            action: "clear",
            color: true,
          },
          {
            action: "draw-arrays-instanced",
            vertexCount: 3,
            instanceCount: 3,
          },    
        ],
      },
      {
        name: "init-buffer",
        parameters: ["location", "size", "buffer", "rows", "stride"],
        actions: [
          {
            action: "createBuffer",
            location: "{location}"
          },
          {
            action: "bindBuffer",
            location: "{location}"
          },
          {
            action: "vertexAttribPointer",
            location: "{location}",
            size: "{size}",
            rows: "{rows}",
            stride: "{stride}"
          },
          {
            action: "vertexAttribDivisor",
            location: "{location}",
            divisor: "{divisor}",
            rows: "{rows}",
          },
          {
            action: "enableVertexAttribArray",
            location: "{location}",
            rows: "{rows}",
          },
          {
            action: "buffer-data",
            location: "{location}",
            buffer: "{buffer}",
          },
        ]
      }
    ]}
    programs={[{
        id: "sample-multicolor",
        vertex,
        fragment,
    }]}
    actionPipeline={[
      {
        script: "init-buffer",
        context: {
          location: "position",
          buffer: [
              0.0, 0.5, 0.0,
              -0.5, -0.5, 0.0,
              0.5, -0.5, 0.0,
          ],
          size: 3,
          rows: 1,
          divisor: 0,
          stride: 0,
        },
      },
      {
        script: "init-buffer",
        context: {
          location: "color",
          buffer: [
              1.0, 0.0, 0.0,
              0.0, 1.0, 0.0,
              0.0, 0.0, 1.0,
          ],
          size: 3,
          rows: 1,
          divisor: 1,
          stride: 0,
        },
      },
      {
        script: "init-buffer",
        context: {
          location: "shift",
          size: 3,
          buffer: [
            0, 0, 0,
            -.5, -.5, 0,
            .5, .5, 0,
          ],
          rows: 1,
          divisor: 1,
          stride: 0,
        }
      },

      {
        action: "createBuffer",
        location: "matrix"
      },
      {
        action: "bindBuffer",
        location: "matrix"
      },
      {
        action: "vertexAttribPointer",
        location: ["matrix", 0],
        size: 4,
        stride: 16 * 4,
        offset: 0 * 4 * Float32Array.BYTES_PER_ELEMENT,
      },
      {
        action: "vertexAttribDivisor",
        location: ["matrix", 0],
        divisor: 1,
      },
      {
        action: "enableVertexAttribArray",
        location: ["matrix", 0],
      },
      {
        action: "vertexAttribPointer",
        location: ["matrix", 1],
        size: 4,
        stride: 16 * 4,
        offset: 1 * 4 * Float32Array.BYTES_PER_ELEMENT,
      },
      {
        action: "vertexAttribDivisor",
        location: ["matrix", 1],
        divisor: 1,
      },
      {
        action: "enableVertexAttribArray",
        location: ["matrix", 1],
      },
      {
        action: "vertexAttribPointer",
        location: ["matrix", 2],
        size: 4,
        stride: 16 * 4,
        offset: 2 * 4 * Float32Array.BYTES_PER_ELEMENT,
      },
      {
        action: "vertexAttribDivisor",
        location: ["matrix", 2],
        divisor: 1,
      },
      {
        action: "enableVertexAttribArray",
        location: ["matrix", 2],
      },
      {
        action: "vertexAttribPointer",
        location: ["matrix", 3],
        size: 4,
        stride: 16 * 4,
        offset: 3 * 4 * Float32Array.BYTES_PER_ELEMENT,
      },
      {
        action: "vertexAttribDivisor",
        location: ["matrix", 3],
        divisor: 1,
      },
      {
        action: "enableVertexAttribArray",
        location: ["matrix", 3],
      },

      {
        action: "buffer-data",
        location: "matrix",
        buffer: 3 * 16 * Float32Array.BYTES_PER_ELEMENT,
      },              

      {
        action: "custom",
        location: "matrix",
        modifyAttributeBuffer(mat) {
          for (let inst = 0; inst < 3; inst++) {
            for (let i = 0; i < 4; i++) {
              mat[inst * 16 + i + i * 4] = 1;
            }  
          }
        },
      },
      "redraw",
    ]}
    actionLoop={[
      {
        action: "custom",
        location: "matrix",
        modifyAttributeBuffer(mat) {
          for (let i = 0; i < mat.length; i++) {
            mat[i] += (Math.random() - .5) / 100;
          }
        },
      },
      "redraw",
    ]}
/>;

export default sample;