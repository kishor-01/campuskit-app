// scripts/check-schema.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Check if User table has role column by trying to select without it
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        // Don't select role - we want to see if basic query works
      },
      take: 5
    });
    
    console.log('✅ Basic user query works');
    console.log(`📊 Found ${users.length} users`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.username})`);
    });
    
    // Now try to see what columns exist
    console.log('\n🔍 Checking User table structure...');
    const sampleUser = await prisma.user.findFirst();
    if (sampleUser) {
      console.log('User record sample:', Object.keys(sampleUser));
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema()
  .finally(async () => {
    await prisma.$disconnect();
  });