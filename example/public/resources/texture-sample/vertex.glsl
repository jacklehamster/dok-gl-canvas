#version 300 es

precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec2 tex;

uniform float frame;
uniform float slotTex;

out vec2 vTex;

float modPlus(float a, float b) {
    return mod(a + .4, b) - .4;
}

void main() {
    float f = modPlus(floor(frame), 8.);

    vTex = tex * slotTex;
    vTex.x += f * slotTex;
    gl_Position = position;
}