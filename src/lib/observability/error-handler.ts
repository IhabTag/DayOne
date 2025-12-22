import { NextResponse } from 'next/server';
import { logger } from './logger';

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public fields?: Record<string, string[]>) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests', public resetAt?: Date) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}

interface ErrorResponse {
    error: string;
    code?: string;
    fields?: Record<string, string[]>;
}

/**
 * Handle errors in API routes
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
    if (error instanceof AppError) {
        logger.warn(`API Error: ${error.message}`, {
            code: error.code,
            statusCode: error.statusCode,
        });

        const response: ErrorResponse = {
            error: error.message,
            code: error.code,
        };

        if (error instanceof ValidationError && error.fields) {
            response.fields = error.fields;
        }

        const headers: Record<string, string> = {};
        if (error instanceof RateLimitError && error.resetAt) {
            headers['Retry-After'] = Math.ceil(
                (error.resetAt.getTime() - Date.now()) / 1000
            ).toString();
        }

        return NextResponse.json(response, {
            status: error.statusCode,
            headers,
        });
    }

    // Unknown error
    logger.error('Unexpected error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
    });

    // Don't expose internal errors in production
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error instanceof Error
                ? error.message
                : 'Unknown error';

    return NextResponse.json(
        { error: message },
        { status: 500 }
    );
}

/**
 * Hook for external error reporting (e.g., Sentry)
 * Implement this based on your error reporting service
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
    // TODO: Integrate with Sentry, Bugsnag, etc.
    logger.error('Error reported', {
        error: error.message,
        stack: error.stack,
        ...context,
    });
}
