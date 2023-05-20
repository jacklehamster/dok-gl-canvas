import { useCallback } from "react";
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

export function useStorage() {
    const store = useCallback((context: Context, storage: Record<string, string | number | TypedArray>) => {
        context.storage.push(storage);
    }, []);

    const popStorage = useCallback((context: Context) => {
        context.storage.pop();
    }, []);

    return {
        store,
        popStorage,
    };
}