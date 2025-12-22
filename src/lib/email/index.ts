// Email client
export { sendEmail, verifyEmailConnection } from './client';
export type { EmailOptions } from './client';

// Templates
export { verifyEmailTemplate } from './templates/verify-email';
export { passwordResetTemplate } from './templates/password-reset';
export { emailChangeTemplate } from './templates/email-change';
export { baseLayout } from './templates/base-layout';
