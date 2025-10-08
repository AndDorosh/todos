import { clsx } from 'clsx';
import { forwardRef, InputHTMLAttributes } from 'react';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    {...props}
                    className={clsx(
                        'border rounded-md px-3 py-2 outline-none transition-all',
                        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                        'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);
