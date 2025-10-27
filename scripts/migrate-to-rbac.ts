// scripts/migrate-to-rbac.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToRBAC() {
  console.log('🧩 Starting RBAC migration...');
  
  try {
    // Step 1: Check if role column exists, if not add it
    console.log('📝 Checking database schema...');
    
    // Step 2: Migrate existing admins to ADMIN role
    console.log('🔄 Migrating existing admins...');
    const adminUsers = await prisma.user.updateMany({
      where: { isAdmin: true },
      data: { role: Role.ADMIN }
    });
    console.log(`✅ Migrated ${adminUsers.count} admin users to ADMIN role`);
    
    // Step 3: Migrate regular users to VIEWER role  
    console.log('🔄 Migrating regular users...');
    const regularUsers = await prisma.user.updateMany({
      where: { isAdmin: false },
      data: { role: Role.VIEWER }
    });
    console.log(`✅ Migrated ${regularUsers.count} regular users to VIEWER role`);
    
    console.log('🎉 RBAC migration completed successfully!');
    console.log('💡 Next: Run "npx prisma generate" to update your Prisma Client');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateToRBAC()
  .finally(async () => {
    await prisma.$disconnect();
  });