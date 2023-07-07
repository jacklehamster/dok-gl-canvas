#version 300 es

precision highp float;

layout (location=0) in vec4 position;
layout (location=1) in vec3 color;
layout (location=3) in mat4 matrix;

out vec3 vColor;
uniform mat4 perspective;
uniform mat4 orthogonal;
uniform float isPerspective;

void main() {
    vColor = color;
    mat4 projection = perspective * isPerspective + orthogonal * (1. - isPerspective);
    gl_Position = projection * matrix * position;
}
