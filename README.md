# SaaS Starter Kit

A production-ready SaaS web application starter built with Next.js 15, featuring secure authentication, role-based access control, subscription management with reverse trial, and a comprehensive admin dashboard.

## Features

### 🔐 Authentication
- Email/password authentication with bcrypt hashing
- Email verification with expiring tokens
- Password reset with secure tokens
- Change email with confirmation flow
- Rate limiting and brute-force protection
- Session management with secure HTTP-only cookies

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

### 🎛️ Superadmin Dashboard
- User management with search, filter, and sort
- User detail view with role/status/plan controls
- Trial extension capabilities
- Per-user audit log timeline
- Global audit logs with filtering
- System health monitoring

### 📧 Email System
- SMTP integration with Nodemailer
- HTML email templates
- Support for MailHog in development

### 📊 Observability
- Structured audit logging
- Centralized error handling
- Request logging middleware

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Auth**: Custom implementation (no third-party deps)
- **Email**: Nodemailer
- **Validation**: Zod

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

### Using Docker

A Docker Compose setup is provided for local development:

```bash
# Start PostgreSQL and MailHog
docker-compose up -d

# The database will be available at localhost:5432
# MailHog UI will be available at http://localhost:8025
```

## Project Structure

```
src/
├── app/
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
│   ├── auth/               # Authentication logic
│   ├── email/              # Email system
│   ├── observability/      # Logging and error handling
│   ├── plans/              # Subscription logic
│   └── rbac/               # Role-based access control
└── middleware.ts           # Route protection
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

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | Application URL |
| `SESSION_SECRET` | Secret for session encryption |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_FROM` | From email address |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUPERADMIN_EMAIL` | - | Initial superadmin email |
| `SUPERADMIN_PASSWORD` | - | Initial superadmin password |
| `TRIAL_DURATION_DAYS` | 14 | Trial period length |
| `SESSION_EXPIRY_HOURS` | 24 | Session duration |
| `SEED_DEMO_USERS` | false | Create demo users in dev |

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update profile
- `POST /api/auth/verify-email` - Verify email token
- `POST /api/auth/resend-verification` - Resend verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/change-email` - Request email change
- `POST /api/auth/confirm-email-change` - Confirm email change

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/users/[id]` - Get user details
- `PATCH /api/admin/users/[id]` - Update user
- `GET /api/admin/users/[id]/audit-logs` - User audit logs
- `GET /api/admin/audit-logs` - Global audit logs
- `GET /api/admin/health` - System health

### Cron
- `GET /api/cron/process-trials` - Process expired trials

## Plan Features

### Basic Plan
- 3 Projects
- 1 Team member
- 1 GB Storage

### Pro Plan
- Unlimited Projects
- Up to 10 Team members
- 100 GB Storage
- Advanced Analytics
- Priority Support
- Data Export
- API Access
- Custom Branding

## Security Features

- Password hashing with bcrypt
- Secure session cookies (HTTP-only, SameSite)
- CSRF protection
- Rate limiting on sensitive endpoints
- Brute-force protection
- Token expiration
- Audit logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
