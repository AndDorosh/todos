import { Card, Input, Button } from '@/shared/ui';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '@/stores/useAuthStore';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuthStore((state) => state.actions);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await register(name, email, password);
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                    Регистрация
                </h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        label="Имя"
                        placeholder="Андрей"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                        Зарегистрироваться
                    </Button>
                </form>

                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline select-none">
                        Войти
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage;
