import clsx from 'clsx';
import { ReactNode, FC } from 'react';

type TTileProps = {
    children: ReactNode;
    className?: string;
};

export const Title: FC<TTileProps> = ({ children, className }) => {
    return (
        <h1
            className={clsx(
                'text-2xl font-bold text-center text-gray-800 dark:text-white m-0',
                className
            )}
        >
            {children}
        </h1>
    );
};
