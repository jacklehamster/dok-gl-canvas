import React from 'react'

import { GLCanvas } from 'dok-gl-canvas'

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

const sample = () => <GLCanvas
    scripts={[
      {
        name: "initBuffer",
        actions: [
          {
            vertexAttribPointer: {
              location: "{location}",
              size: "{size}",
              enable: true,
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
                  0.0, 0.0, 1.0
              ],
            },
          }
        ],
        tags: ["init"],
      },
      {
        actions: [
          {
            action: "custom",
            location: "position",
            modifyAttributeBuffer(positions, time) {
              positions[0] = Math.sin(time / 100);                
            },
          },
          {
            clear: {
              color: true,
            },
            drawArrays: {
              vertexCount: 3,
            },
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