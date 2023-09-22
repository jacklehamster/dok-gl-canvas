#version 300 es

precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec2 gridPosition;

out vec2 vGridPosition;

void main() {
    gl_Position = position;
    vGridPosition = gridPosition;
}
