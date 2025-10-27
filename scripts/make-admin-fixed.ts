// scripts/make-admin-fixed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Use your email from the user list
const ADMIN_EMAIL = 'me@gmail.com'; // This is your email from the logs

async function makeAdmin() {
  try {
    console.log('👑 Making user admin...');
    console.log(`   Targeting user: ${ADMIN_EMAIL}`);
    
    const user = await prisma.user.update({
      where: { 
        email: ADMIN_EMAIL
      },
      data: { role: Role.ADMIN },
      select: { id: true, email: true, username: true, role: true }
    });
    
    console.log('✅ Success! User is now admin:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    
    // Show available users if update fails
    console.log('\n📋 Available users:');
    const users = await prisma.user.findMany({
      select: { email: true, username: true, role: true }
    });
    users.forEach(u => console.log(`   - ${u.email} (${u.username}): ${u.role}`));
  }
}

makeAdmin()
  .finally(async () => {
    await prisma.$disconnect();
  });