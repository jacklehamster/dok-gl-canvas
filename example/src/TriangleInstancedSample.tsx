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
            vertexCount,
            instanceCount,
          },    
        ],
      },
      {
        name: "init-buffer",
        parameters: ["location", "size", "buffer"],
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
          },
          {
            action: "enableVertexAttribArray",
            location: "{location}",
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
          size: 3,
          buffer: [
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
          ],
        }
      },
      {
        script: "init-buffer",
        context: {
          location: "color",
          size: 3,
          buffer: [
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
          ],
        }
      },
      {
        script: "init-buffer",
        context: {
          location: "shift",
          size: 3,
          buffer: instanceCount * vertexCount * Float32Array.BYTES_PER_ELEMENT,
        }
      },
      {
        action: "vertexAttribDivisor",
        location: "shift",
        divisor: 1
      },
      {
        action: "buffer-sub-data",
        dstByteOffset: 2 * vertexCount * Float32Array.BYTES_PER_ELEMENT,
        buffer: [.5, .5, 0],
      },
      "redraw",
    ]}
    actionLoop={[
      {
        action: "custom",
        location: "shift",
        modifyAttributeBuffer(shift, time) {
            shift[3] = Math.sin(time / 100);
            shift[4] = Math.cos(time / 100);
        },
      },
      "redraw",
    ]}
/>;

export default sample;