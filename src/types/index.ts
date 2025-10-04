export type TUser = {
    id: string;
    email: string;
    password?: string;
    name?: string;
};

export type TTodo = {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    userId: string;
};
