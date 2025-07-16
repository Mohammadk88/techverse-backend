import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default global roles
  const memberRole = await prisma.globalRole.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Default member role',
    },
  });

  const adminRole = await prisma.globalRole.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role',
    },
  });

  // Create default café roles
  const cafeBarista = await prisma.cafeRole.upsert({
    where: { name: 'Barista' },
    update: {},
    create: {
      name: 'Barista',
      description: 'Café manager role',
    },
  });

  const cafeMember = await prisma.cafeRole.upsert({
    where: { name: 'Member' },
    update: {},
    create: {
      name: 'Member',
      description: 'Café member role',
    },
  });

  console.log('✅ Default roles created successfully!');
  console.log('- Member role:', memberRole);
  console.log('- Admin role:', adminRole);
  console.log('- Barista role:', cafeBarista);
  console.log('- Café Member role:', cafeMember);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    return prisma.$disconnect();
  });
