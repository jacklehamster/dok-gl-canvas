import { useCallback } from "react";

export interface ClearAction {
    action: "clear",
    color?: boolean;
    depth?: boolean;
    stencil?: boolean;
}

export default function useClearAction(gl?: WebGL2RenderingContext) {
    return useCallback(({color, depth, stencil}: ClearAction) => {
        if (!gl) {
            return;
        }
        let bit = 0;
        if (color) {
            bit |= gl?.COLOR_BUFFER_BIT;
        }
        if (depth) {
            bit |= gl?.DEPTH_BUFFER_BIT;
        }
        if (stencil) {
            bit |= gl?.STENCIL_BUFFER_BIT;
        }
        if (bit) {
            gl.clear(bit);
        }
    }, [gl]);
}