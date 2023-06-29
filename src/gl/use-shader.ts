import { ProgramConfig } from "dok-gl-actions/dist/program/program";
import { useCallback } from "react";

let nextId = 1;

interface Props {
    gl?: WebGL2RenderingContext;
}

export interface ProgramResult {
    id: number;
    vertex: string;
    fragment: string;
    program?: WebGLProgram;
    ready?: boolean;
}

export function useShader({ gl }: Props) {
    const typeName = useCallback((type: number) => {
        return type === gl?.VERTEX_SHADER ? "vertex" :
            type === gl?.FRAGMENT_SHADER ? "fragment" :
            undefined;
    }, [gl]);

    const createShader = useCallback((shaderSource: string, type: GLenum) => {
        if (!gl) {
            return;
        }
        if (type !== gl.VERTEX_SHADER && type !== gl.FRAGMENT_SHADER) {
            throw new Error(`Shader error in ${typeName(type)}`);
        }
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error(`Unable to generate ${typeName(type)} shader.`);
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            // Something went wrong during compilation; get the error
            console.error(`Shader compile error in ${typeName(type)}:` + gl.getShaderInfoLog(shader));
        }
        return shader;      
    }, [gl, typeName]);

    const createProgram = useCallback(({ vertex, fragment }: ProgramConfig): ProgramResult | undefined => {
        if (!gl) {
            return;
        }
        const program = gl.createProgram();
        if (!program) {
            throw new Error(`Unable to create program.`);
        }

        const vertexShader = createShader(vertex, gl.VERTEX_SHADER)!;
        const fragmentShader = createShader(fragment, gl.FRAGMENT_SHADER)!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.validateProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Unable to initialize the shader program:\n" + gl.getProgramInfoLog(program));
        }
        const result = {
            id: nextId++,
            program,
            vertex,
            fragment,
        };
        return result;
    }, [createShader, gl]);

    const removeProgram = useCallback((programResult: ProgramResult) => {
        if (!gl) {
            return;
        }
        if (programResult.program) {
            gl.deleteProgram(programResult.program);
        }
        programResult.program = undefined;
    }, [gl]);

    return {
        createProgram,
        removeProgram,
    }
}