import { create } from 'zustand';
import { api } from '@/api';
import { TTask } from '@/types';

type TTaskActions = {
    fetchTasks: () => Promise<void>;
    addTask: (title: string, opts?: { priority?: boolean; description?: string }) => Promise<TTask>;
    updateTask: (
        taskId: string,
        patch: Partial<Pick<TTask, 'title' | 'description'>>
    ) => Promise<TTask>;
    deleteTask: (taskId: string) => Promise<void>;
    togglePriority: (taskId: string) => Promise<void>;
    toggleComplete: (taskId: string) => Promise<void>;
};

type TTaskState = {
    tasks: TTask[];
    isLoading: boolean;
    actions: TTaskActions;
};

const sortTasksByRules = (tasks: TTask[]): TTask[] => {
    const a = [...tasks];
    a.sort((x, y) => {
        const xCompleted = !!x.completed;
        const yCompleted = !!y.completed;

        if (xCompleted !== yCompleted) return xCompleted ? 1 : -1;

        if (xCompleted && yCompleted) {
            const xa = x.completedAt ?? 0;
            const ya = y.completedAt ?? 0;
            return ya - xa;
        }

        const xPriority = !!x.priority;
        const yPriority = !!y.priority;

        if (xPriority !== yPriority) return xPriority ? -1 : 1;

        if (xPriority && yPriority) {
            const xa = x.priorityAt ?? 0;
            const ya = y.priorityAt ?? 0;
            return xa - ya;
        }

        const xa = x.activatedAt ?? x.createdAt ?? 0;
        const ya = y.activatedAt ?? y.createdAt ?? 0;
        return xa - ya;
    });

    return a;
};

const getAuthUserId = (): string | null => {
    try {
        const raw = localStorage.getItem('auth_user');

        if (!raw) return null;

        const parsed = JSON.parse(raw);

        return parsed?.id ?? null;
    } catch {
        return null;
    }
};

const useTaskStore = create<TTaskState>((set, get) => ({
    tasks: [],
    isLoading: false,

    actions: {
        fetchTasks: async () => {
            set({ isLoading: true });

            try {
                const userId = getAuthUserId();
                if (!userId) {
                    set({ tasks: [] });
                    return;
                }

                const res = await api.get<TTask[]>('/tasks', { params: { userId } });
                const data = (res.data ?? []) as TTask[];

                const normalizedInput = data.map((t) => ({
                    ...t,
                    createdAt: (t.createdAt ?? Date.now()) as number,
                    activatedAt: t.activatedAt ?? null,
                    priorityAt: t.priorityAt ?? null,
                    completedAt: t.completedAt ?? null,
                }));

                const sorted = sortTasksByRules(normalizedInput);
                set({ tasks: sorted });
            } catch (err) {
                console.error('Ошибка при загрузке задач:', err);
                set({ tasks: [] });
                throw err instanceof Error ? err : new Error('Ошибка загрузки задач');
            } finally {
                set({ isLoading: false });
            }
        },

        addTask: async (title, opts = {}) => {
            const userId = getAuthUserId();

            if (!userId) throw new Error('Пользователь не авторизован');

            const prev = get().tasks;
            const tempId = `temp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            const now = Date.now();

            const newTask: TTask = {
                id: tempId,
                title,
                description: opts.description ?? null,
                userId,
                createdAt: now,
                activatedAt: now,
                priority: !!opts.priority,
                priorityAt: opts.priority ? now : null,
                completed: false,
                completedAt: null,
            };

            const optimisticList = sortTasksByRules([...prev, newTask]);
            set({ tasks: optimisticList });

            try {
                const { data } = await api.post<TTask>('/tasks', {
                    title,
                    description: opts.description ?? null,
                    userId,
                    createdAt: now,
                    activatedAt: now,
                    priority: !!opts.priority,
                    priorityAt: opts.priority ? now : null,
                    completed: false,
                    completedAt: null,
                });

                set((state) => ({ tasks: state.tasks.map((t) => (t.id === tempId ? data : t)) }));

                await get().actions.fetchTasks();
                return data;
            } catch (err) {
                set({ tasks: prev });
                console.error('Ошибка при добавлении задачи (rollback):', err);
                throw err instanceof Error ? err : new Error('Не удалось добавить задачу');
            }
        },

        updateTask: async (taskId, patch) => {
            const prev = get().tasks;
            const optimistic = prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
            set({ tasks: sortTasksByRules(optimistic) });

            try {
                const { data } = await api.put<TTask>(`/tasks/${taskId}`, patch);

                set((state) => ({
                    tasks: sortTasksByRules(state.tasks.map((t) => (t.id === taskId ? data : t))),
                }));

                return data;
            } catch (err) {
                set({ tasks: prev });
                console.error('Ошибка при обновлении задачи (rollback):', err);
                throw err instanceof Error ? err : new Error('Не удалось обновить задачу');
            }
        },

        deleteTask: async (taskId) => {
            const prev = get().tasks;
            const after = prev.filter((t) => t.id !== taskId);
            set({ tasks: sortTasksByRules(after) });

            try {
                await api.delete(`/tasks/${taskId}`);
                await get().actions.fetchTasks();
            } catch (err) {
                set({ tasks: prev });
                console.error('Ошибка при удалении задачи (rollback):', err);
                throw err instanceof Error ? err : new Error('Не удалось удалить задачу');
            }
        },

        togglePriority: async (taskId) => {
            const prev = get().tasks;
            const task = prev.find((t) => t.id === taskId);

            if (!task) throw new Error('Задача не найдена');

            const now = Date.now();
            const newPriority = !task.priority;

            const updated = prev.map((t) =>
                t.id === taskId
                    ? {
                          ...t,
                          priority: newPriority,
                          priorityAt: newPriority ? now : null,
                          activatedAt: newPriority ? (t.activatedAt ?? t.createdAt ?? now) : now,
                      }
                    : t
            );

            set({ tasks: sortTasksByRules(updated) });

            try {
                await api.put<TTask>(`/tasks/${taskId}`, {
                    priority: newPriority,
                    priorityAt: newPriority ? now : null,
                    activatedAt: newPriority ? (task.activatedAt ?? task.createdAt ?? null) : now,
                });

                await get().actions.fetchTasks();
            } catch (err) {
                set({ tasks: prev });
                console.error('Ошибка при togglePriority (rollback):', err);
                throw err instanceof Error ? err : new Error('Не удалось изменить приоритет');
            }
        },

        toggleComplete: async (taskId) => {
            const prev = get().tasks;
            const task = prev.find((t) => t.id === taskId);
            if (!task) throw new Error('Задача не найдена');

            const now = Date.now();
            const newCompleted = !task.completed;

            const updated = prev.map((t) =>
                t.id === taskId
                    ? {
                          ...t,
                          completed: newCompleted,
                          completedAt: newCompleted ? now : null,
                          activatedAt: newCompleted ? (t.activatedAt ?? t.createdAt ?? null) : now,
                      }
                    : t
            );

            set({ tasks: sortTasksByRules(updated) });

            try {
                await api.put<TTask>(`/tasks/${taskId}`, {
                    completed: newCompleted,
                    completedAt: newCompleted ? now : null,
                    activatedAt: newCompleted ? (task.activatedAt ?? task.createdAt ?? null) : now,
                });

                await get().actions.fetchTasks();
            } catch (err) {
                set({ tasks: prev });
                console.error('Ошибка при toggleComplete (rollback):', err);
                throw err instanceof Error
                    ? err
                    : new Error('Не удалось изменить состояние выполнения');
            }
        },
    },
}));

export default useTaskStore;
