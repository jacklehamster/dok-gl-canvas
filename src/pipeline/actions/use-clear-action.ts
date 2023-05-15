import { useCallback } from "react";
import { GlExecuteAction } from "./GlAction";

export interface ClearAction {
    action: "clear",
    bit?: number,
    color?: boolean;
    depth?: boolean;
    stencil?: boolean;
}

export default function useClearAction(gl?: WebGL2RenderingContext) {
    const execute = useCallback((action: ClearAction) => {
        if (!gl) {
            return;
        }
        const {color, depth, stencil} = action;
        if (action.bit === undefined) {
            action.bit = 0;
            if (color) {
                action.bit |= gl?.COLOR_BUFFER_BIT;
            }
            if (depth) {
                action.bit |= gl?.DEPTH_BUFFER_BIT;
            }
            if (stencil) {
                action.bit |= gl?.STENCIL_BUFFER_BIT;
            }    
        }
        if (action.bit) {
            gl.clear(action.bit);
        }
    }, [gl]);
    return useCallback((action: ClearAction & GlExecuteAction) => {
        action.execute = execute;
        execute(action);
    }, [ execute ]);
}