"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ApiError } from "@/services/api";


interface UseApiState<T> {
    data: T | null;
    error: ApiError | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
}

interface UseApiReturn<T, TArgs extends unknown[]> extends UseApiState<T> {
    execute: (...args: TArgs) => Promise<T | null>;
    reset: () => void;
    setData: (data: T | null) => void;
}

interface UseApiOptions<T> {
    immediate?: boolean;
    initialData?: T | null;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    onSettled?: () => void;
}

// ─── Initial State ──────────────────────────────────────

const initialState: UseApiState<null> = {
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
};

export function useApi<T, TArgs extends unknown[]>(
    apiFn: (...args: TArgs) => Promise<T>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T, TArgs> {
    const { immediate = false, initialData = null, onSuccess, onError, onSettled } = options;

    const [state, setState] = useState<UseApiState<T>>({
        ...initialState,
        data: initialData,
    } as UseApiState<T>);

    // Track if component is still mounted
    const mountedRef = useRef(true);
    // Store latest callbacks without re-renders
    const callbacksRef = useRef({ onSuccess, onError, onSettled });
    callbacksRef.current = { onSuccess, onError, onSettled };

    const execute = useCallback(
        async (...args: TArgs): Promise<T | null> => {
            setState((prev) => ({
                ...prev,
                isLoading: true,
                isError: false,
                error: null,
            }));

            try {
                const data = await apiFn(...args);

                if (mountedRef.current) {
                    setState({
                        data,
                        error: null,
                        isLoading: false,
                        isSuccess: true,
                        isError: false,
                    });
                    callbacksRef.current.onSuccess?.(data);
                }

                return data;
            } catch (err) {
                const apiError =
                    err instanceof ApiError
                        ? err
                        : new ApiError({
                              message: err instanceof Error ? err.message : "Unknown error",
                              status: 0,
                          });

                if (mountedRef.current) {
                    setState({
                        data: null,
                        error: apiError,
                        isLoading: false,
                        isSuccess: false,
                        isError: true,
                    });
                    callbacksRef.current.onError?.(apiError);
                }

                return null;
            } finally {
                callbacksRef.current.onSettled?.();
            }
        },
        [apiFn]
    );

    const reset = useCallback(() => {
        setState({ ...initialState, data: initialData } as UseApiState<T>);
    }, [initialData]);

    const setData = useCallback((data: T | null) => {
        setState((prev) => ({ ...prev, data }));
    }, []);

    // Execute on mount if immediate
    useEffect(() => {
        if (immediate) {
            execute(...([] as unknown as TArgs));
        }
    }, [immediate, execute]);

    // Track mounted state
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return { ...state, execute, reset, setData };
}
