import { FormEvent, FormHTMLAttributes, ReactNode, FC } from 'react';
import { clsx } from 'clsx';

interface IFormProps extends FormHTMLAttributes<HTMLFormElement> {
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    className?: string;
    children: ReactNode;
}

export const Form: FC<IFormProps> = ({ onSubmit, children, className, ...props }) => {
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) await onSubmit(e);
    };

    return (
        <form {...props} onSubmit={handleSubmit} className={clsx('flex flex-col gap-4', className)}>
            {children}
        </form>
    );
};
