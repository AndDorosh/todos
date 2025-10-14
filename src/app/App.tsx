import useAuthStore from '@/stores/useAuthStore';
import { useEffect } from 'react';
import AppRouter from './router';
import useThemeStore from '@/stores/useThemeStore';
import clsx from 'clsx';
import bgDarkImage from '@/images/webb-dark.png';
import bgWhiteImage from '@/images/webb-white.png';

const App = () => {
    const restore = useAuthStore((state) => state.actions.restore);
    const theme = useThemeStore((s) => s.theme);

    useEffect(() => {
        restore();
    }, [restore]);

    return (
        <div
            className={clsx(
                'min-h-screen flex flex-col relative transition-colors duration-300',
                theme === 'dark' ? 'dark' : 'light',
                'bg-cover bg-center bg-no-repeat'
            )}
            style={{
                backgroundImage: theme === 'dark' ? `url(${bgDarkImage})` : `url(${bgWhiteImage})`,
            }}
        >
            <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-sm z-0" />

            <div className="relative z-10 flex flex-col flex-1">
                <AppRouter />
            </div>
        </div>
    );
};

export default App;
