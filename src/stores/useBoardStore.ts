// src/stores/useBoardStore.ts
import { create } from 'zustand';
import { api } from '@/api';
import { TColumn, TTask } from '@/types';
import { DEFAULT_COLUMNS } from '@/shared/constants';

type TBoardActions = {
    fetchBoard: () => Promise<void>;
    addTask: (title: string, columnId: string) => Promise<TTask>;
    moveTask: (taskId: string, targetColumnId: string, newIndex: number) => Promise<void>;
    updateTask: (
        taskId: string,
        patch: Partial<Pick<TTask, 'title' | 'description'>>
    ) => Promise<TTask>;
    deleteTask: (taskId: string) => Promise<void>;
};

type TBoardState = {
    columns: TColumn[];
    tasks: TTask[];
    isLoading: boolean;
    actions: TBoardActions;
};

const LOCAL_TASKS_KEY = 'kanban_local_tasks_v1';
const genId = () => {
    // предпочитаем нативный UUID
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `local-${crypto.randomUUID()}`;
    }
    // fallback: более надёжная случайная строка
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const loadLocalTasks = (): TTask[] => {
    try {
        const raw = localStorage.getItem(LOCAL_TASKS_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as TTask[];
    } catch {
        return [];
    }
};

const saveLocalTasks = (tasks: TTask[]) => {
    try {
        localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
    } catch (err) {
        console.error('Ошибка при сохранении задачи локально: ', err);
    }
};

const clearLocalTasks = () => {
    try {
        localStorage.removeItem(LOCAL_TASKS_KEY);
    } catch (err) {
        console.error('Ошибка при очистке задач локально: ', err);
    }
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

const normalizeOrders = (tasks: TTask[]): TTask[] => {
    const grouped: Record<string, TTask[]> = {};
    tasks.forEach((t) => {
        grouped[t.columnId] = grouped[t.columnId] || [];
        grouped[t.columnId].push(t);
    });
    const result: TTask[] = Object.values(grouped).flatMap((arr) =>
        arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((t, i) => ({ ...t, order: i + 1 }))
    );
    return result;
};

const useBoardStore = create<TBoardState>((set, get) => ({
    columns: DEFAULT_COLUMNS,
    tasks: loadLocalTasks(),
    isLoading: false,

    actions: {
        // fetch columns (from constants) and user's tasks (server or local)
        fetchBoard: async () => {
            set({ isLoading: true });
            try {
                const userId = getAuthUserId();

                if (!userId) {
                    // no auth -> use local tasks
                    const local = loadLocalTasks();
                    set({ columns: DEFAULT_COLUMNS, tasks: normalizeOrders(local) });
                    return;
                }

                // 1) fetch server tasks for the user
                const { data: serverTasks } = await api.get<TTask[]>('/tasks', {
                    params: { userId },
                });

                // 2) migrate local tasks created before login (optional)
                const local = loadLocalTasks();
                const localTasksToMigrate = local.filter((t) => String(t.id).startsWith('local-'));

                if (localTasksToMigrate.length > 0) {
                    try {
                        // post all local tasks to server, attaching userId
                        const posted = await Promise.all(
                            localTasksToMigrate.map((lt) =>
                                api.post<TTask>('/tasks', {
                                    ...lt,
                                    userId,
                                })
                            )
                        );
                        // merge server tasks with newly posted tasks
                        const postedTasks = posted.map((r) => r.data);
                        const merged = [...(serverTasks || []), ...postedTasks];
                        const normalized = normalizeOrders(merged);
                        // save merged as current tasks and clear local migrated tasks
                        set({ columns: DEFAULT_COLUMNS, tasks: normalized });
                        // remove migrated tasks from localStorage (we posted them already)
                        const remainingLocal = local.filter(
                            (t) => !String(t.id).startsWith('local-')
                        );
                        if (remainingLocal.length === 0) clearLocalTasks();
                        else saveLocalTasks(remainingLocal);
                        return;
                    } catch (err) {
                        // If migration fails, continue with serverTasks (don't lose anything)
                        console.warn(
                            'Migration of local tasks failed, continuing with server tasks',
                            err
                        );
                    }
                }

                set({
                    columns: DEFAULT_COLUMNS,
                    tasks: normalizeOrders(serverTasks || []),
                });
            } catch (err) {
                console.warn(
                    'fetchBoard: cannot load tasks from server, falling back to local',
                    err
                );
                const local = loadLocalTasks();
                set({ columns: DEFAULT_COLUMNS, tasks: normalizeOrders(local) });
            } finally {
                set({ isLoading: false });
            }
        },

        // add task: prefer server (with userId), fallback to local
        addTask: async (title, columnId) => {
            const userId = getAuthUserId();
            const order = get().tasks.filter((t) => t.columnId === columnId).length + 1;

            const payload = {
                title,
                columnId,
                order,
                userId: userId ?? null,
            };

            if (userId) {
                try {
                    const { data } = await api.post<TTask>('/tasks', payload);
                    const newTasks = normalizeOrders([...get().tasks, data]);
                    set({ tasks: newTasks });
                    return data;
                } catch (err) {
                    console.warn('addTask: server POST failed, falling back to local', err);
                }
            }

            // local fallback
            const localTask: TTask = { id: genId(), ...payload } as TTask;
            const newTasks = normalizeOrders([...get().tasks, localTask]);
            set({ tasks: newTasks });
            saveLocalTasks(newTasks);
            return localTask;
        },

        // move task locally, then try to update server-side tasks that have server IDs
        moveTask: async (taskId, targetColumnId, newIndex) => {
            const all = [...get().tasks];
            const task = all.find((t) => t.id === taskId);
            if (!task) return;

            const oldColumnId = task.columnId;
            task.columnId = targetColumnId;
            task.order = newIndex;

            const excl = all.filter((t) => t.id !== taskId);

            const targetTasks = [...excl.filter((t) => t.columnId === targetColumnId), task].sort(
                (a, b) => (a.order ?? 0) - (b.order ?? 0)
            );
            const updatedTarget = targetTasks.map((t, i) => ({ ...t, order: i + 1 }));

            const sourceTasks = excl
                .filter((t) => t.columnId === oldColumnId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((t, i) => ({ ...t, order: i + 1 }));

            const newAll = [
                ...excl.filter((t) => t.columnId !== oldColumnId && t.columnId !== targetColumnId),
                ...sourceTasks,
                ...updatedTarget,
            ];

            const normalizedAll = normalizeOrders(newAll);
            set({ tasks: normalizedAll });

            // try to sync changed tasks with the server (only tasks with server ids)
            const userId = getAuthUserId();
            if (!userId) {
                saveLocalTasks(normalizedAll);
                return;
            }

            const tasksToSync = [...sourceTasks, ...updatedTarget].filter(
                (t) => !String(t.id).startsWith('local-')
            );
            if (tasksToSync.length === 0) {
                saveLocalTasks(normalizedAll);
                return;
            }

            try {
                await Promise.all(
                    tasksToSync.map((t) =>
                        api.put<TTask>(`/tasks/${t.id}`, {
                            title: t.title,
                            description: t.description,
                            columnId: t.columnId,
                            order: t.order,
                            userId: t.userId ?? userId,
                        })
                    )
                );
            } catch (err) {
                console.warn('moveTask sync failed — keeping local state', err);
                saveLocalTasks(normalizedAll);
            }
        },

        // update title/description: try server first (if server id), else local
        updateTask: async (taskId, patch) => {
            const userId = getAuthUserId();
            if (userId && !String(taskId).startsWith('local-')) {
                try {
                    const { data } = await api.put<TTask>(`/tasks/${taskId}`, patch);
                    const updated = normalizeOrders(
                        get().tasks.map((t) => (t.id === taskId ? data : t))
                    );
                    set({ tasks: updated });
                    return data;
                } catch (err) {
                    console.warn('updateTask: PUT failed, falling back to local', err);
                }
            }

            // local update
            const updatedLocal = normalizeOrders(
                get().tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
            );
            set({ tasks: updatedLocal });
            saveLocalTasks(updatedLocal);
            return updatedLocal.find((t) => t.id === taskId)!;
        },

        // delete: try server if server id, else local
        deleteTask: async (taskId) => {
            const userId = getAuthUserId();
            if (userId && !String(taskId).startsWith('local-')) {
                try {
                    await api.delete(`/tasks/${taskId}`);
                    const remaining = normalizeOrders(get().tasks.filter((t) => t.id !== taskId));
                    set({ tasks: remaining });
                    return;
                } catch (err) {
                    console.warn('deleteTask: DELETE failed, falling back to local', err);
                }
            }

            // local delete
            const remainingLocal = normalizeOrders(get().tasks.filter((t) => t.id !== taskId));
            set({ tasks: remainingLocal });
            saveLocalTasks(remainingLocal);
        },
    },
}));

export default useBoardStore;
