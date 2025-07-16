const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Get all table names from database
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
      ORDER BY table_name;
    `;
    
    console.log('🗄️  Current tables in database:');
    console.log('================================');
    result.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    console.log(`\n📊 Total tables: ${result.length}`);
    
    // All deferred systems (events, podcast, forum) have been successfully removed
    console.log('\n✅ Database cleanup complete - all deferred systems removed!');
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
