"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ApiError } from "@/services/api";

interface UseFetchState<T> {
    data: T | null;
    error: ApiError | null;
    isLoading: boolean;
    isRefetching: boolean;
    isSuccess: boolean;
    isError: boolean;
}

interface UseFetchOptions<T> {
    enabled?: boolean;
    initialData?: T | null;
    pollingInterval?: number;
    deps?: unknown[];
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
    refetch: () => Promise<void>;
    mutate: (data: T | null | ((prev: T | null) => T | null)) => void;
}
export function useFetch<T>(
    fetcher: () => Promise<T>,
    options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
    const {
        enabled = true,
        initialData = null,
        pollingInterval = 0,
        deps = [],
        onSuccess,
        onError,
    } = options;

    const [state, setState] = useState<UseFetchState<T>>({
        data: initialData,
        error: null,
        isLoading: enabled,
        isRefetching: false,
        isSuccess: false,
        isError: false,
    });

    const mountedRef = useRef(true);
    const fetcherRef = useRef(fetcher);
    const callbacksRef = useRef({ onSuccess, onError });
    fetcherRef.current = fetcher;
    callbacksRef.current = { onSuccess, onError };

    const fetchData = useCallback(async (isRefetch = false) => {
        if (!mountedRef.current) return;

        setState((prev) => ({
            ...prev,
            isLoading: !isRefetch,
            isRefetching: isRefetch,
            isError: false,
            error: null,
        }));

        try {
            const data = await fetcherRef.current();

            if (mountedRef.current) {
                setState({
                    data,
                    error: null,
                    isLoading: false,
                    isRefetching: false,
                    isSuccess: true,
                    isError: false,
                });
                callbacksRef.current.onSuccess?.(data);
            }
        } catch (err) {
            const apiError =
                err instanceof ApiError
                    ? err
                    : new ApiError({
                          message: err instanceof Error ? err.message : "Fetch failed",
                          status: 0,
                      });

            if (mountedRef.current) {
                setState((prev) => ({
                    ...prev,
                    error: apiError,
                    isLoading: false,
                    isRefetching: false,
                    isSuccess: false,
                    isError: true,
                }));
                callbacksRef.current.onError?.(apiError);
            }
        }
    }, []);

    const refetch = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    const mutate = useCallback(
        (updater: T | null | ((prev: T | null) => T | null)) => {
            setState((prev) => ({
                ...prev,
                data: typeof updater === "function"
                    ? (updater as (prev: T | null) => T | null)(prev.data)
                    : updater,
            }));
        },
        []
    );

    // Fetch on mount and when deps change
    useEffect(() => {
        if (enabled) {
            fetchData(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, fetchData, ...deps]);

    // Polling
    useEffect(() => {
        if (!enabled || pollingInterval <= 0) return;

        const intervalId = setInterval(() => {
            fetchData(true);
        }, pollingInterval);

        return () => clearInterval(intervalId);
    }, [enabled, pollingInterval, fetchData]);

    // Track mount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return { ...state, refetch, mutate };
}
