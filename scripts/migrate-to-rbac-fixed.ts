// scripts/migrate-to-rbac-fixed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToRBAC() {
  console.log('🧩 Starting RBAC migration (fixed version)...');
  
  try {
    // Step 1: Check current state
    console.log('📝 Checking current user roles...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });
    
    console.log(`📊 Found ${users.length} users`);
    
    // Step 2: Set default roles for all users
    // Since we can't use isAdmin, we'll set a sensible default
    // You'll need to manually set admin roles later
    
    console.log('🔄 Setting all users to VIEWER role...');
    const updatedUsers = await prisma.user.updateMany({
      data: { role: Role.VIEWER }
    });
    
    console.log(`✅ Set ${updatedUsers.count} users to VIEWER role`);
    
    // Step 3: Manual admin assignment
    console.log('\n⚠️  IMPORTANT: You need to manually assign admin roles!');
    console.log('   Run this SQL command in your database:');
    console.log('   UPDATE "User" SET role = \'ADMIN\' WHERE email = \'your-admin-email@example.com\';');
    console.log('   Or use Prisma Studio: npx prisma studio');
    
    console.log('🎉 RBAC migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateToRBAC()
  .finally(async () => {
    await prisma.$disconnect();
  });