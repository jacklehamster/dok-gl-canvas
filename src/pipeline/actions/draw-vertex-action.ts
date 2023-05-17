export interface DrawArraysAction {
    action: "draw-arrays",
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}

export interface DrawArraysInstancedAction {
    action: "draw-arrays-instanced",
    vertexFirst?: GLint;
    vertexCount: GLsizei;
    instanceCount: GLsizei;    
}
