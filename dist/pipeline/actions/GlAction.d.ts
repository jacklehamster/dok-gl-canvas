import { BufferAttributeAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawArraysAction, DrawArraysInstancedAction } from "./draw-vertex-action";
import { UniformAction, UniformTimerAction } from "./UniformAction";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
import { ImageAction, TextureAction, VideoAction } from "./use-image-action";
import { ActiveProgramAction } from "./use-program-action";
import { Context } from "../use-action-pipeline";
import { ExecuteScriptAction } from "./ExecuteScriptAction";
export interface GlExecuteAction {
    execute?(action: GlAction, time: number, context: Context): void;
}
export declare type DokGlAction = BufferAttributeAction | BindVertexAction | ClearAction | DrawArraysAction | DrawArraysInstancedAction | UniformTimerAction | UniformAction | ActiveProgramAction | CustomAction | ExecuteScriptAction | ImageAction | TextureAction | VideoAction;
export declare type GlAction = string | GlExecuteAction & DokGlAction;
