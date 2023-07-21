#version 300 es

precision highp float;
uniform sampler2D uTexture;

in vec2 vTex;
out vec4 fragColor;

void main() {
    fragColor = texture(uTexture, vTex);
    if (fragColor.a <= 0.1) {
		discard;
	}    
}
