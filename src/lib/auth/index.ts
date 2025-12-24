// Password utilities
export { hashPassword, verifyPassword, validatePasswordStrength } from './password';
export type { PasswordValidationResult } from './password';

// Token utilities
export {
    generateSessionToken,
    generateVerificationToken,
    generatePasswordResetToken,
    generateEmailChangeToken,
    getTokenExpiry,
    isTokenExpired,
} from './tokens';

// Session management
export {
    createSession,
    getSession,
    getCurrentUser,
    destroySession,
    destroyCurrentSession,
    destroyAllUserSessions,
    getUserSessions,
    extendSession,
    cleanupExpiredSessions,
} from './session';
export type { SessionUser } from './session';

// Rate limiting
export {
    checkRateLimit,
    incrementRateLimit,
    resetRateLimit,
    cleanupExpiredRateLimits,
    getRateLimitHeaders,
} from './rate-limit';
export type { RateLimitResult } from './rate-limit';

// OAuth configuration
export {
    isGoogleOAuthEnabled,
    getGoogleOAuthConfig,
    isGoogleSignupAllowed,
    shouldAutoVerifyGoogleEmail,
} from './oauth-config';
export type { GoogleOAuthConfig } from './oauth-config';

// Google OAuth
export {
    generateOAuthState,
    validateOAuthState,
    generateGoogleAuthUrl,
    exchangeCodeForTokens,
    verifyGoogleIdToken,
    getGoogleUserProfile,
} from './google-oauth';
export type { GoogleUserProfile, GoogleTokens } from './google-oauth';
