# DayOne - SaaS Starter Kit
<img width="1920" height="1031" alt="image" src="https://github.com/user-attachments/assets/9688754c-a77f-4b02-a507-6275fc58791a" />

A production-ready SaaS web application starter built with Next.js 15, featuring secure authentication (Password + Google OAuth), role-based access control, subscription management with reverse trial, referral system, and a comprehensive admin dashboard.

## Features

### 🔐 Authentication & Onboarding
- **Dual Auth Strategies**:
  - Email/password authentication with bcrypt hashing
  - Google OAuth 2.0 integration
- **Secure Flows**:
  - Email verification with expiring tokens
  - Password reset with secure tokens
  - Change email with confirmation flow
  - Rate limiting and brute-force protection
  - Session management with secure HTTP-only cookies
- **Onboarding Experience**:
  - Collection of user details (Job Function, Referral Source)
  - Seamless referral tracking

### 👥 Role-Based Access Control (RBAC)
- **Guest**: Public pages only
- **User**: Access to dashboard and user features
- **Superadmin**: Full admin panel access

### 💳 Subscription & Trial System
- 14-day reverse trial (starts on Pro, downgrades to Basic)
- Automatic trial expiration processing via cron
- Admin override for manual plan assignments
- Feature gating based on plan
- Usage limits per plan

### 🔗 Referral System
- Unique referral links for every user
- "Sticky" cookies to track referrals across sessions
- Admin dashboard for tracking referral performance
- Automated attribution upon signup

### 🎛️ Superadmin Dashboard
- **User Management**: Search, filter, and sort users
- **User Details**: Role/status/plan controls and audit timelines
- **Referral Management**: Track global referral stats
- **System Health**: Monitoring and observability features
- **Global Audit Logs**: Comprehensive system-wide activity log

### 📧 Email System
- SMTP integration with Nodemailer
- HTML email templates
- Support for MailHog in development

### 📊 Observability
- Structured audit logging
- Centralized error handling
- Request logging middleware
- PostHog Analytics integration ready

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Auth**: Custom implementation + Google OAuth 2.0
- **Email**: Nodemailer
- **Validation**: Zod
- **Analytics**: PostHog

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saas-starter-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`: Initial admin credentials
   - `GOOGLE_...`: Google OAuth credentials (optional)
   - SMTP settings for email

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database (creates superadmin)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Using Docker for Local Development

To run the required services (PostgreSQL and MailHog) locally without installing them directly on your machine, use the local Docker Compose file:

1. **Start Local Services**
   ```bash
   # Starts PostgreSQL and MailHog
   docker-compose -f docker-compose-local.yml up -d
   ```

2. **Access Services**
   - **Database**: `localhost:5432`
   - **MailHog (Email Testing)**: [http://localhost:8025](http://localhost:8025) - View all emails sent by the app here.

3. **Run the App**
   ```bash
   npm run dev
   ```

> **Note**: The standard `docker-compose.yml` file is intended for **production deployment**, which builds and runs the entire application container. For local development, always use `docker-compose-local.yml`.

## 🚀 Build in 48 Hours with AI

This starter kit is architected to be the perfect foundation for AI Agentic IDEs (like **Google's Antigravity**, Cursor, or Windsurf).

**Why this kit + AI = Speed:**
- **Standardized Patterns**: The code follows strict, predictable patterns that AI models understand easily.
- **Type Safety**: Full TypeScript support helps AI avoid hallucinations and syntax errors.
- **Modular Structure**: AI can easily locate and modify specific components (auth, payments, UI) without breaking the whole system.

**Suggested Workflow:**
1. **Load the Context**: Open this project in your AI IDE.
2. **Prompt with Intent**: "Create a new 'Projects' page with a list view and a 'Create' modal using the existing UI components."
3. **Iterate**: The AI will leverage the existing `src/components/ui` and database schema to build features 10x faster.
4. **Deploy**: Ship your MVP in record time.

## Project Structure

```
src/
├── app/
│   ├── [referrerSlug]/     # Dynamic referral link handling
│   ├── admin/              # Superadmin dashboard pages
│   │   ├── audit-logs/     # Global audit logs
│   │   ├── health/         # System health
│   │   └── users/          # User management
│   ├── api/                # API routes
│   │   ├── admin/          # Admin-only endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   └── cron/           # Cron job endpoints
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # User dashboard pages
│   └── pricing/            # Pricing page
├── components/
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── auth/               # Auth logic (Google, Password, Session)
│   ├── email/              # Email system
│   ├── observability/      # Logging and error handling
│   ├── plans/              # Subscription logic
│   └── rbac/               # Role-based access control
└── middleware.ts           # Route protection & Referral tracking
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |

## Environment Variables

See `.env.example` for all available configuration options.

### Key Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | Application URL (e.g., http://localhost:3000) |
| `SESSION_SECRET` | Secret for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `SMTP_HOST` | SMTP server host |

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Initiate Google Login
- `GET /api/auth/google/callback` - Google Login Callback
- ... plus password reset, email verification, etc.

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- ... plus user management, audit logs, health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
