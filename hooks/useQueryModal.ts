'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryModal(key: string, value: string = 'true') {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get(key) === value;

    const open = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [key, value, pathname, router, searchParams]);

    const close = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [key, pathname, router, searchParams]);

    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, close, open]);

    return {
        isOpen,
        open,
        close,
        toggle,
    };
}
