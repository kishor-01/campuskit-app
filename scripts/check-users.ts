// scripts/check-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Checking current users...');
  
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
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.username}): ${user.role}`);
  });
}

checkUsers()
  .finally(async () => {
    await prisma.$disconnect();
  });