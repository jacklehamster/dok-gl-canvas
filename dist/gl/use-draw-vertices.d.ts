import { DrawVertexParams } from "../buffer/AttributeBuffer";
export interface Props {
    gl?: WebGL2RenderingContext;
    drawVertexParams?: DrawVertexParams;
    programReady: boolean;
}
export default function useDrawVertices({ gl, drawVertexParams, programReady }: Props): void;
