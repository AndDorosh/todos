import clsx from 'clsx';
import { ButtonHTMLAttributes, FC } from 'react';

const stopDragStart = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const ev = e as unknown as PointerEvent;
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
};

export const IconButton: FC<ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }> = ({
    children,
    busy,
    className,
    ...props
}) => {
    return (
        <button
            {...props}
            className={clsx(
                'p-2 rounded-md inline-flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-pointer',
                className
            )}
            onPointerDown={(e) => {
                stopDragStart(e);
                if (props.onPointerDown) props.onPointerDown(e);
            }}
        >
            <span className={clsx(busy && 'opacity-60 animate-pulse')}>{children}</span>
        </button>
    );
};
