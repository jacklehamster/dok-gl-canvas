import { BooleanResolution, Convertor, DEFAULT_EXTERNALS, getDefaultConvertors, ExecutionParameters, ExecutionStep, Formula, Script, ScriptProcessor, calculateBoolean, calculateNumber, calculateString, calculateTypedArray, convertAction, execute, ConvertBehavior } from "dok-actions";
import { useCallback, useEffect, useRef } from "react";
import useBufferAttributes, { BufferInfo } from "../../pipeline/actions/use-buffer-attributes";
import { clearRecord } from "../../utils/object-utils";
import { useTypes } from "./types";
import useImageAction, { ImageId, Url } from "../../pipeline/actions/use-image-action";
import { GlAction, LocationName, LocationResolution, getGlType, getByteSize } from "dok-gl-actions";
import { GlBufferTarget, GlDepthFunction, GlUsage, ValueOf } from "dok-gl-actions/dist/types";
import { calculateTypeArrayConstructor } from "dok-gl-actions";
import { ProgramId } from "dok-gl-actions/dist/program/program";
import { mat4, quat, vec3 } from "gl-matrix";
import { useDraw } from "../draw/use-draw";

const MATRIX_SIZE = 16;

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

    const { bindVertexArray, getBufferAttribute, bufferData, bufferSubData } = useBufferAttributes({ gl, getAttributeLocation });
    const { drawArrays, drawElements } = useDraw({ gl });
    const { getGlUsage, getBufferTarget } = useTypes();
    const { executeLoadTextureAction, loadVideo, loadImage, hasImageId } = useImageAction({ gl });

    /**
     * Local callbacks
     */
    const getBufferInfo = useCallback((location: string): BufferInfo => {
        return getBufferAttribute(location, true);
    }, [getBufferAttribute]);

    const lastBoundBuffer = useRef<BufferInfo>();
    const bindBuffer = useCallback((target: GLenum, bufferInfo: BufferInfo) => {
      if (lastBoundBuffer.current !== bufferInfo) {
        lastBoundBuffer.current = bufferInfo;
        gl?.bindBuffer(target, bufferInfo.buffer);
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
        const target = buffer.target ? getBufferTarget(calculateString<GlBufferTarget>(buffer.target)) : undefined;
        const data = buffer.buffer ? calculateTypedArray(buffer.buffer, calculateTypeArrayConstructor(buffer.glType)) : undefined;
        const length = calculateNumber(buffer.length);
        const glUsage = buffer.usage ? getGlUsage(calculateString<GlUsage>(buffer.usage)) : undefined;

        results.push((parameters) => {
          const locationValue = location.valueOf(parameters);
          const bufferInfo = getBufferInfo(locationValue);
          const targetValue = target?.valueOf(parameters) ?? bufferInfo.target ?? WebGL2RenderingContext.ARRAY_BUFFER;
          const usageValue = glUsage?.valueOf(parameters) ?? bufferInfo.usage ?? WebGL2RenderingContext.STATIC_DRAW;
          bindBuffer(targetValue, bufferInfo);

          const dataToBuffer = data?.valueOf(parameters);
          const bufferSize = dataToBuffer ? dataToBuffer.length : length?.valueOf(parameters);

          if (bufferSize) {
            bufferData(targetValue, locationValue, dataToBuffer, bufferSize, usageValue);
          }
        });
    }, [gl, getBufferTarget, getBufferInfo, bindBuffer, getGlUsage, bufferData]);

    const convertBufferSubData = useCallback<Convertor<GlAction>>(async ({bufferSubData: buffer}, results) => {
      if (!buffer?.data) {
        return;
      }

      const target = buffer.target ? getBufferTarget(calculateString<GlBufferTarget>(buffer.target)) : undefined;
      const data = calculateTypedArray(buffer.data, calculateTypeArrayConstructor(buffer.glType));
      const dstByteOffset = calculateNumber(buffer.dstByteOffset);
      const srcOffset = calculateNumber(buffer.srcOffset);
      const length = calculateNumber(bufferSubData.length);
      const location = buffer.location !== undefined ? calculateString(buffer.location) : undefined;

      results.push((parameters) => {
        const bufferInfo = location ? getBufferInfo(location.valueOf(parameters)) : undefined;         
        const targetValue = target?.valueOf(parameters) ?? bufferInfo?.target ?? WebGL2RenderingContext.ARRAY_BUFFER;
        if (bufferInfo !== undefined) {
          bindBuffer(targetValue, bufferInfo);
        }
        const bufferArray = data.valueOf(parameters);
        if (bufferArray) {
          bufferSubData(targetValue, bufferArray, dstByteOffset.valueOf(parameters), srcOffset.valueOf(parameters), length.valueOf(parameters) || bufferArray.length);
        }
      });
    }, [bufferSubData, getBufferInfo, bindBuffer, getBufferTarget]);

    const convertVertexArray = useCallback<Convertor<GlAction>>(async ({ bindVertexArray: bind }, results) => {
      if (!bind) {
        return;
      }
      results.push((_, context) => {
        const cleanup = bindVertexArray();
        context.addCleanup(cleanup);
      });
    }, [bindVertexArray]);

    const convertBindBuffer = useCallback<Convertor<GlAction>>(async ({ bindBuffer: bind }, results) => {
      if (!bind) {
        return;
      }
      const target = bind.target ? getBufferTarget(calculateString<GlBufferTarget>(bind.target)) : undefined;
      const location = calculateString(bind.location);

      results.push(parameters => {
        const locationValue = location.valueOf(parameters);
        const targetValue = target?.valueOf(parameters) ?? getBufferInfo(locationValue)?.target ?? WebGL2RenderingContext.ARRAY_BUFFER;
        bindBuffer(targetValue, getBufferInfo(locationValue));
      });
    }, [bindBuffer, getBufferInfo, getBufferTarget]);
    
    const convertDrawArrays = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.drawArrays) {
        return;
      }
      const { vertexFirst, vertexCount, instanceCount } = action.drawArrays;
      const first = calculateNumber(vertexFirst, 0);
      const count = calculateNumber(vertexCount, 0);
      const instances = instanceCount !== undefined ? calculateNumber(instanceCount) : undefined;
      results.push((parameters) => {
        drawArrays(WebGL2RenderingContext.TRIANGLES, first.valueOf(parameters), count.valueOf(parameters), instances?.valueOf(parameters));
      });
    }, [drawArrays]);

    const convertDrawElements = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.drawElements) {
        return;
      }
      const { count, glType, offset, instanceCount } = action.drawElements;
      const instances = instanceCount !== undefined ? calculateNumber(instanceCount) : undefined;
      const countValueOf = calculateNumber(count, 0);
      const glTypeValueOf = getGlType(glType);
      const offsetValueOf = calculateNumber(offset);
      results.push((parameters) => {
        drawElements(WebGL2RenderingContext.TRIANGLES,
          countValueOf.valueOf(parameters),
          glTypeValueOf.valueOf(parameters),
          offsetValueOf.valueOf(parameters),
          instances?.valueOf(parameters));
      });
    }, [drawElements]);

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
      
      const glType: ValueOf<GLenum> = getGlType(attributes.glType);
      const byteSize = getByteSize(attributes.glType);
      const normalized = calculateBoolean(attributes.normalized);
      const stride = calculateNumber(attributes.stride);
      const offset = calculateNumber(attributes.offset);
      const enable = attributes.enable !== undefined ? calculateBoolean(attributes.enable) : undefined;
      const divisor = attributes.divisor !== undefined ? calculateNumber(attributes.divisor) : undefined;

      results.push((parameters, context) => {
          const locationValue = loc.valueOf(parameters);
          const bufferInfo = getBufferInfo(locationValue);
          if (bufferInfo.location < 0) {
            throw new Error(`Invalid location to call vertexAttribPointer on: "${locationValue}"`);
          }
          const sizeValue = size.valueOf(parameters);
          const offsetValue = offset.valueOf(parameters);
          const normalizedValue = normalized.valueOf(parameters);
          const strideValue = stride.valueOf(parameters);
          const divisorValue = divisor?.valueOf(parameters);
          const enableValue = enable?.valueOf(parameters);

          const sizeMul = sizeValue * byteSize.valueOf(parameters);
          const locationOffsetValue = locationOffset.valueOf(parameters);
          const finalOffset = offsetValue + locationOffsetValue * sizeMul;
          const finalLocation = bufferInfo.location + locationOffsetValue;
          gl?.vertexAttribPointer(finalLocation, sizeValue, glType.valueOf(parameters), normalizedValue, strideValue, finalOffset);
          if (divisorValue !== undefined) {
            gl?.vertexAttribDivisor(finalLocation, divisorValue);
          }
          if (enableValue !== undefined) {
            gl?.enableVertexAttribArray(finalLocation);
            context.addCleanup(() => gl?.disableVertexAttribArray(finalLocation));
        }
      });
    }, [resolveLocation, getBufferInfo, gl]);

    const convertUniform = useCallback<Convertor<GlAction>>(async ({ uniform }, results) => {
      if (!uniform) {
        return;
      }
      const location = calculateString(uniform.location);
      if (uniform?.int !== undefined) {
        const value = calculateNumber(uniform.int);
        results.push((parameters) => gl?.uniform1i(getUniformLocation(location.valueOf(parameters)) ?? null, value.valueOf(parameters)));    
      }
      if (uniform?.float !== undefined) {
        const value = calculateNumber(uniform.float);
        results.push((parameters) => gl?.uniform1f(getUniformLocation(location.valueOf(parameters)) ?? null, value.valueOf(parameters)));
      }
      if (uniform?.buffer !== undefined) {
        const value = calculateTypedArray(uniform.buffer) as ValueOf<Float32Array>;
        results.push((parameters) => gl?.uniformMatrix4fv(getUniformLocation(location.valueOf(parameters)) ?? null, false, value.valueOf(parameters)));
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

    const convertVideo = useCallback<Convertor<GlAction>>(async ({ video }, results, utils) => {
      if (!video) {
        return;
      }
      const src = calculateString<Url>(video.src);
      const imageId = calculateString<ImageId>(video.imageId);
      const volume = video.volume === undefined ? undefined : calculateNumber(video.volume);
      const onLoad = utils.executeCallback?.onLoad;
      results.push((parameters, context) => {
        loadVideo(src.valueOf(parameters), imageId.valueOf(parameters), volume?.valueOf(parameters), () => onLoad?.(context));
      });
    }, [loadVideo]);

    const convertImage = useCallback<Convertor<GlAction>>(async ({ image }, results, utils) => {
      if (!image) {
        return;
      }
      const src = calculateString<Url>(image.src);
      const imageId = calculateString<ImageId>(image.imageId);

      const onLoad = utils.executeCallback?.onLoad;
      results.push((parameters, context) => {
        loadImage(src.valueOf(parameters), imageId.valueOf(parameters), () => {
          onLoad?.(context);
        });
      });
    }, [loadImage]);

    const initializeMatrix = useCallback((parameters: ExecutionParameters) => {
      const m = new Float32Array(MATRIX_SIZE);
      mat4.identity(m);
      parameters.matrix = m;
    }, []);

    const convertInitMatrix = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.initMatrix) {
        return;
      }
      results.push(initializeMatrix);
    }, [initializeMatrix]);

    const convertSpriteMatrixTransform = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.spriteMatrixTransform) {
        return;
      }
      const { translate, rotation, scale } = action.spriteMatrixTransform;
      const translateResolution = translate?.map(r => calculateNumber(r, 0)) ?? [0,0,0];
      const rotationResolution = rotation?.map(r => calculateNumber(r, 0)) ?? [0,0,0];
      const scaleResolution = scale?.map(r => calculateNumber(r, 1)) ?? [1,1,1];

      const quaternion = quat.create();
      const translationVec3 = vec3.create();
      const scaleVec3 = vec3.create();
      
      results.push((parameters) => {
        if (!parameters.matrix) {
          initializeMatrix(parameters);
        }
        const matrix = parameters.matrix as mat4;
        mat4.fromRotationTranslationScale(
          matrix,
          quat.fromEuler(quaternion,
            rotationResolution[0].valueOf(parameters),
            rotationResolution[1].valueOf(parameters),
            rotationResolution[2].valueOf(parameters)),
          vec3.set(translationVec3,
            translateResolution[0].valueOf(parameters),
            translateResolution[1].valueOf(parameters),
            translateResolution[2].valueOf(parameters)),
          vec3.set(scaleVec3,
            scaleResolution[0].valueOf(parameters),
            scaleResolution[1].valueOf(parameters),
            scaleResolution[2].valueOf(parameters)));
      });
    }, [initializeMatrix]);

    const convertMatrixBufferSubData = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.bufferSubDataMatrix) {
        return;
      }
      const { index } = action.bufferSubDataMatrix;
      const indexResolution = calculateNumber(index);
      results.push((parameters) => {
        if (!parameters.matrix) {
          initializeMatrix(parameters);
        }
        const matrix = parameters.matrix as Float32Array;
        const bytesPerInstance = MATRIX_SIZE * Float32Array.BYTES_PER_ELEMENT;
        const indexValue = indexResolution.valueOf(parameters);
        bufferSubData(WebGL2RenderingContext.ARRAY_BUFFER, matrix, indexValue * bytesPerInstance);
    });
    }, [initializeMatrix, bufferSubData]);

    const convertAttributesBufferUpdate = useCallback<Convertor<GlAction>>(async (action, results, utils, external, actionConversionMap) => {
      if (!action.updateAttributeBuffer) {
        return;
      }
      const { updateAttributeBuffer, ...subAction } = action;
      const target = updateAttributeBuffer.target ? getBufferTarget(calculateString<GlBufferTarget>(updateAttributeBuffer.target)) : undefined;
      const location = calculateString(updateAttributeBuffer.location);
            
      const subStepResults: ExecutionStep[] = [];
      await convertAction(subAction, subStepResults, utils, external, actionConversionMap);

      results.push((parameters, context) => {
        const locationValue = location.valueOf(parameters);
        const bufferInfo = getBufferInfo(locationValue);
        const targetValue = target?.valueOf(parameters) ?? bufferInfo.target ?? WebGL2RenderingContext.ARRAY_BUFFER;
        bindBuffer(targetValue, bufferInfo);

        const array = bufferInfo.bufferArray!;
        gl?.getBufferSubData(targetValue, 0, array);
        
        parameters.attributeBuffer = array;
        parameters.attributeBufferLength = array.length
        execute(subStepResults, parameters, context);
        gl?.bufferData(targetValue, array, bufferInfo.usage ?? gl.DYNAMIC_DRAW);
      });
      return ConvertBehavior.SKIP_REMAINING_CONVERTORS;
    }, [getBufferTarget, getBufferInfo, bindBuffer, gl]);

    const convertOrthographicProjection = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.orthogonalProjectionMatrixTransform) {
        return;
      }
      const { left, right, top, bottom, zFar, zNear } = action.orthogonalProjectionMatrixTransform;
      const leftValue = calculateNumber(left);
      const rightValue = calculateNumber(right);
      const topValue = calculateNumber(top);
      const bottomValue = calculateNumber(bottom);
      const zFarValue = calculateNumber(zFar, 5000);
      const zNearValue = calculateNumber(zNear, -100);
      results.push((parameters) => {
        if (!parameters.matrix) {
          initializeMatrix(parameters);
        }
        const matrix = parameters.matrix as Float32Array;
        mat4.ortho(
          matrix,
          leftValue.valueOf(parameters),
          rightValue.valueOf(parameters),
          topValue.valueOf(parameters),
          bottomValue.valueOf(parameters),
          zFarValue.valueOf(parameters),
          zNearValue.valueOf(parameters),
        );
    });
    }, [initializeMatrix]);

    const convertPerspectiveProjection = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.perspectiveProjectionMatrixTransform) {
        return;
      }
      const { viewAngle, zNear, zFar, aspect } = action.perspectiveProjectionMatrixTransform;
      const viewAngleValue = calculateNumber(viewAngle, 45);
      const zFarValue = calculateNumber(zFar, 5000);
      const zNearValue = calculateNumber(zNear, -100);
      const aspectValue = calculateNumber(aspect, 1);
      const DEG_TO_RADIANT = Math.PI / 90;
      results.push((parameters) => {
        if (!parameters.matrix) {
          initializeMatrix(parameters);
        }
        const matrix = parameters.matrix as Float32Array;
        mat4.perspective(matrix,
          viewAngleValue.valueOf(parameters) * DEG_TO_RADIANT,
          aspectValue.valueOf(parameters),
          zNearValue.valueOf(parameters),
          zFarValue.valueOf(parameters)
        );
      });
    }, [initializeMatrix]);

    const convertEnableDepth = useCallback<Convertor<GlAction>>(async (action, results) => {
      if (!action.enableDepth) {
        return;
      }
      const { enable, depthFunc } = action.enableDepth;
      const enableValue = calculateBoolean(enable, true);
      const depthFuncValue = calculateString<GlDepthFunction>(depthFunc);
      results.push((parameters) => {
        if (enableValue.valueOf(parameters)) {
          gl?.enable(WebGL2RenderingContext.DEPTH_TEST);  
        } else {
          gl?.disable(WebGL2RenderingContext.DEPTH_TEST);
        }
        const depthFunction = depthFuncValue.valueOf(parameters);
        if (depthFunction.length) {
          gl?.depthFunc(WebGL2RenderingContext[depthFunction as GlDepthFunction]);
        }

        gl?.enable(WebGL2RenderingContext.BLEND);
        gl?.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
      });
    }, [gl]);

    const getScriptProcessor = useCallback(<T>(scripts: Script<T>[]) => {
      return new ScriptProcessor(scripts, {
        ...DEFAULT_EXTERNALS,
        hasImageId,
        gl,
      }, { actionsConvertor: [
        convertAttributesBufferUpdate,
        ...getDefaultConvertors().actionsConvertor,
        convertEnableDepth,
        convertClear,
        convertInitMatrix,
        convertBindBuffer,
        convertBufferData,
        convertBufferSubData,
        convertVertexArray,
        convertVertexAttribPointer,
        convertActivateProgram,
        convertLoadTexture,
        convertVideo,
        convertImage,
        convertSpriteMatrixTransform,
        convertMatrixBufferSubData,
        convertOrthographicProjection,
        convertPerspectiveProjection,
        convertUniform,
        convertDrawArrays,
        convertDrawElements,
      ]});
    }, [hasImageId, gl, convertAttributesBufferUpdate, convertEnableDepth, convertClear, convertInitMatrix, convertBindBuffer, convertBufferData, convertBufferSubData, convertVertexArray, convertVertexAttribPointer, convertActivateProgram, convertLoadTexture, convertVideo, convertImage, convertSpriteMatrixTransform, convertMatrixBufferSubData, convertOrthographicProjection, convertPerspectiveProjection, convertUniform, convertDrawArrays, convertDrawElements]);

    return {
      getScriptProcessor,
    };
}

