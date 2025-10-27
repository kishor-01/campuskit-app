// scripts/set-default-roles.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function setDefaultRoles() {
  console.log('🔄 Setting default roles for all users...');
  
  try {
    // Set all users to VIEWER role
    const result = await prisma.user.updateMany({
      data: { role: Role.VIEWER }
    });
    
    console.log(`✅ Set ${result.count} users to VIEWER role`);
    
    // Verify the update
    const users = await prisma.user.findMany({
      select: { email: true, username: true, role: true }
    });
    
    console.log('\n📊 Current users and roles:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.username}): ${user.role}`);
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
  }
}

setDefaultRoles()
  .finally(async () => {
    await prisma.$disconnect();
  });