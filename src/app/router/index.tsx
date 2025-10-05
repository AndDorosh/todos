import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';
import LoginPage from '@/pages/Auth/Login';
import RegisterPage from '@/pages/Auth/Register';
import BoardPage from '@/pages/Board';

const AppRouter = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
};

export default AppRouter;
