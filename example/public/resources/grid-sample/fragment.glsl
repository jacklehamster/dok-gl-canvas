#version 300 es

precision highp float;
out vec4 fragColor;
in vec2 vGridPosition;

void main() {
    float x = abs(fract(vGridPosition.x) - .5) * 2.;
    float y = abs(fract(vGridPosition.y) - .5) * 2.;
    float val = smoothstep(.95, 1., max(x, y));
    fragColor = vec4(0., 0., 1., val);
}