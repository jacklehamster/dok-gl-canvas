import { Resolution } from "../data/data-provider";
import { Context } from "../use-action-pipeline";
import { TypedArray } from "./use-buffer-attributes";
export interface StoreContextAction {
    action: "store-context";
    context: Record<string, Resolution>;
}
export interface PopContextAction {
    action: "pop-context";
}
export declare function useStorage(): {
    store: (context: Context, storage: Record<string, string | number | TypedArray>) => void;
    popStorage: (context: Context) => void;
};
