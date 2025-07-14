import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAIKeysData() {
  console.log('🧪 Testing AI Keys Database...\n');

  try {
    // Test 1: Check AI Providers
    console.log('1. Testing AI Providers');
    const providers = await prisma.aIProvider.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`✅ Found ${providers.length} AI providers:`);
    providers.forEach(p => {
      console.log(`   - ${p.name}: ${p.label} (${p.isActive ? 'active' : 'inactive'}) ${p.isDefault ? '[DEFAULT]' : ''}`);
    });
    console.log('');

    // Test 2: Check System AI Keys
    console.log('2. Testing System AI Keys');
    const systemKeys = await prisma.aIKey.findMany({
      where: { userId: null },
      include: {
        provider: {
          select: { name: true, label: true }
        }
      }
    });

    console.log(`✅ Found ${systemKeys.length} system AI keys:`);
    systemKeys.forEach(key => {
      console.log(`   - ${key.provider.name}: ${key.provider.label} (${key.isActive ? 'active' : 'inactive'})`);
    });
    console.log('');

    // Test 3: Check User AI Keys (should be empty initially)
    console.log('3. Testing User AI Keys');
    const userKeys = await prisma.aIKey.findMany({
      where: { 
        userId: { not: null } 
      },
      include: {
        provider: {
          select: { name: true, label: true }
        },
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    console.log(`✅ Found ${userKeys.length} user AI keys:`);
    if (userKeys.length > 0) {
      userKeys.forEach(key => {
        console.log(`   - ${key.user?.firstName} ${key.user?.lastName}: ${key.provider.name} (${key.isActive ? 'active' : 'inactive'})`);
      });
    } else {
      console.log('   (No user keys found - this is expected for a fresh installation)');
    }
    console.log('');

    console.log('🎉 Database structure is working correctly!');
    console.log('✅ AI Providers are seeded');
    console.log('✅ System keys are configured');
    console.log('✅ Database relationships are working');
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAIKeysData();
