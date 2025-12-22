import { baseLayout } from './base-layout';

interface EmailChangeParams {
    name: string;
    newEmail: string;
    confirmUrl: string;
}

export function emailChangeTemplate({ name, newEmail, confirmUrl }: EmailChangeParams) {
    const displayName = name || 'there';

    const html = baseLayout({
        title: 'Confirm your new email address',
        preheader: 'Please confirm your email address change',
        content: `
      <h1>Confirm your new email address</h1>
      <p>Hi ${displayName},</p>
      <p>You requested to change your email address to <strong>${newEmail}</strong>.</p>
      <p>Click the button below to confirm this change:</p>
      <p style="text-align: center;">
        <a href="${confirmUrl}" class="button">Confirm New Email</a>
      </p>
      <p class="muted">This link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="link">${confirmUrl}</p>
      <p class="muted">If you didn't request this change, please ignore this email and consider changing your password.</p>
    `,
    });

    const text = `
Confirm your new email address

Hi ${displayName},

You requested to change your email address to ${newEmail}.

Visit the link below to confirm this change:

${confirmUrl}

This link will expire in 24 hours.

If you didn't request this change, please ignore this email and consider changing your password.
  `.trim();

    return { html, text };
}
