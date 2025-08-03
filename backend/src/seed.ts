import { prisma } from '@/utils/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = 'admin123456'; // Change this in production

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true
      }
    });

    console.log(`✅ Admin user created: ${admin.email}`);
    console.log(`🔑 Admin password: ${adminPassword}`);
    console.log('⚠️  Please change the admin password after first login!');
  } else {
    console.log(`ℹ️  Admin user already exists: ${existingAdmin.email}`);
  }

  console.log('🌱 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });