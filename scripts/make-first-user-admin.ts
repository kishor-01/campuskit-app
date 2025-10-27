// scripts/make-first-user-admin.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function makeFirstUserAdmin() {
  console.log('👑 Making first user admin...');
  
  try {
    // Get the first user (your newly created account)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      take: 1
    });
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create an account first!');
      return;
    }
    
    const user = users[0];
    console.log(`📧 Found user: ${user.email}`);
    
    // Make this user an admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
      select: { email: true, username: true, role: true }
    });
    
    console.log('✅ Success! User is now admin:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Role: ${updatedUser.role}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

makeFirstUserAdmin()
  .finally(async () => {
    await prisma.$disconnect();
  });