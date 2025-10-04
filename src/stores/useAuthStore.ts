import { create } from 'zustand';
import { api } from '@/api/axios';
import { TUser } from '@/types';

type TAuthActions = {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    restore: () => void;
};

type TAuthState = {
    user: TUser | null;
    token: string | null;
    actions: TAuthActions;
};

const useAuthStore = create<TAuthState>((set) => ({
    user: null,
    token: null,

    actions: {
        login: async (email, password) => {
            const res = await api.get<TUser[]>('/users', { params: { email, password } });

            if (res.data.length === 0) throw new Error('Неверный email или пароль');

            const user = res.data[0];
            const token = user.id;
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);

            set({ user, token });
        },

        register: async (name, email, password) => {
            const exists = await api.get<TUser[]>('/users', { params: { email } });

            if (exists.data.length > 0)
                throw new Error('Пользователь с таким email уже существует');

            const res = await api.post<TUser>('/users', { name, email, password });
            const user = res.data;
            const token = user.id;
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);

            set({ user, token });
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
        },
    },
}));

export default useAuthStore;
