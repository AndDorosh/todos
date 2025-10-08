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

export type TColumn = {
    id: string;
    title: string;
    order: number;
};

export type TTask = {
    id: string;
    title: string;
    description?: string | null;
    columnId: string;
    order: number;
    userId: string;
};
