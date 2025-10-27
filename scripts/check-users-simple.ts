// scripts/check-users-simple.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Checking current users and roles...');
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    console.log('='.repeat(50));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('---');
    });
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create an account first.');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers()
  .finally(async () => {
    await prisma.$disconnect();
  });