#version 300 es

precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec2 tex;
layout (location=2) in vec2 animation;

uniform float frame;
uniform float slotSideCount;

out vec2 vTex;
out float textureIndex;

//  mod, but avoiding floating point errors
float modPlus(float a, float b) {
    return mod(a + .4, b) - .4;
}

//  floor avoiding floating point errors
float floorPlus(float a) {
    return max(floor(a), 0.);
}

void main() {
    float slotTex = 1. / slotSideCount;
    float slotStart = animation[0];
    float frameCount = animation[1];
    float f = slotStart + modPlus(frame, frameCount);
    float slotX = modPlus(f, slotSideCount);
    float slotY = modPlus(floorPlus(f / slotSideCount), slotSideCount);

    vTex = (tex + vec2(slotX, slotY)) * slotTex;
    textureIndex = floorPlus(f / (slotSideCount * slotSideCount));

    gl_Position = position;
}