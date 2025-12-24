import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Password strength validation
 */
export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
        errors.push('Password must be at most 128 characters long');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
