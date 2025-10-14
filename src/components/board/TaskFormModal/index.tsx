import { Input, Modal } from '@/shared/ui';
import { FC, useEffect, useRef, useState } from 'react';

type TTaskFormValues = {
    title: string;
    description?: string | null;
    priority?: boolean;
};

type TProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: TTaskFormValues) => Promise<void>;
    initial?: Partial<TTaskFormValues>;
    title?: string;
    confirmText?: string;
    loading?: boolean;
};

const TaskFormModal: FC<TProps> = ({
    open,
    onClose,
    onSubmit,
    initial,
    title = 'Задача',
    confirmText = 'Сохранить',
    loading = false,
}) => {
    const [titleValue, setTitleValue] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [priority, setPriority] = useState(!!initial?.priority);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) mountedRef.current = true;

        if (open) {
            setTitleValue(initial?.title ?? '');
            setDescription(initial?.description ?? '');
            setPriority(!!initial?.priority);
            setError(null);
        }
    }, [open, initial]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (loading) return;

        if (!titleValue.trim()) {
            setError('Введите заголовок задачи');
            return;
        }

        setError(null);

        try {
            await onSubmit({
                title: titleValue.trim(),
                description: description.trim() || null,
                priority,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка');
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onConfirm={handleSubmit}
            title={title}
            confirmText={confirmText}
            cancelText="Отмена"
            loading={loading}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input
                    label="Заголовок"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    placeholder="Короткое название"
                    required
                    autoFocus
                />

                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Описание (опционально)
                    </span>
                    <textarea
                        value={description ?? ''}
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
    );
};

export default TaskFormModal;
