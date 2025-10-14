import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/index.js';

interface ModalProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    children?: React.ReactNode;
    disableBackdropClick?: boolean;
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
    children,
    disableBackdropClick = false,
}) => {
    // Escape -> close
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, loading, onCancel]);

    // Guard для SSR (в Vite обычно не нужен, но безопасно)
    if (typeof document === 'undefined') return null;

    const modal = (
        <AnimatePresence>
            {open && (
                <motion.div
                    className={clsx(
                        'fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]'
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                        if (disableBackdropClick || loading) return;
                        if (e.target === e.currentTarget) onCancel();
                    }}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                                {title}
                            </h2>
                        )}

                        {children ? (
                            <div className="mb-4">{children}</div>
                        ) : description ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {description}
                            </p>
                        ) : null}

                        <div className="flex justify-end gap-3">
                            <Button onClick={onCancel} variant="secondary" disabled={loading}>
                                {cancelText}
                            </Button>
                            <Button onClick={onConfirm} variant="primary" loading={loading}>
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
};
