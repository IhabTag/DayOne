const APP_NAME = 'SaaS Starter';
const PRIMARY_COLOR = '#6366f1';

interface LayoutOptions {
    title: string;
    preheader?: string;
    content: string;
}

/**
 * Base email layout with consistent branding
 */
export function baseLayout({ title, preheader, content }: LayoutOptions): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  ${preheader ? `<span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: ${PRIMARY_COLOR};
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }
    p {
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      background: ${PRIMARY_COLOR};
      color: #ffffff !important;
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background: #4f46e5;
    }
    .code {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      font-family: monospace;
      font-size: 24px;
      text-align: center;
      letter-spacing: 4px;
      margin: 16px 0;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .link {
      color: ${PRIMARY_COLOR};
      word-break: break-all;
    }
    .muted {
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">${APP_NAME}</span>
      </div>
      ${content}
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p class="muted">If you didn't request this email, you can safely ignore it.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
