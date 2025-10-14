import { Button, Container, ThemeToggle } from '@/shared/ui/index.js';
import useAuthStore from '@/stores/useAuthStore.js';
import clsx from 'clsx';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: FC<{ className?: string }> = ({ className }) => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.actions.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <header
            className={clsx(
                'w-full flex items-center justify-between gap-4 py-3 border-b bg-white dark:bg-gray-900',
                'border-gray-200 dark:border-gray-800',
                className
            )}
        >
            <Container className="flex-row">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate('/')}
                        className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:opacity-90"
                        aria-label="Перейти на главную"
                    >
                        TODOS<span className="text-blue-300">.</span>
                    </Button>
                    <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-300">
                        Управляй задачами просто
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {user ? (
                        <>
                            <div className="hidden sm:flex flex-col items-end text-right mr-2">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {user.name ?? user.email}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Онлайн
                                </span>
                            </div>

                            <Button variant="secondary" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => navigate('/login')}>
                                Войти
                            </Button>
                            <Button variant="primary" onClick={() => navigate('/register')}>
                                Регистрация
                            </Button>
                        </>
                    )}
                </div>
            </Container>
        </header>
    );
};

export default Navbar;
