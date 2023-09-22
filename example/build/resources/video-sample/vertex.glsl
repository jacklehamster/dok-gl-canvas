#version 300 es

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