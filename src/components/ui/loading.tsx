'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <svg
                className={cn('animate-spin text-indigo-600', sizes[size])}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loading size="lg" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        </div>
    );
}

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <Loading size="lg" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        </div>
    );
}
