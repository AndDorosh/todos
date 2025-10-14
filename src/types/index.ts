export type TUser = {
    id: string;
    email: string;
    password?: string;
    name?: string;
};

export type TTask = {
    id: string;
    title: string;
    description?: string | null;
    userId: string;
    createdAt: number;
    activatedAt?: number | null;
    priority: boolean;
    priorityAt?: number | null;
    completed: boolean;
    completedAt?: number | null;
};
