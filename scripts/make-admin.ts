// scripts/make-admin.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Replace this with your actual email or username
const ADMIN_EMAIL = 'your-email@example.com'; // CHANGE THIS!
// OR use username:
// const ADMIN_USERNAME = 'your-username'; // CHANGE THIS!

async function makeAdmin() {
  try {
    console.log('👑 Making user admin...');
    
    const user = await prisma.user.update({
      where: { 
        email: ADMIN_EMAIL 
        // OR use: username: ADMIN_USERNAME
      },
      data: { role: Role.ADMIN },
      select: { id: true, email: true, username: true, role: true }
    });
    
    console.log('✅ Success! User is now admin:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log('❌ User not found. Available users:');
      const users = await prisma.user.findMany({
        select: { email: true, username: true }
      });
      users.forEach(u => console.log(`   - ${u.email} (${u.username})`));
    } else {
      console.error('❌ Error:', error);
    }
  }
}

makeAdmin()
  .finally(async () => {
    await prisma.$disconnect();
  });