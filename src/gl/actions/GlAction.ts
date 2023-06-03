import { BooleanResolution, Context, Convertor, DEFAULT_CONVERTORS, DokAction, ExecutionParameters, ExecutionStep, Formula, NumberResolution, Script, ScriptProcessor, StringResolution, TypedArrayResolution, calculateBoolean, calculateNumber, calculateString, calculateTypedArray, convertAction, execute } from "dok-actions";
import { useCallback, useEffect, useRef } from "react";
import useBufferAttributes, { BufferInfo } from "../../pipeline/actions/use-buffer-attributes";
import { ProgramId } from "../program/program";
import { clearRecord } from "../../utils/object-utils";
import { GlType, GlUsage, useTypes } from "./types";
import useImageAction, { ImageId, TextureId, Url } from "../../pipeline/actions/use-image-action";
import useCustomAction, { CustomAction } from "../../pipeline/actions/custom/use-custom-action";

export type LocationName = string;
export type LocationResolution = LocationName | StringResolution | [LocationName|StringResolution, 0|1|2|3];

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
      size?: NumberResolution<1|2|3|4>;
      glType?: GlType;
      normalized?: BooleanResolution;
      stride?: NumberResolution;
      offset?: NumberResolution;
      rows?: NumberResolution<1|2|3|4>;
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
};

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
}

interface State {
    getScriptProcessor<T>(scripts: Script<T>[]): ScriptProcessor<T>;
}

