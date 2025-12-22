import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
        : undefined,
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@example.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
    try {
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('SMTP connection failed:', error);
        return false;
    }
}

export default transporter;
