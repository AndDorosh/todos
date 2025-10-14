import { Modal } from '@/shared/ui/index.js';
import { FC } from 'react';

type Props = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

const ConfirmModal: FC<Props> = ({
    open,
    title = 'Подтвердите действие',
    description,
    confirmText = 'Да',
    cancelText = 'Отмена',
    onConfirm,
    onCancel,
    loading = false,
}) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onConfirm={onConfirm}
            title={title}
            description={description}
            confirmText={confirmText}
            cancelText={cancelText}
            loading={loading}
        />
    );
};

export default ConfirmModal;
