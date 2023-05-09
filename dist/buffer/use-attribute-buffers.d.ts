import { ProgramId } from "../gl/program/program";
import { AttributeBuffer } from "./AttributeBuffer";
interface Props {
    gl?: WebGL2RenderingContext;
    attributeBuffers?: AttributeBuffer[];
    getAttributeLocation(name: string, programId?: ProgramId): number;
}
export default function useAttributeBuffers({ gl, attributeBuffers, getAttributeLocation }: Props): void;
export {};
