import { Button } from '@/shared/ui';
import useAuthStore from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const BoardPage = () => {
    const logout = useAuthStore((state) => state.actions.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold">Kanban Board</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm">{user?.name}</span>
                    <Button onClick={handleLogout} variant="secondary">
                        Выйти
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">В разработке :D</div>
            </main>
        </div>
    );
};

export default BoardPage;
