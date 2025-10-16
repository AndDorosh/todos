import { create } from 'zustand';
import { api } from '@/api/index.js';
import { TUser } from '@/types/index.js';
import axios from 'axios';

type TAuthActions = {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    restore: () => void;
};

type TAuthState = {
    user: TUser | null;
    token: string | null;
    isRestored: boolean;
    actions: TAuthActions;
};

const useAuthStore = create<TAuthState>((set) => ({
    user: null,
    token: null,
    isRestored: false,

    actions: {
        register: async (name, email, password) => {
            try {
                let existingUsers: TUser[] = [];

                try {
                    const { data } = await api.get<TUser[]>('/users', { params: { email } });
                    existingUsers = data;
                } catch (err: unknown) {
                    if (axios.isAxiosError(err)) {
                        const status = err.response?.status;
                        if (status === 404) {
                            existingUsers = [];
                        } else {
                            console.error(
                                '[auth] Ошибка при проверке существующего пользователя:',
                                err
                            );
                            throw new Error('Ошибка при проверке пользователя');
                        }
                    } else {
                        console.error('[auth] Неожиданная ошибка:', err);
                        throw new Error('Ошибка при проверке пользователя');
                    }
                }

                if (existingUsers.length > 0) {
                    alert('Пользователь с таким email уже существует');
                    return;
                }

                const { data: newUser } = await api.post<TUser>('/users', {
                    name,
                    email,
                    password,
                });

                const safeUser = {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                };

                const token = newUser.id;
                localStorage.setItem('auth_user', JSON.stringify(safeUser));
                localStorage.setItem('auth_token', token);

                set({ user: safeUser, token });
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    console.error(
                        'Ошибка при регистрации (axios):',
                        err.response?.data || err.message
                    );
                    throw new Error(
                        err.response?.data?.message || 'Не удалось зарегистрировать пользователя'
                    );
                } else if (err instanceof Error) {
                    console.error('Ошибка при регистрации:', err.message);
                    throw err;
                } else {
                    console.error('Неизвестная ошибка при регистрации:', err);
                    throw new Error('Не удалось зарегистрировать пользователя');
                }
            }
        },

        login: async (email, password) => {
            try {
                const res = await api.get<TUser[]>('/users', { params: { email } });

                if (res.data.length === 0) {
                    alert('Неверный email или пароль');
                    throw new Error('Неверный email или пароль');
                }

                const user = res.data[0];

                if (user.password !== password) throw new Error('Неверный email или пароль');

                const token = user.id;
                const safeUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };

                localStorage.setItem('auth_user', JSON.stringify(safeUser));
                localStorage.setItem('auth_token', token);

                set({ user: safeUser, token });
            } catch (err) {
                console.error('Ошибка при логине: ', err);

                if (err instanceof Error) {
                    throw err;
                } else {
                    throw new Error('Ошибка при авторизации');
                }
            }
        },

        logout: () => {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');

            set({ user: null, token: null });
        },

        restore: () => {
            const userStr = localStorage.getItem('auth_user');
            const token = localStorage.getItem('auth_token');

            if (userStr && token) {
                try {
                    const user = JSON.parse(userStr);
                    set({ user, token });
                } catch {
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('auth_token');
                }
            }

            set({ isRestored: true });
        },
    },
}));

export default useAuthStore;
