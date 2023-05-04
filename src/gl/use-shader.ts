import { useCallback } from "react";
import { ProgramConfig } from "./program/program";

let nextId = 1;

interface Props {
    gl?: WebGL2RenderingContext;
    showDebugInfo?: boolean;
}

export interface ProgramResult {
    id: number;
    program: WebGLProgram;
    ready?: boolean;
}

export function useShader({ gl, showDebugInfo }: Props) {
    const typeName = useCallback((type: number) => {
        return type == gl?.VERTEX_SHADER ? "vertex" :
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
    }, [gl]);

    const createProgram = useCallback(({ vertex, fragment}: ProgramConfig): ProgramResult | undefined => {
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

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error("Unable to initialize the shader program:\n" + gl.getProgramInfoLog(program));
        }
        const result = {
            id: nextId++,
            program,
        };
        if (showDebugInfo) {
            console.log(`Program ${result.id} created.`);
        }
        return result;
    }, [gl, showDebugInfo]);

    const removeProgram = useCallback((programResult: ProgramResult) => {
        if (!gl) {
            return;
        }
        gl.deleteProgram(programResult.program);
        if (showDebugInfo) {
            console.log(`Program ${programResult.id} destroyed.`);
        }
        programResult.program = 0;
    }, [gl, showDebugInfo]);

    return {
        createProgram,
        removeProgram,
    }
}