// src/pages/Board/index.tsx
import React, { useEffect, useState } from 'react';
import Column from '@/components/board/Column';
import { Container } from '@/shared/ui';
import useBoardStore from '@/stores/useBoardStore';
import Navbar from '@/widgets/Navbar';

const BoardPage: React.FC = () => {
    const columns = useBoardStore((s) => s.columns);
    const tasks = useBoardStore((s) => s.tasks);
    const isLoading = useBoardStore((s) => s.isLoading);
    const fetchBoard = useBoardStore((s) => s.actions.fetchBoard);
    const addTask = useBoardStore((s) => s.actions.addTask);
    const deleteTask = useBoardStore((s) => s.actions.deleteTask);

    const [isBusy, setIsBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    const createSampleTasks = async () => {
        if (columns.length === 0) {
            setMessage('Нет колонок. Сначала создайте колонки в MockAPI.');
            return;
        }

        setIsBusy(true);
        setMessage(null);

        try {
            // последовательное создание — чтобы гарантировать корректный order и избежать гонок
            for (let idx = 0; idx < columns.length; idx++) {
                const col = columns[idx];
                // ждём завершения каждого addTask
                await addTask(`Тестовая задача ${idx + 1}`, col.id);
            }
            setMessage('Тестовые задачи созданы.');
        } catch (err) {
            console.error(err);
            setMessage(err instanceof Error ? err.message : 'Ошибка при создании задач');
        } finally {
            setIsBusy(false);
        }
    };

    const clearAllTasks = async () => {
        if (tasks.length === 0) {
            setMessage('Нет задач для удаления.');
            return;
        }

        const ok = window.confirm('Удалить все задачи? Это действие необратимо.');
        if (!ok) return;

        setIsBusy(true);
        setMessage(null);

        try {
            // delete only server tasks in parallel and local tasks locally
            await Promise.all(tasks.map((t) => deleteTask(t.id)));
            setMessage('Все задачи удалены.');
        } catch (err) {
            console.error(err);
            setMessage(err instanceof Error ? err.message : 'Ошибка при удалении задач');
        } finally {
            setIsBusy(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Загрузка доски...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />

            <Container>
                <main className="py-6">
                    {/* Dev toolbar */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={createSampleTasks}
                                disabled={isBusy}
                                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                aria-disabled={isBusy}
                            >
                                {isBusy ? 'Подождите...' : 'Добавить тестовые задачи'}
                            </button>

                            <button
                                onClick={clearAllTasks}
                                disabled={isBusy || tasks.length === 0}
                                className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                                aria-disabled={isBusy || tasks.length === 0}
                            >
                                {isBusy ? 'Подождите...' : 'Очистить все задачи'}
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {columns.length} колонок — {tasks.length} задач
                        </div>
                    </div>

                    {message && (
                        <div className="mb-4 text-sm text-yellow-600 dark:text-yellow-400">
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {columns.map((col) => (
                            <Column key={col.id} column={col} />
                        ))}
                    </div>
                </main>
            </Container>
        </div>
    );
};

export default BoardPage;
