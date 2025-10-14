import TaskList from '@/components/board/TaskList/index.js';
import { Button, Container, Input, Modal, Title } from '@/shared/ui/index.js';
import useTaskStore from '@/stores/useTaskStore.js';
import Navbar from '@/widgets/Navbar/index.js';
import { FC, useEffect, useState } from 'react';

const BoardPage: FC = () => {
    const fetchTasks = useTaskStore((s) => s.actions.fetchTasks);
    const addTask = useTaskStore((s) => s.actions.addTask);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const openModal = () => {
        setTitle('');
        setDescription('');
        setPriority(false);
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setIsModalOpen(false);
        setError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (submitting) return;
        if (!title.trim()) {
            setError('Введите заголовок задачи');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await addTask(title.trim(), { description: description.trim() || undefined, priority });
            setIsModalOpen(false);
        } catch (err) {
            console.error('Ошибка при добавлении задачи:', err);
            setError(err instanceof Error ? err.message : 'Не удалось добавить задачу');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col text-gray-900 dark:text-white">
            <Navbar />

            <Container>
                <div className="py-6">
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <Title>Задачи</Title>

                        <Button onClick={openModal} variant="primary" className="px-4 py-2">
                            Добавить задачу
                        </Button>
                    </div>

                    <TaskList />
                </div>
            </Container>

            <Modal
                open={isModalOpen}
                onCancel={closeModal}
                onConfirm={handleSubmit}
                title="Новая задача"
                confirmText="Добавить"
                cancelText="Отмена"
                loading={submitting}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <Input
                        label="Заголовок"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Короткое название"
                        required
                        autoFocus
                    />

                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Описание (опционально)
                        </span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            rows={4}
                        />
                    </label>

                    <label className="flex items-center gap-2 mt-1 select-none">
                        <input
                            type="checkbox"
                            checked={priority}
                            onChange={(e) => setPriority(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Сделать приоритетной</span>
                    </label>

                    {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
                    <button type="submit" className="hidden" aria-hidden />
                </form>
            </Modal>
        </div>
    );
};

export default BoardPage;
