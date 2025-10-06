import { clsx } from 'clsx';

interface ICardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className }: ICardProps) => {
    return (
        <div
            className={clsx(
                'bg-white dark:bg-gray-900 shadow-md rounded-xl p-4',
                'border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            {children}
        </div>
    );
};
