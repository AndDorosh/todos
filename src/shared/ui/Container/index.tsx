import clsx from 'clsx';
import { ReactNode, FC } from 'react';

type TContainerProps = {
    children: ReactNode;
    className?: string;
};

export const Container: FC<TContainerProps> = ({ children, className }) => {
    return (
        <div className={clsx('max-w-[1440px] mx-auto w-full px-4 flex justify-between', className)}>
            {children}
        </div>
    );
};
