import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Button } from '../Button';

interface ModalProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    open,
    title,
    description,
    confirmText = 'Да',
    cancelText = 'Отмена',
    onConfirm,
    onCancel,
    loading,
}) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className={clsx(
                        'fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {title && (
                            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {description}
                            </p>
                        )}
                        <div className="flex justify-end gap-3">
                            <Button onClick={onCancel} variant="secondary" disabled={loading}>
                                {cancelText}
                            </Button>
                            <Button onClick={onConfirm} variant="danger" loading={loading}>
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
