import { ProgramId } from "../gl/program/program";
import { BufferAttributeAction } from "./BufferAttributeAction";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
}
export default function useBufferAttributes({ gl, getAttributeLocation }: Props): {
    bindVertexArray: () => () => void | undefined;
    bufferAttributes: (bufferAttributeAction: BufferAttributeAction) => ((() => void) | undefined);
};
export {};