export function useGlAction({ gl, getAttributeLocation, getUniformLocation, setActiveProgram }: Props): State {
    const bufferRecord = useRef<Record<LocationName, BufferInfo>>({});
    useEffect(() => {
      const record = bufferRecord.current;
      return () => {
        clearRecord(record, info => {
          if (info.buffer) {
            gl?.deleteBuffer(info.buffer);
          }
        });
      };
    }, [gl, bufferRecord]);

    const { bindVertexArray, getBufferAttribute, bufferData } = useBufferAttributes({ gl, getAttributeLocation });

    const { getTypedArray, getGlUsage, getGlType, getByteSize } = useTypes();

    const { executeLoadTextureAction, loadVideo, loadImage } = useImageAction({ gl });

    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });

    const getBufferInfo = useCallback((location: string): BufferInfo => {
        return getBufferAttribute(location, true);
    }, [getBufferAttribute]);

    const convertBufferData = useCallback<Convertor<GlAction>>(({bufferData: buffer}: GlAction, results) => {
        if (!buffer || !gl) {
          return;
        }
        const location = calculateString(buffer.location);
        const TypeArrayConstructor = getTypedArray(buffer.glType);
        const data = buffer.buffer ? calculateTypedArray(buffer.buffer, TypeArrayConstructor) : undefined;
        const length = calculateNumber(buffer.length);
        const usage = calculateString<GlUsage>(buffer.usage, "STATIC_DRAW");

        results.push((context) => {
          const locationValue = location.valueOf(context);
          const bufferInfo = getBufferInfo(locationValue);          
          gl?.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);

          const dataToBuffer = data?.valueOf(context);
          const bufferSize = dataToBuffer ? dataToBuffer.length : length?.valueOf(context);
          const glUsage = getGlUsage(usage?.valueOf(context));

          if (bufferSize) {
            bufferData(locationValue, dataToBuffer, bufferSize, glUsage);
          }
        });
    }, [gl, getTypedArray, getBufferInfo, getGlUsage, bufferData]);

    const convertBufferSubData = useCallback<Convertor<GlAction>>(({bufferSubData}, results) => {
      if (!bufferSubData?.data) {
        return;
      }

      const TypeArrayConstructor = getTypedArray(bufferSubData.glType);
      const data = calculateTypedArray(bufferSubData.data, TypeArrayConstructor);
      const dstByteOffset = calculateNumber(bufferSubData.dstByteOffset);
      const srcOffset = calculateNumber(bufferSubData.srcOffset);
      const length = calculateNumber(bufferSubData.length);
      const location = bufferSubData.location !== undefined ? calculateString(bufferSubData.location) : undefined;

      results.push((context) => {
        if (location !== undefined) {
          const bufferInfo = getBufferInfo(location.valueOf(context));          
          gl?.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);  
        }
        const bufferArray = data.valueOf(context);
        if (bufferArray) {
          gl?.bufferSubData(gl.ARRAY_BUFFER, dstByteOffset.valueOf(context), bufferArray, srcOffset.valueOf(context), length.valueOf(context) || bufferArray.length);
        }
      });
    }, [getBufferInfo, getTypedArray, gl]);

    const convertVertexArray = useCallback<Convertor<GlAction>>(({ bindVertexArray: bind }, results) => {
      if (!bind) {
        return;
      }
      results.push((context) => {
        const cleanup = bindVertexArray();
        context.cleanupActions?.push(cleanup);
      });
    }, [bindVertexArray]);
    
    const convertDrawArrays = useCallback<Convertor<GlAction>>(({drawArrays}, results) => {
      if (!drawArrays) {
        return;
      }
      const { vertexFirst, vertexCount, instanceCount } = drawArrays;
      const first = calculateNumber(vertexFirst);
      const count = calculateNumber(vertexCount);
      const instances = instanceCount !== undefined ? calculateNumber(instanceCount) : undefined;

      if (instances !== undefined) {
        results.push((context) => gl?.drawArraysInstanced(gl.TRIANGLES, first?.valueOf(context), count.valueOf(context), instances.valueOf(context)));
      } else {
        results.push((context) => gl?.drawArrays(gl.TRIANGLES, first.valueOf(context), count.valueOf(context)));
      }
    }, [gl]);

    const resolveLocation = useCallback((location: LocationResolution): [{valueOf(context?: Context): string}, 0|1|2|3] => {
        if (Array.isArray(location)) {
            return [calculateString(location[0]), location[1]];
        }
        return [calculateString(location), 0];
    }, []);

    const convertVertexAttribPointer = useCallback<Convertor<GlAction>>(({vertexAttribPointer: attributes}, results) => {
      if (!attributes) {
        return;
      }
      const [loc, locationOffset] = resolveLocation(attributes.location);
      const size = calculateNumber(attributes.size);
      const glType: GLenum = getGlType(attributes.glType);
      const byteSize = getByteSize(attributes.glType);
      const normalized = calculateBoolean(attributes.normalized);
      const stride = calculateNumber(attributes.stride);
      const offset = calculateNumber(attributes.offset);
      const rows = calculateNumber(attributes.rows, 1);
      const enable = attributes.enable !== undefined ? calculateBoolean(attributes.enable) : undefined;
      const divisor = attributes.divisor !== undefined ? calculateNumber(attributes.divisor) : undefined;

      results.push((context) => {
          const bufferInfo = getBufferAttribute(loc.valueOf(context));
          const sizeValue = size.valueOf(context);
          const rowsValue = rows.valueOf(context);
          const offsetValue = offset.valueOf(context);
          const normalizedValue = normalized.valueOf(context);
          const strideValue = stride.valueOf(context);
          const divisorValue = divisor?.valueOf(context);
          const enableValue = enable?.valueOf(context);

          const sizeMul = sizeValue * byteSize;
          for (let i = 0; i < rowsValue; i++) {
            const finalOffset = offsetValue + i * sizeMul;
            const finalLocation = bufferInfo.location + i + locationOffset;
            gl?.vertexAttribPointer(finalLocation, sizeValue, glType, normalizedValue, strideValue, finalOffset);
            if (divisorValue !== undefined) {
              gl?.vertexAttribDivisor(finalLocation, divisorValue);
            }
            if (enableValue !== undefined) {
              gl?.enableVertexAttribArray(finalLocation);
              context.cleanupActions?.push(() => {
                gl?.disableVertexAttribArray(finalLocation);
            });
            }
          }
      });
    }, [resolveLocation, getGlType, getByteSize, getBufferAttribute, gl]);

    const convertUniform = useCallback<Convertor<GlAction>>(({ uniform }, results) => {
      if (!uniform) {
        return;
      }
      const location = calculateString(uniform.location);
      if (uniform?.int !== undefined) {
        const value = calculateNumber(uniform.int);
        results.push((context) => gl?.uniform1i(getUniformLocation(location.valueOf(context)) ?? null, value.valueOf(context)));    
      } else if (uniform?.float !== undefined) {
        const value = calculateNumber(uniform.float);
        results.push((context) => gl?.uniform1f(getUniformLocation(location.valueOf(context)) ?? null, value.valueOf(context)));
      }
    }, [getUniformLocation, gl]);

    const convertClear = useCallback<Convertor<GlAction>>(({ clear }, results) => {
      if (!clear) {
        return;
      }
      if (typeof clear !== "object" || clear.hasOwnProperty("formula")) {
        const clearField = clear as Formula;
        const clearResolution = calculateNumber(clearField);
        results.push((context) => {
          const bitValue = clearResolution.valueOf(context);
          if (bitValue) {
            gl?.clear(bitValue);
          }
        });
        return;
      }
      const clearField = clear as {
        color?: BooleanResolution;
        depth?: BooleanResolution;
        stencil?: BooleanResolution;  
      };
      const color = calculateBoolean(clearField.color);
      const depth = calculateBoolean(clearField.depth);
      const stencil = calculateBoolean(clearField.stencil);
      results.push((context) => {
        let bitValue = 0;
        if (color.valueOf(context)) {
          bitValue |= WebGL2RenderingContext.COLOR_BUFFER_BIT;
        }
        if (depth.valueOf(context)) {
          bitValue |= WebGL2RenderingContext.DEPTH_BUFFER_BIT;
        }
        if (stencil.valueOf(context)) {
          bitValue |= WebGL2RenderingContext.STENCIL_BUFFER_BIT;
        }    
        if (bitValue) {
            gl?.clear(bitValue);
        }  
      });
    }, [gl]);

    const convertActivateProgram = useCallback<Convertor<GlAction>>(({ activateProgram }, results) => {
      if (!activateProgram) {
        return;
      }
      const id = calculateString(activateProgram);
      results.push((context) => setActiveProgram(id.valueOf(context)));
    }, [setActiveProgram]);

    const convertLoadTexture = useCallback<Convertor<GlAction>>(({ loadTexture }, results) => {
      if (!loadTexture) {
        return;
      }
      const imageId = calculateString<ImageId>(loadTexture.imageId);
      const textureId = loadTexture.textureId;
      results.push((context) => executeLoadTextureAction(imageId.valueOf(context), textureId));
    }, [executeLoadTextureAction]);

    const convertVideo = useCallback<Convertor<GlAction>>(({ video }, results) => {
      if (!video) {
        return;
      }
      const src = calculateString<Url>(video.src);
      const imageId = calculateString<ImageId>(video.imageId);
      const volume = video.volume === undefined ? undefined : calculateNumber(video.volume);
      results.push((context) => loadVideo(src.valueOf(context), imageId.valueOf(context), volume?.valueOf(context)));
    }, [loadVideo]);

    const convertImage = useCallback<Convertor<GlAction>>(({ image }, results, getSteps, external, actionConverionMap) => {
      if (!image) {
        return;
      }
      const src = calculateString<Url>(image.src);
      const imageId = calculateString<ImageId>(image.imageId);

      const onLoadSteps: ExecutionStep[] = [];
      image.onLoad?.forEach(action => convertAction(action, onLoadSteps, getSteps, external, actionConverionMap));
      const onLoadParameters:ExecutionParameters = {};
      const onLoad = onLoadSteps.length ? (context?: Context) => { 
        execute(onLoadSteps, onLoadParameters, context);
        for (let i in onLoadParameters) {
          delete onLoadParameters[i];
        }
      } : undefined;

      results.push((context, parameters) => {
        for (let i in parameters) {
          onLoadParameters[i] = parameters[i];
        }
        loadImage(src.valueOf(context), imageId.valueOf(context), onLoad, context);
      });
    }, [loadImage]);

    const convertCustom = useCallback<Convertor<CustomAction>>((customAction, results) => {
      if (customAction.action !== "custom") {
        return;
      }
      results.push((_, parameters) => {
        const time = typeof(parameters.time) === "number" ? parameters.time : 0;
        executeCustomAction(customAction,  time);
      });
    }, [executeCustomAction]);

    const getScriptProcessor = useCallback(<T>(scripts: Script<T>[]) => {
      return new ScriptProcessor(scripts, undefined, [
        ...DEFAULT_CONVERTORS,
        convertClear,
        convertBufferData,
        convertBufferSubData,
        convertVertexArray,
        convertVertexAttribPointer,
        convertUniform,
        convertActivateProgram,
        convertLoadTexture,
        convertVideo,
        convertImage,
        convertCustom,
        convertDrawArrays,
      ]);
    }, [convertClear, convertBufferData, convertBufferSubData, convertVertexArray, convertVertexAttribPointer, convertUniform, convertActivateProgram, convertLoadTexture, convertVideo, convertImage, convertCustom, convertDrawArrays]);

    return {
      getScriptProcessor,
    };
}

