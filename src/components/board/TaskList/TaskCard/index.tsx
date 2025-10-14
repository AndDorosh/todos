import ConfirmModal from '@/components/board/ConfirmModal/index.js';
import TaskFormModal from '@/components/board/TaskFormModal/index.js';
import { IconButton } from '@/shared/ui/index.js';
import useTaskStore from '@/stores/useTaskStore.js';
import { TTask } from '@/types/index.js';
import clsx from 'clsx';
import { Check, Edit2, Star, Trash2 } from 'lucide-react';
import { FC, memo, useState } from 'react';

const TaskCard: FC<{ task: TTask }> = ({ task }) => {
    const togglePriority = useTaskStore((s) => s.actions.togglePriority);
    const toggleComplete = useTaskStore((s) => s.actions.toggleComplete);
    const updateTask = useTaskStore((s) => s.actions.updateTask);
    const deleteTask = useTaskStore((s) => s.actions.deleteTask);

    const [busyPriority, setBusyPriority] = useState(false);
    const [busyComplete, setBusyComplete] = useState(false);
    const [busyDelete, setBusyDelete] = useState(false);
    const [busyEdit, setBusyEdit] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [delOpen, setDelOpen] = useState(false);

    const onTogglePriority = async (e?: React.SyntheticEvent) => {
        e?.stopPropagation();
        if (busyPriority) return;
        setBusyPriority(true);
        try {
            await togglePriority(task.id);
        } catch (err) {
            console.error('togglePriority error', err);
        } finally {
            setBusyPriority(false);
        }
    };

    const onToggleComplete = async (e?: React.SyntheticEvent) => {
        e?.stopPropagation();
        if (busyComplete) return;
        setBusyComplete(true);
        try {
            await toggleComplete(task.id);
        } catch (err) {
            console.error('toggleComplete error', err);
        } finally {
            setBusyComplete(false);
        }
    };

    const onDeleteConfirm = async () => {
        if (busyDelete) return;
        setBusyDelete(true);
        try {
            await deleteTask(task.id);
            setDelOpen(false);
        } catch (err) {
            console.error('deleteTask error', err);
        } finally {
            setBusyDelete(false);
        }
    };

    const onEditSubmit = async (values: {
        title: string;
        description?: string | null;
        priority?: boolean;
    }) => {
        if (busyEdit) return;
        setBusyEdit(true);
        try {
            await updateTask(task.id, {
                title: values.title,
                description: values.description ?? null,
            });

            if (!!values.priority !== !!task.priority) {
                await togglePriority(task.id);
            }

            setEditOpen(false);
        } catch (err) {
            console.error('edit submit error', err);
            throw err;
        } finally {
            setBusyEdit(false);
        }
    };

    return (
        <>
            <div
                className={clsx(
                    'flex w-full items-center bg-white dark:bg-gray-700 rounded-lg py-3 px-4 gap-4',
                    'shadow dark:shadow-none dark:border dark:border-cyan-950',
                    task.completed && 'opacity-80'
                )}
                role="group"
                aria-label={`task ${task.title}`}
            >
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePriority(e);
                    }}
                    disabled={busyPriority || busyComplete || busyDelete || busyEdit}
                    aria-label={task.priority ? 'Убрать приоритет' : 'Сделать приоритетной'}
                    title={task.priority ? 'Убрать приоритет' : 'Сделать приоритетной'}
                    busy={busyPriority}
                >
                    <Star
                        opacity={task.completed ? 0.8 : 1}
                        fill={task.priority ? '#FFD32C' : 'none'}
                        stroke={task.priority ? '#FFD32C' : 'currentColor'}
                        size={18}
                    />
                </IconButton>

                <div className="flex flex-col flex-1 min-w-0">
                    <span
                        className={clsx(
                            'font-bold text-[18px] select-none truncate',
                            task.completed && 'line-through text-gray-400'
                        )}
                    >
                        {task.title}
                    </span>

                    {task.description ? (
                        <p className="select-none text-sm text-gray-600 dark:text-gray-300 truncate">
                            {task.description}
                        </p>
                    ) : null}
                </div>

                <div className="flex items-center gap-1">
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditOpen(true);
                        }}
                        title="Править"
                        aria-label="Править задачу"
                        disabled={busyEdit || busyDelete}
                    >
                        <Edit2 size={16} opacity={task.completed ? 0.8 : 1} />
                    </IconButton>

                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setDelOpen(true);
                        }}
                        title="Удалить"
                        aria-label="Удалить задачу"
                        className="text-red-500"
                        disabled={busyDelete}
                        busy={busyDelete}
                    >
                        <Trash2 size={16} opacity={task.completed ? 0.8 : 1} />
                    </IconButton>

                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(e);
                        }}
                        title={
                            task.completed ? 'Отметить как не выполнено' : 'Отметить как выполнено'
                        }
                        aria-label={
                            task.completed ? 'Отметить как не выполнено' : 'Отметить как выполнено'
                        }
                        disabled={busyComplete}
                        busy={busyComplete}
                    >
                        <div
                            className={clsx(
                                'border rounded-[50%] p-0.5',
                                task.completed &&
                                    'bg-blue-600 border-blue-600 dark:bg-blue-400 dark:border-blue-400'
                            )}
                        >
                            <Check
                                color={task.completed ? '#FFFFFF' : 'currentColor'}
                                opacity={task.completed ? 0.8 : 1}
                                size={12}
                            />
                        </div>
                    </IconButton>
                </div>
            </div>

            <TaskFormModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={onEditSubmit}
                initial={{
                    title: task.title,
                    description: task.description ?? null,
                    priority: !!task.priority,
                }}
                title="Редактировать задачу"
                confirmText="Сохранить"
                loading={busyEdit}
            />

            <ConfirmModal
                open={delOpen}
                onCancel={() => setDelOpen(false)}
                onConfirm={onDeleteConfirm}
                title="Удалить задачу?"
                description="Вы уверены, что хотите удалить задачу? Это действие нельзя будет отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                loading={busyDelete}
            />
        </>
    );
};

export default memo(
    TaskCard,
    (prev, next) =>
        prev.task.id === next.task.id &&
        prev.task.title === next.task.title &&
        prev.task.completed === next.task.completed &&
        prev.task.completedAt === next.task.completedAt &&
        prev.task.priority === next.task.priority &&
        prev.task.priorityAt === next.task.priorityAt &&
        prev.task.activatedAt === next.task.activatedAt &&
        prev.task.createdAt === next.task.createdAt &&
        prev.task.description === next.task.description &&
        prev.task.userId === next.task.userId
);
