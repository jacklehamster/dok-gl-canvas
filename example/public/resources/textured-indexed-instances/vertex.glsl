#version 300 es

precision highp float;

layout (location=0) in vec4 position;
layout (location=1) in vec2 tex;
layout (location=3) in mat4 matrix;

out vec2 vTex;

uniform mat4 perspective;
uniform mat4 orthogonal;
uniform float isPerspective;
uniform float frame;

float modPlus(float a, float b) {
    return mod(a + .4, b) - .4;
}

void main() {
    float f = modPlus(floor(frame), 8.);
    mat4 projection = perspective * isPerspective + orthogonal * (1. - isPerspective);
    vTex = tex;
    vTex.x += f * (238.0 / 1886.0);
    gl_Position = projection * matrix * position;
}
