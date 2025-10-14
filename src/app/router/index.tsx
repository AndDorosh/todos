import BoardPage from '@/pages/Board/index.js';
import LoginPage from '@/pages/Login/index.js';
import RegisterPage from '@/pages/Register/index.js';
import useAuthStore from '@/stores/useAuthStore.js';
import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

const AppRouter = () => {
    const user = useAuthStore((state) => state.user);
    const isRestored = useAuthStore((state) => state.isRestored);
    const restore = useAuthStore((state) => state.actions.restore);

    useEffect(() => {
        restore();
    }, [restore]);

    if (!isRestored) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Загрузка...
            </div>
        );
    }

    return (
        <HashRouter>
            <Routes>
                {!user ? (
                    <>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<BoardPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}
            </Routes>
        </HashRouter>
    );
};

export default AppRouter;
