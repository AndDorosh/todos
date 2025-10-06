import useThemeStore from '@/stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
    const theme = useThemeStore((state) => state.theme);
    const { toggle } = useThemeStore().actions;

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition"
            title="Сменить тему"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
            )}
        </button>
    );
};
