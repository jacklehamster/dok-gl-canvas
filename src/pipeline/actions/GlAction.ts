import { BufferAttributeAction, BufferSubDataAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawArraysAction, DrawArraysInstancedAction } from "./draw-vertex-action";
import { UniformAction, UniformTimerAction } from "./UniformAction";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
import { ImageAction, TextureAction, VideoAction } from "./use-image-action";
import { ActiveProgramAction } from "./use-program-action";
import { ExecuteScriptAction } from "./ExecuteScriptAction";

export type DokGlAction = 
| BindVertexAction
| BufferAttributeAction
| BufferSubDataAction
| BindVertexAction
| ClearAction
| DrawArraysAction
| DrawArraysInstancedAction
| UniformTimerAction
| UniformAction
| ActiveProgramAction
| CustomAction
| ExecuteScriptAction
| ImageAction
| TextureAction
| VideoAction;

export type GlAction = string | DokGlAction;
