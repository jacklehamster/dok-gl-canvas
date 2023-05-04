import { RefObject } from "react";
interface Props {
    gl?: WebGL2RenderingContext;
    canvasRef: RefObject<HTMLCanvasElement>;
    pixelRatio: number;
}
interface State {
    width: number;
    height: number;
}
export declare function useCanvasSize({ gl, canvasRef, pixelRatio }: Props): State;
export {};
