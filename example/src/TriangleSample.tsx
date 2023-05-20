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
    actionScripts={[
      {
        name: "redraw",
        actions: [
          {
            action: "clear",
            color: true,
          },
          {
            action: "draw-arrays",
            vertexCount: 3,
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
        action: "execute-script",
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
        action: "execute-script",
        script: "init-buffer",
        context: {
          location: "color",
          size: 3, 
          buffer: [
              1.0, 0.0, 0.0,
              0.0, 1.0, 0.0,
              0.0, 0.0, 1.0
          ],
        }
      },
      "redraw",
    ]}
    actionLoop={[
      {
        action: "custom",
        location: "position",
        modifyAttributeBuffer(positions, time) {
          positions[0] = Math.sin(time / 100);
        },
      },
      "redraw",
    ]}
/>;

export default sample;