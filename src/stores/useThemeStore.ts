import { create } from 'zustand';

type TTheme = 'light' | 'dark';

type TThemeActions = {
    toggle: () => void;
    setTheme: (theme: TTheme) => void;
};

interface IThemeState {
    theme: TTheme;
    actions: TThemeActions;
}

const useThemeStore = create<IThemeState>((set, get) => ({
    theme: (localStorage.getItem('theme') as TTheme) || 'light',

    actions: {
        toggle: () => {
            const newTheme = get().theme === 'light' ? 'dark' : 'light';
            get().actions.setTheme(newTheme);
        },

        setTheme: (theme) => {
            localStorage.setItem('theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
            set({ theme });
        },
    },
}));

export default useThemeStore;
