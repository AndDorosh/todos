// src/components/board/TaskCard.tsx
import React, { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { Button, Input } from '@/shared/ui';
import { Modal } from '@/shared/ui/Modal';
import useBoardStore from '@/stores/useBoardStore';
import { TTask } from '@/types';

const TaskCard: FC<{ task: TTask }> = ({ task }) => {
    const updateTask = useBoardStore((s) => s.actions.updateTask);
    const deleteTask = useBoardStore((s) => s.actions.deleteTask);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState<string>(task.description ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const titleRef = useRef<HTMLInputElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);

    // sync local state when task prop changes (e.g. store updated)
    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description ?? '');
    }, [task.title, task.description]);

    // focus behavior when entering edit mode
    useEffect(() => {
        if (!isEditing) return;
        // If there is already a description — focus title, else focus description
        if (task.description && titleRef.current) {
            titleRef.current.focus();
            titleRef.current.select();
        } else if (descRef.current) {
            descRef.current.focus();
            // move cursor to end
            const len = descRef.current.value.length;
            descRef.current.setSelectionRange(len, len);
        } else if (titleRef.current) {
            titleRef.current.focus();
            titleRef.current.select();
        }
    }, [isEditing, task.description]);

    const onSave = async (e?: FormEvent) => {
        e?.preventDefault();

        if (!title.trim()) {
            setError('Заголовок не может быть пустым');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const patch = {
                title: title.trim(),
                // send description only if not empty, otherwise null to remove
                description: description.trim() ? description.trim() : null,
            };

            await updateTask(task.id, patch);
            setIsEditing(false);
        } catch (err) {
            console.error('Ошибка при обновлении задачи:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            await deleteTask(task.id);
            // компонент, скорее всего, размонтируется после удаления
        } catch (err) {
            console.error('Ошибка при удалении задачи:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при удалении');
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <article
                className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3 shadow-sm hover:shadow-lg transition-shadow duration-150"
                aria-label={task.title}
            >
                {isEditing ? (
                    <form onSubmit={onSave} className="flex flex-col gap-2">
                        <Input
                            ref={titleRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                            aria-label="Заголовок задачи"
                        />

                        <textarea
                            ref={descRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800 text-sm resize-none"
                            rows={4}
                            disabled={loading}
                            aria-label="Описание задачи"
                        />

                        {error && <div className="text-xs text-red-500">{error}</div>}

                        <div className="flex gap-2">
                            <Button type="submit" loading={loading} variant="primary">
                                Сохранить
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    // cancel edit — restore original values from prop
                                    setIsEditing(false);
                                    setTitle(task.title);
                                    setDescription(task.description ?? '');
                                    setError(null);
                                }}
                                disabled={loading}
                            >
                                Отмена
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                {task.title}
                            </h3>

                            {task.description ? (
                                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 line-clamp-3">
                                    {task.description}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Описание отсутствует
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                                onClick={() => {
                                    setIsEditing(true);
                                    setError(null);
                                }}
                                className="text-xs underline"
                                variant="secondary"
                            >
                                Править
                            </Button>

                            {!task.description && (
                                <Button
                                    onClick={() => {
                                        setIsEditing(true);
                                        // When entering edit mode, useEffect will focus descRef (if no description)
                                        setError(null);
                                    }}
                                    className="text-xs"
                                    variant="secondary"
                                >
                                    Добавить описание
                                </Button>
                            )}

                            <Button
                                onClick={() => setConfirmOpen(true)}
                                className="text-xs text-red-500"
                                variant="danger"
                            >
                                Удалить
                            </Button>
                        </div>
                    </div>
                )}
            </article>

            <Modal
                open={confirmOpen}
                title="Удалить задачу?"
                description="Это действие нельзя будет отменить."
                confirmText="Удалить"
                cancelText="Отмена"
                onConfirm={onDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={loading}
            />
        </>
    );
};

export default TaskCard;
