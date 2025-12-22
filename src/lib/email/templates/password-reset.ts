import { baseLayout } from './base-layout';

interface PasswordResetParams {
    name: string;
    resetUrl: string;
}

export function passwordResetTemplate({ name, resetUrl }: PasswordResetParams) {
    const displayName = name || 'there';

    const html = baseLayout({
        title: 'Reset your password',
        preheader: 'You requested a password reset',
        content: `
      <h1>Reset your password</h1>
      <p>Hi ${displayName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p class="muted">This link will expire in 1 hour.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="link">${resetUrl}</p>
      <p class="muted">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `,
    });

    const text = `
Reset your password

Hi ${displayName},

We received a request to reset your password. Visit the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
  `.trim();

    return { html, text };
}
