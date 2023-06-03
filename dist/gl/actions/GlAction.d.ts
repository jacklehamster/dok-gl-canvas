import { BooleanResolution, DokAction, NumberResolution, Script, ScriptProcessor, StringResolution, TypedArrayResolution } from "dok-actions";
import { ProgramId } from "../program/program";
import { GlType, GlUsage } from "./types";
import { ImageId, TextureId, Url } from "../../pipeline/actions/use-image-action";
export declare type LocationName = string;
export declare type LocationResolution = LocationName | StringResolution | [LocationName | StringResolution, 0 | 1 | 2 | 3];
export interface GlAction extends DokAction {
    bufferData?: {
        location: LocationName;
        buffer?: TypedArrayResolution;
        length?: NumberResolution;
        usage?: StringResolution<GlUsage>;
        glType?: GlType;
    };
    bufferSubData?: {
        location?: LocationName;
        data: TypedArrayResolution;
        dstByteOffset?: NumberResolution;
        srcOffset?: NumberResolution;
        length?: NumberResolution;
        glType?: GlType;
    };
    bindVertexArray?: boolean;
    drawArrays?: {
        vertexFirst?: NumberResolution;
        vertexCount?: NumberResolution;
        instanceCount?: NumberResolution;
    };
    vertexAttribPointer?: {
        location: LocationResolution;
        size?: NumberResolution<1 | 2 | 3 | 4>;
        glType?: GlType;
        normalized?: BooleanResolution;
        stride?: NumberResolution;
        offset?: NumberResolution;
        rows?: NumberResolution<1 | 2 | 3 | 4>;
        divisor?: NumberResolution;
        enable?: BooleanResolution;
    };
    uniform?: {
        location: StringResolution<LocationName>;
        int?: NumberResolution;
        float?: NumberResolution;
    };
    clear?: NumberResolution | {
        color?: BooleanResolution;
        depth?: BooleanResolution;
        stencil?: BooleanResolution;
    };
    activateProgram?: StringResolution;
    loadTexture?: {
        imageId: StringResolution<ImageId>;
        textureId: TextureId;
    };
    video?: {
        src: StringResolution<Url>;
        imageId: StringResolution<ImageId>;
        volume?: NumberResolution;
    };
    image?: {
        src: StringResolution<Url>;
        imageId: StringResolution<ImageId>;
        onLoad?: GlAction[];
    };
}
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
}
interface State {
    getScriptProcessor<T>(scripts: Script<T>[]): ScriptProcessor<T>;
}
export declare function useGlAction({ gl, getAttributeLocation, getUniformLocation, setActiveProgram }: Props): State;
export {};
