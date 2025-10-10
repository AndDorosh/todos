import { Card, Input, Button } from '@/shared/ui';
import useAuthStore from '@/stores/useAuthStore';
import Navbar from '@/widgets/Navbar';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuthStore((state) => state.actions);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            } else {
                throw new Error('Ошибка при регистрации');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gray-50 dark:bg-gray-900 px-4">
                <Card className="w-full max-w-md p-8">
                    <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                        Вход в аккаунт
                    </h1>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <Input
                            type="email"
                            label="Почта"
                            placeholder="your@mail.ru"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            label="Пароль"
                            placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" fullWidth>
                            Войти
                        </Button>
                    </form>

                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline select-none">
                            Зарегистрироваться
                        </Link>
                    </p>
                </Card>
            </div>
        </>
    );
};

export default LoginPage;
