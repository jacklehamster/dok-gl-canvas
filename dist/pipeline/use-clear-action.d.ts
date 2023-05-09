export interface ClearAction {
    action: "clear";
    color?: boolean;
    depth?: boolean;
    stencil?: boolean;
}
export default function useClearAction(gl?: WebGL2RenderingContext): ({ color, depth, stencil }: ClearAction) => void;
