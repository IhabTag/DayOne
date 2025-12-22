import { baseLayout } from './base-layout';

interface VerifyEmailParams {
    name: string;
    verificationUrl: string;
}

export function verifyEmailTemplate({ name, verificationUrl }: VerifyEmailParams) {
    const displayName = name || 'there';

    const html = baseLayout({
        title: 'Verify your email address',
        preheader: 'Please verify your email to complete your registration',
        content: `
      <h1>Verify your email address</h1>
      <p>Hi ${displayName},</p>
      <p>Thanks for signing up! Please verify your email address by clicking the button below.</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </p>
      <p class="muted">This link will expire in 24 hours.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="link">${verificationUrl}</p>
    `,
    });

    const text = `
Verify your email address

Hi ${displayName},

Thanks for signing up! Please verify your email address by visiting the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
  `.trim();

    return { html, text };
}
