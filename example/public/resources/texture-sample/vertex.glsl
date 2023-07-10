#version 300 es

precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec2 tex;

uniform float frame;

out vec2 vTex;

float modPlus(float a, float b) {
    return mod(a + .4, b) - .4;
}

void main() {
    float f = modPlus(floor(frame), 8.);

    vTex = tex;
    vTex.x += f * (238.0 / 1886.0);
    gl_Position = position;
}