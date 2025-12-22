import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
        const variants = {
            default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            outline: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
        };

        const sizes = {
            sm: 'text-xs px-2 py-0.5',
            md: 'text-sm px-2.5 py-1',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center font-medium rounded-full',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
