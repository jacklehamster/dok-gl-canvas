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
            stride: "{stride}",
            rows: "{rows}",
          },
          bufferData: {
            location: "{location}",
            buffer: "{buffer}",
            length: "{length}",
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
            buffer: [
                0.0, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
            ],
            length: undefined,
            size: 3,
            rows: 1,
            divisor: 0,
            stride: 0,
          },
        },
        {
          script: "initBuffer",
          parameters: {
            location: "color",
            buffer: [
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0,
            ],
            length: undefined,
            size: 3,
            rows: 1,
            divisor: 1,
            stride: 0,
          },
        },
        {
          script: "initBuffer",
          parameters: {
            location: "shift",
            size: 3,
            buffer: [
              0, 0, 0,
              -.5, -.5, 0,
              .5, .5, 0,
            ],
            length: undefined,
            rows: 1,
            divisor: 1,
            stride: 0,
          }
        },
        {
          script: "initBuffer",
          parameters: {
            location: "matrix",
            size: 4,
            buffer: undefined,
            length: 3 * 16 * Float32Array.BYTES_PER_ELEMENT,
            rows: 4,
            divisor: 1,
            stride: 4 * 4 * Float32Array.BYTES_PER_ELEMENT,
          }
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
        }
      ],
      tags: ["init"]
    },
    {
      actions: [
        {
          action: "custom",
          location: "matrix",
          modifyAttributeBuffer(mat) {
            for (let i = 0; i < mat.length; i++) {
              mat[i] += (Math.random() - .5) / 100;
            }
          },  
        },
        {
          script: "redraw",
        },
      ],
      tags: ["loop"],
    },
  ]}
  programs={[{
      id: "sample-multicolor",
      vertex,
      fragment,
  }]}
/>;

export default sample;