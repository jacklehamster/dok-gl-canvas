export interface ClearAction {
    action: "clear";
    bit?: number;
    color?: boolean;
    depth?: boolean;
    stencil?: boolean;
}
export default function useClearAction(gl?: WebGL2RenderingContext): (action: ClearAction) => void;
