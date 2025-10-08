import { clsx } from 'clsx';
import React from 'react';

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    fullWidth,
    className,
    loading = false,
    disabled,
    ...props
}: IButtonProps) => {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            disabled={isDisabled}
            aria-busy={loading || null}
            className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                fullWidth && 'w-full',
                variant === 'primary' &&
                    'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
                variant === 'secondary' &&
                    'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white',
                variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
                className
            )}
        >
            {loading && (
                <span
                    aria-hidden="true"
                    className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
            )}

            {children ? (
                <span>{children}</span>
            ) : loading ? (
                <span className="sr-only">Loading</span>
            ) : null}
        </button>
    );
};
