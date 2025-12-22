import { PrismaClient } from '@/generated/prisma';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create superadmin from environment variables
    const adminEmail = process.env.SUPERADMIN_EMAIL;
    const adminPassword = process.env.SUPERADMIN_PASSWORD;
    const adminName = process.env.SUPERADMIN_NAME || 'Super Admin';

    if (!adminEmail || !adminPassword) {
        console.log('⚠️  SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD not set, skipping superadmin creation');
        console.log('   Set these environment variables to create a superadmin user');
    } else {
        // Check if superadmin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log(`✓ Superadmin already exists: ${adminEmail}`);
        } else {
            const hashedPassword = await hashPassword(adminPassword);
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 365); // 1 year trial for admin

            await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: adminName,
                    passwordHash: hashedPassword,
                    role: 'SUPERADMIN',
                    status: 'ACTIVE',
                    plan: 'PRO',
                    planOverride: true,
                    trialEndDate,
                    emailVerified: new Date(),
                },
            });

            console.log(`✓ Superadmin created: ${adminEmail}`);
        }
    }

    // Create demo users if in development
    if (process.env.NODE_ENV === 'development' && process.env.SEED_DEMO_USERS === 'true') {
        console.log('📦 Creating demo users...');

        const demoUsers = [
            {
                email: 'user@example.com',
                name: 'Demo User',
                role: 'USER' as const,
                plan: 'PRO' as const,
                planOverride: false,
            },
            {
                email: 'basic@example.com',
                name: 'Basic User',
                role: 'USER' as const,
                plan: 'BASIC' as const,
                planOverride: true,
            },
        ];

        for (const userData of demoUsers) {
            const existing = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (!existing) {
                const hashedPassword = await hashPassword('password123');
                const trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + (userData.plan === 'PRO' ? 14 : -30));

                await prisma.user.create({
                    data: {
                        ...userData,
                        passwordHash: hashedPassword,
                        status: 'ACTIVE',
                        trialEndDate,
                        emailVerified: new Date(),
                    },
                });

                console.log(`  ✓ Created: ${userData.email}`);
            } else {
                console.log(`  - Exists: ${userData.email}`);
            }
        }
    }

    console.log('✅ Database seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
