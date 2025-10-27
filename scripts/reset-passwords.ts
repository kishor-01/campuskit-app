// scripts/reset-passwords.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log('🔄 Resetting passwords with proper hashing...');
  
  const users = [
    { email: 'me@kishor', password: 'kishor123' },
    { email: 'rahul@gmail.com', password: 'rahul123' }
  ];

  try {
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const updatedUser = await prisma.user.update({
        where: { email: userData.email },
        data: { password: hashedPassword },
        select: { email: true, username: true, role: true }
      });
      
      console.log(`✅ Reset password for ${updatedUser.email}`);
      console.log(`   Username: ${updatedUser.username}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Password: ${userData.password}`);
      console.log('---');
    }
    
    console.log('🎉 All passwords reset successfully!');
    console.log('🔑 Use these passwords to login:');
    console.log('   kishor: kishor123');
    console.log('   rahul: rahul123');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

resetPasswords()
  .finally(async () => {
    await prisma.$disconnect();
  });