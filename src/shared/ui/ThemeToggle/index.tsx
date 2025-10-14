import useThemeStore from '@/stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';
import { FC } from 'react';

export const ThemeToggle: FC = () => {
    const theme = useThemeStore((state) => state.theme);
    const { toggle } = useThemeStore().actions;

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition cursor-pointer"
            title="Сменить тему"
        >
            {theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
            ) : (
                <Moon className="w-5 h-5 text-gray-950" />
            )}
        </button>
    );
};
