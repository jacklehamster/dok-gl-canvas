import { RefObject } from "react";
interface Props {
    canvasRef: RefObject<HTMLCanvasElement>;
    webglAttributes?: WebGLContextAttributes;
}
export declare function useGL({ canvasRef, webglAttributes }: Props): WebGL2RenderingContext | undefined;
export {};
