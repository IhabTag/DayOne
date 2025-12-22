SaaS Starter Kit - Task Breakdown
Phase 1: Project Foundation
 Create project structure and initialize Next.js application
 Set up TypeScript configuration
 Configure ESLint and Prettier
Install additional dependencies (Prisma, bcryptjs, nodemailer, etc.)
 Set up database schema with Prisma
 Create Docker Compose configuration
Phase 2: Database & Models
 Define User model with roles, verification, plan status
 Define Session model for authentication
 Define AuditLog model for tracking changes
 Define VerificationToken model
 Define PasswordResetToken model
 Create initial migration
Phase 3: Authentication System
 Implement signup with email + password
 Implement email verification flow
 Implement login with rate limiting
 Implement forgot password + reset password
 Implement change password
 Implement change email (with re-verification)
 Implement logout
 Add brute-force protection
 Prevent user enumeration in auth errors
Phase 4: Authorization & RBAC
 Create middleware: requiresAuth
 Create middleware: requiresVerifiedEmail
 Create middleware: requiresSuperadmin
 Implement role-based route guards
 Create entitlements/featureFlags layer for plans
Phase 5: Email System
 Set up SMTP email service
 Create email templates (HTML + plaintext)
 Verify email template
 Password reset template
 Change email verification template
 Implement secure token generation with expiry
Phase 6: Subscription & Reverse Trial
 Implement plan logic (basic/pro)
 Implement 14-day reverse trial on signup
 Create automatic downgrade mechanism
 Build UI for trial status display
 Create gated feature pages for plan enforcement
Phase 7: Public Pages
 Create landing page
 Create pricing page (stub)
 Create public navigation
Phase 8: Auth UI Pages
 Sign up page
 Login page (with unverified user handling)
 Email verification pending page
 Password reset request page
 Password reset page
 Verification resend functionality
Phase 9: User Dashboard & Profile
 User dashboard (gated)
 Profile management page
 Change password UI
 Change email UI
 Plan/trial status display
 Session management (optional)
Phase 10: Superadmin Dashboard
 Admin layout and navigation
 Users list with search/filter/sort
 User detail page
 Role management
 Account status management (active/deactivated)
 Plan controls (upgrade/downgrade)
 Trial date extension
 Audit log timeline per user
 Global audit logs page with filters
 System health page
Phase 11: Observability
 Structured request logging
 Centralized error handling
 Audit logging implementation
 Error reporting hook (integration-ready)
Phase 12: Data Retention & GDPR
 Implement hard delete for users
 Ensure cascading deletion of related data
 Design audit logs to minimize PII
Phase 13: Deployment & DevOps
 Complete Docker Compose setup
 Add MailHog for local SMTP testing
 Create .env.example
 Implement superadmin seeding from env vars
 Create migration scripts
 Create seed scripts
 Write README with setup instructions
Phase 14: Testing & Verification
 Basic integration tests for auth
 RBAC enforcement tests
 Trial downgrade logic tests
 End-to-end verification of acceptance criteria
