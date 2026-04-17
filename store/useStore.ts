import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GlobalState {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    setTheme: (theme: GlobalState['theme']) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useStore = create<GlobalState>()(
    persist(
        (set) => ({
            theme: 'system',
            sidebarOpen: false,
            setTheme: (theme) => set({ theme }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
