import { BooleanResolution, Context, Convertor, DEFAULT_EXTERNALS, getDefaultConvertors, ExecutionParameters, ExecutionStep, Formula, Script, ScriptProcessor, calculateBoolean, calculateNumber, calculateString, calculateTypedArray, convertAction, execute, ConvertBehavior, newParams, recycleParams } from "dok-actions";
import { useCallback, useEffect, useRef } from "react";
import useBufferAttributes, { BufferInfo } from "../../pipeline/actions/use-buffer-attributes";
import { clearRecord } from "../../utils/object-utils";
import { useTypes } from "./types";
import useImageAction, { ImageId, Url } from "../../pipeline/actions/use-image-action";
import { GlAction, LocationName, LocationResolution } from "dok-gl-actions";
import { GlUsage, ValueOf } from "dok-gl-actions/dist/types";
import { ProgramId } from "dok-gl-actions/dist/program/program";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    activateProgram(programId?: ProgramId): boolean;
}

interface State {
    getScriptProcessor<T>(scripts: Script<T>[]): ScriptProcessor<T>;
}

export function useGlAction({ gl, getAttributeLocation, getUniformLocation, activateProgram }: Props): State {
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
    const { executeLoadTextureAction, loadVideo, loadImage, hasImageId } = useImageAction({ gl });

    /**
     * Local callbacks
     */
    const getBufferInfo = useCallback((location: string): BufferInfo => {
        return getBufferAttribute(location, true);
    }, [getBufferAttribute]);

    const lastBoundBuffer = useRef<BufferInfo>();
    const bindBuffer = useCallback((bufferInfo: BufferInfo) => {
      if (lastBoundBuffer.current !== bufferInfo) {
        lastBoundBuffer.current = bufferInfo;
        gl?.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
      }
    }, [gl, lastBoundBuffer]);

    /**
     * Conversion functions
     */
    const convertBufferData = useCallback<Convertor<GlAction>>(async ({bufferData: buffer}: GlAction, results) => {
        if (!buffer || !gl) {
          return;
        }
        const location = calculateString(buffer.location);
        const TypeArrayConstructor = getTypedArray(buffer.glType);
        const data = buffer.buffer ? calculateTypedArray(buffer.buffer, TypeArrayConstructor) : undefined;
        const length = calculateNumber(buffer.length);
        const usage = calculateString<GlUsage>(buffer.usage, "STATIC_DRAW");

        results.push((parameters) => {
          const locationValue = location.valueOf(parameters);
          const bufferInfo = getBufferInfo(locationValue);          
          bindBuffer(bufferInfo);

          const dataToBuffer = data?.valueOf(parameters);
          const bufferSize = dataToBuffer ? dataToBuffer.length : length?.valueOf(parameters);
          const glUsage = getGlUsage(usage?.valueOf(parameters));

          if (bufferSize) {
            bufferData(locationValue, dataToBuffer, bufferSize, glUsage);
          }
        });
    }, [gl, getTypedArray, getBufferInfo, bindBuffer, getGlUsage, bufferData]);

    const convertBufferSubData = useCallback<Convertor<GlAction>>(async ({bufferSubData}, results) => {
      if (!bufferSubData?.data) {
        return;
      }

      const TypeArrayConstructor = getTypedArray(bufferSubData.glType);
      const data = calculateTypedArray(bufferSubData.data, TypeArrayConstructor);
      const dstByteOffset = calculateNumber(bufferSubData.dstByteOffset);
      const srcOffset = calculateNumber(bufferSubData.srcOffset);
      const length = calculateNumber(bufferSubData.length);
      const location = bufferSubData.location !== undefined ? calculateString(bufferSubData.location) : undefined;

      results.push((parameters) => {
        if (location !== undefined) {
          const bufferInfo = getBufferInfo(location.valueOf(parameters));         
          bindBuffer(bufferInfo);
        }
        const bufferArray = data.valueOf(parameters);
        if (bufferArray) {
          gl?.bufferSubData(gl.ARRAY_BUFFER, dstByteOffset.valueOf(parameters), bufferArray, srcOffset.valueOf(parameters), length.valueOf(parameters) || bufferArray.length);
        }
      });
    }, [getBufferInfo, getTypedArray, gl, bindBuffer]);

    const convertVertexArray = useCallback<Convertor<GlAction>>(async ({ bindVertexArray: bind }, results) => {
      if (!bind) {
        return;
      }
      results.push((_, context) => {
        const cleanup = bindVertexArray();
        context.cleanupActions?.push(cleanup);
      });
    }, [bindVertexArray]);

    const convertBindBuffer = useCallback<Convertor<GlAction>>(async ({ bindBuffer: bind }, results) => {
      if (!bind) {
        return;
      }
      const bindLocation = calculateString(bind);

      results.push(parameters => bindBuffer(getBufferInfo(bindLocation.valueOf(parameters))));
    }, [bindBuffer, getBufferInfo]);
    
    const convertDrawArrays = useCallback<Convertor<GlAction>>(async ({drawArrays}, results) => {
      if (!drawArrays) {
        return;
      }
      const { vertexFirst, vertexCount, instanceCount } = drawArrays;
      const first = calculateNumber(vertexFirst);
      const count = calculateNumber(vertexCount);
      const instances = instanceCount !== undefined ? calculateNumber(instanceCount) : undefined;

      if (instances !== undefined) {
        results.push((parameters) => gl?.drawArraysInstanced(gl.TRIANGLES, first?.valueOf(parameters), count.valueOf(parameters), instances.valueOf(parameters)));
      } else {
        results.push((parameters) => gl?.drawArrays(gl.TRIANGLES, first.valueOf(parameters), count.valueOf(parameters)));
      }
    }, [gl]);

    const resolveLocation = useCallback((location: LocationResolution): [ ValueOf<string>, ValueOf<0|1|2|3|number> ] => {
        if (Array.isArray(location)) {
            return [calculateString(location[0]), calculateNumber(location[1])];
        }
        return [calculateString(location), 0];
    }, []);

    const convertVertexAttribPointer = useCallback<Convertor<GlAction>>(async ({vertexAttribPointer: attributes}, results) => {
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
      const enable = attributes.enable !== undefined ? calculateBoolean(attributes.enable) : undefined;
      const divisor = attributes.divisor !== undefined ? calculateNumber(attributes.divisor) : undefined;

      results.push((parameters, context) => {
          const bufferInfo = getBufferInfo(loc.valueOf(parameters));
          const sizeValue = size.valueOf(parameters);
          const offsetValue = offset.valueOf(parameters);
          const normalizedValue = normalized.valueOf(parameters);
          const strideValue = stride.valueOf(parameters);
          const divisorValue = divisor?.valueOf(parameters);
          const enableValue = enable?.valueOf(parameters);

          const sizeMul = sizeValue * byteSize;
          const finalOffset = offsetValue + locationOffset.valueOf(parameters) * sizeMul;
          const finalLocation = bufferInfo.location + locationOffset.valueOf(parameters);
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
      });
    }, [resolveLocation, getGlType, getByteSize, getBufferInfo, gl]);

    const convertUniform = useCallback<Convertor<GlAction>>(async ({ uniform }, results) => {
      if (!uniform) {
        return;
      }
      const location = calculateString(uniform.location);
      if (uniform?.int !== undefined) {
        const value = calculateNumber(uniform.int);
        results.push((parameters) => gl?.uniform1i(getUniformLocation(location.valueOf(parameters)) ?? null, value.valueOf(parameters)));    
      } else if (uniform?.float !== undefined) {
        const value = calculateNumber(uniform.float);
        results.push((parameters) => gl?.uniform1f(getUniformLocation(location.valueOf(parameters)) ?? null, value.valueOf(parameters)));
      }
    }, [getUniformLocation, gl]);

    const convertClear = useCallback<Convertor<GlAction>>(async ({ clear }, results) => {
      if (!clear) {
        return;
      }
      if (typeof clear !== "object" || clear.hasOwnProperty("formula")) {
        const clearField = clear as Formula;
        const clearResolution = calculateNumber(clearField);
        results.push((parameters) => {
          const bitValue = clearResolution.valueOf(parameters);
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
      results.push((parameters) => {
        let bitValue = 0;
        if (color.valueOf(parameters)) {
          bitValue |= WebGL2RenderingContext.COLOR_BUFFER_BIT;
        }
        if (depth.valueOf(parameters)) {
          bitValue |= WebGL2RenderingContext.DEPTH_BUFFER_BIT;
        }
        if (stencil.valueOf(parameters)) {
          bitValue |= WebGL2RenderingContext.STENCIL_BUFFER_BIT;
        }    
        if (bitValue) {
            gl?.clear(bitValue);
        }  
      });
    }, [gl]);

    const convertActivateProgram = useCallback<Convertor<GlAction>>(async ({ activateProgram: activateProgramProp }, results) => {
      if (!activateProgramProp) {
        return;
      }
      const id = calculateString(activateProgramProp);
      results.push((parameters) => activateProgram(id.valueOf(parameters)));
    }, [activateProgram]);

    const convertLoadTexture = useCallback<Convertor<GlAction>>(async ({ loadTexture }, results) => {
      if (!loadTexture) {
        return;
      }
      const imageId = calculateString<ImageId>(loadTexture.imageId);
      const textureId = loadTexture.textureId;
      results.push((parameters) => executeLoadTextureAction(imageId.valueOf(parameters), textureId));
    }, [executeLoadTextureAction]);

    const convertVideo = useCallback<Convertor<GlAction>>(async ({ video }, results) => {
      if (!video) {
        return;
      }
      const src = calculateString<Url>(video.src);
      const imageId = calculateString<ImageId>(video.imageId);
      const volume = video.volume === undefined ? undefined : calculateNumber(video.volume);
      results.push((parameters) => loadVideo(src.valueOf(parameters), imageId.valueOf(parameters), volume?.valueOf(parameters)));
    }, [loadVideo]);

    const convertImage = useCallback<Convertor<GlAction>>(async ({ image }, results, utils, external, actionConversionMap) => {
      if (!image) {
        return;
      }
      const src = calculateString<Url>(image.src);
      const imageId = calculateString<ImageId>(image.imageId);

      const onLoadSteps: ExecutionStep[] = [];
      for (let action of image.onLoad ?? []) {
        await convertAction(action, onLoadSteps, utils, external, actionConversionMap);
      }
      let onLoadParameters:ExecutionParameters | undefined;
      const onLoad = onLoadSteps.length ? (context?: Context) => { 
        execute(onLoadSteps, onLoadParameters, context);
        for (let i in onLoadParameters) {
          delete onLoadParameters[i];
        }
        if (onLoadParameters) {
          context?.objectPool?.push(onLoadParameters);
          onLoadParameters = undefined;  
        }
      } : undefined;

      results.push((parameters, context) => {
        if (onLoad) {
          onLoadParameters = context?.objectPool?.pop() ?? {};
          for (let i in parameters) {
            onLoadParameters[i] = parameters[i];
          }  
        }
        loadImage(src.valueOf(parameters), imageId.valueOf(parameters), onLoad, context);
      });
    }, [loadImage]);

    const convertAttributesBufferUpdate = useCallback<Convertor<GlAction>>(async (action, results, utils, external, actionConversionMap) => {
      if (!action.updateAttributeBuffer) {
        return;
      }
      const { updateAttributeBuffer, ...subAction } = action;
      const location = calculateString(updateAttributeBuffer);
            
      const subStepResults: ExecutionStep[] = [];
      await convertAction(subAction, subStepResults, utils, external, actionConversionMap);

      results.push((parameters, context) => {
        const locationValue = location.valueOf(parameters);
        const bufferInfo = getBufferInfo(locationValue);
        bindBuffer(bufferInfo);

        const array = bufferInfo.bufferArray!;
        gl?.getBufferSubData(gl.ARRAY_BUFFER, 0, array);
        
        const paramValues: ExecutionParameters = newParams(parameters, context);
        paramValues.attributeBuffer = array;
        paramValues.attributeBufferLength = array.length;
        execute(subStepResults, paramValues, context);
        recycleParams(paramValues, context);

        gl?.bufferData(gl.ARRAY_BUFFER, array, bufferInfo.usage ?? gl.DYNAMIC_DRAW);
      });
      return ConvertBehavior.SKIP_REMAINING_CONVERTORS;
    }, [getBufferInfo, gl, bindBuffer]);

    const getScriptProcessor = useCallback(<T>(scripts: Script<T>[]) => {
      return new ScriptProcessor(scripts, {
        ...DEFAULT_EXTERNALS,
        hasImageId,
        Math,
      }, [
        convertAttributesBufferUpdate,
        ...getDefaultConvertors(),
        convertClear,
        convertBindBuffer,
        convertBufferData,
        convertBufferSubData,
        convertVertexArray,
        convertVertexAttribPointer,
        convertUniform,
        convertActivateProgram,
        convertLoadTexture,
        convertVideo,
        convertImage,
        convertDrawArrays,
      ]);
    }, [hasImageId, convertAttributesBufferUpdate, convertClear, convertBindBuffer, convertBufferData, convertBufferSubData, convertVertexArray, convertVertexAttribPointer, convertUniform, convertActivateProgram, convertLoadTexture, convertVideo, convertImage, convertDrawArrays]);

    return {
      getScriptProcessor,
    };
}

