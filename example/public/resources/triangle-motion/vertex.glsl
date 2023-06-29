#version 300 es

precision highp float;

layout (location=0) in vec4 position;
layout (location=1) in vec3 color;
layout (location=2) in vec4 shift;
layout (location=3) in mat4 matrix;

out vec3 vColor;

void main() {
    vColor = color;
    gl_Position = shift + matrix * position;
}
