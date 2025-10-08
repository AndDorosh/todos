import useBoardStore from '@/stores/useBoardStore';
import { TColumn } from '@/types';
import { FC, FormEvent, useMemo, useState } from 'react';
import TaskCard from '../TaskCard';
import { Button, Input } from '@/shared/ui';

const Column: FC<{ column: TColumn }> = ({ column }) => {
    // берём *ссылку* на tasks из стора — селектор простой и возвращает один и тот же объект,
    // пока tasks в сторе не изменится
    const allTasks = useBoardStore((state) => state.tasks);

    // мемоизируем фильтрацию + сортировку локально в компоненте
    const tasks = useMemo(() => {
        return allTasks
            .filter((t) => t.columnId === column.id)
            .slice() // копия перед сортировкой (избегаем мутаций исходного массива)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [allTasks, column.id]);

    const addTask = useBoardStore((state) => state.actions.addTask);
    const [adding, setAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async (e?: FormEvent) => {
        e?.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Введите название задачи');
            return;
        }

        setLoading(true);

        try {
            await addTask(title.trim(), column.id);
            setTitle('');
            setAdding(false);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Ошибка добавления';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 min-h-[200px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-100">{column.title}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-300">{tasks.length}</span>
            </div>

            <div className="flex-1 overflow-auto">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>

            <div className="mt-3">
                {adding ? (
                    <form className="flex flex-col gap-2" onSubmit={handleAdd}>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Название задачи"
                            autoFocus
                            disabled={loading}
                        />
                        {error && <div className="text-xs text-red-500">{error}</div>}
                        <div className="flex gap-2">
                            <Button type="submit" loading={loading} variant="primary">
                                {loading ? 'Создаю...' : 'Добавить'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setAdding(false);
                                    setTitle('');
                                    setError(null);
                                }}
                                disabled={loading}
                            >
                                Отмена
                            </Button>
                        </div>
                    </form>
                ) : (
                    <Button
                        onClick={() => setAdding(true)}
                        className="mt-2 w-full text-left text-sm"
                        variant="secondary"
                        fullWidth
                    >
                        + Добавить задачу
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Column;
