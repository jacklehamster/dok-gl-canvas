import React from 'react'

import { GLCanvas } from 'dok-gl-canvas'

const vertex = `#version 300 es

precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec2 tex;

uniform float time;

out vec2 vTex;

float modPlus(float a, float b) {
  return mod(a + .4, b) - .4;
}

void main() {
    float frame = modPlus(floor(time / 100.), 8.);

    vTex = tex;
    vTex.x += frame * (238.0 / 1886.0);
    gl_Position = position;
}
`;

const program = [
  {
      id: "sample-texture",
      vertex,
      fragment:
      `#version 300 es

        precision highp float;
        uniform sampler2D uTexture;

        in vec2 vTex;
        out vec4 fragColor;

        void main() {
            fragColor = texture(uTexture, vTex);
        }
      `
    },
    {
      id: "sample-color",
      vertex,
      fragment:
      `#version 300 es

        precision highp float;
        uniform sampler2D uTexture;

        in vec2 vTex;
        out vec4 fragColor;

        void main() {
           fragColor = vec4(vTex, 0.0, 1.0);
        }
      `
    },
];

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
        name: "loadTexture",
        actions: [
          {
            loadTexture: {
              textureId: "TEXTURE0",
              imageId: "video",
            },
          }
        ],
      },
      {
        name: "redraw",
        actions: [
          {
            clear: {
              color: true,
            },
            drawArrays: {
              vertexCount: 6,
            },
          },
        ],
      },
      {
        name: "animate",
        actions: [
          {
            action: "custom",
            location: "position",
            modifyAttributeBuffer(positions, time) {
              positions[0] = (Math.sin(time / 500)) / 2;
              positions[9] = (Math.sin(time / 500)) / 2;
              positions[15] = (2 + Math.sin(time / 500)) / 2;
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
                -0.5, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                -0.5, 0.5, 0.0,
                0.5, -0.5, 0.0,
                0.5, 0.5, 0.0,
              ],
            },
          },
          {
            script: "initBuffer",
            parameters: {
              location: "tex",
              size: 2, 
              buffer: [
                0, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 1,
                1, 0,
              ],
            },
          },
          {
            uniform: {
              location: "uTexture",
              int: 0,
            },
            video: {
              src: "sample.mp4",
              imageId: "video",
              volume: 0,
            },
          },
        ],
        tags: ["init"],
      },
      {
        actions: [
          { script: "loadTexture" },
          { script: "animate" },
          { script: "redraw" },
        ],
        tags: ["loop"],
      }
    ]}
    programs={program}
/>;

export default sample;