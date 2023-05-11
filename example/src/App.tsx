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


const App = () => <GLCanvas
    actionScripts={[
      {
        name: "redraw",
        actions: [
          {
            action: "clear",
            color: true,
          },
          {
            action: "draw",
            vertexCount: 3,
          },    
        ],
      }
    ]}
    programs={[{
        id: "sample-multicolor",
        vertex,
        fragment,
    }]}
    actionPipeline={[
      {
        action: "bind-vertex",
      },
      {
        action: "buffer-attribute",
        location: "position",
        buffer: [
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
        ],
        size: 3,
      },
      {
        action: "buffer-attribute",
        location: "color",
        buffer: [
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        ],
        size: 3,
      },
      "redraw",
    ]}
    actionLoop={[
      {
        action: "custom",
        location: "position",
        processAttributeBuffer(positions, time) {
          positions[0] = Math.sin(time / 100);
          return undefined;       
        },
      },
      "redraw",
    ]}
/>;


export default App
