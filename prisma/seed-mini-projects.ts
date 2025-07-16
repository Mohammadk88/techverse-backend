#!/usr/bin/env tsx

import { PrismaClient, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Mini Projects seed process...');
  console.log('📅 Seed Date:', new Date().toISOString());

  // Clear existing data in dependency order
  console.log('🧹 Cleaning existing data...');
  
  // Clean project-related data first
  await prisma.taskPayment.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.taskApplication.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.project.deleteMany();
  
  // Clean other data
  await prisma.articleTagRelation.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.cafePost.deleteMany();
  await prisma.cafeMember.deleteMany();
  await prisma.cafe.deleteMany();
  await prisma.article.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.articleCategory.deleteMany();
  await prisma.userCafeRole.deleteMany();
  await prisma.userGlobalRole.deleteMany();
  await prisma.cafeRole.deleteMany();
  await prisma.globalRole.deleteMany();
  await prisma.aIKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.language.deleteMany();

  // 1. Seed Languages
  console.log('🌍 Seeding languages...');
  const languages = [
    { name: 'English', nativeName: 'English', code: 'en', direction: 'ltr' },
    { name: 'Arabic', nativeName: 'العربية', code: 'ar', direction: 'rtl' },
    { name: 'Turkish', nativeName: 'Türkçe', code: 'tr', direction: 'ltr' },
    { name: 'French', nativeName: 'Français', code: 'fr', direction: 'ltr' },
    { name: 'Spanish', nativeName: 'Español', code: 'es', direction: 'ltr' },
  ];

  const createdLanguages: any[] = [];
  for (const lang of languages) {
    const language = await prisma.language.create({ data: lang });
    createdLanguages.push(language);
  }

  // 2. Seed Countries
  console.log('🏁 Seeding countries...');
  const countries = [
    { name: 'United States', code: 'US', languageId: createdLanguages[0].id },
    { name: 'Syria', code: 'SY', languageId: createdLanguages[1].id },
    { name: 'Turkey', code: 'TR', languageId: createdLanguages[2].id },
    { name: 'France', code: 'FR', languageId: createdLanguages[3].id },
    { name: 'Spain', code: 'ES', languageId: createdLanguages[4].id },
    { name: 'Saudi Arabia', code: 'SA', languageId: createdLanguages[1].id },
  ];

  const createdCountries: any[] = [];
  for (const country of countries) {
    const createdCountry = await prisma.country.create({ data: country });
    createdCountries.push(createdCountry);
  }

  // 3. Seed Cities
  console.log('🏙️ Seeding cities...');
  const cities = [
    { name: 'New York', countryId: createdCountries[0].id },
    { name: 'Damascus', countryId: createdCountries[1].id },
    { name: 'Istanbul', countryId: createdCountries[2].id },
    { name: 'Paris', countryId: createdCountries[3].id },
    { name: 'Madrid', countryId: createdCountries[4].id },
    { name: 'Riyadh', countryId: createdCountries[5].id },
  ];

  const createdCities: any[] = [];
  for (const city of cities) {
    const createdCity = await prisma.city.create({ data: city });
    createdCities.push(createdCity);
  }

  // 4. Seed Users
  console.log('👥 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users: any[] = [];
  const userRoles = [UserRole.MEMBER, UserRole.THINKER, UserRole.JOURNALIST, UserRole.BARISTA];
  
  for (let i = 0; i < 20; i++) {
    const randomLanguage = faker.helpers.arrayElement(createdLanguages);
    const randomCountry = faker.helpers.arrayElement(createdCountries);
    const randomCity = faker.helpers.arrayElement(createdCities);
    
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: faker.internet.username(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.paragraph(2),
        role: faker.helpers.arrayElement(userRoles),
        xp: faker.number.int({ min: 0, max: 1000 }),
        techCoin: faker.number.int({ min: 50, max: 500 }), // Random TechCoin balance
        languageId: randomLanguage.id,
        countryId: randomCountry.id,
        cityId: randomCity.id,
        isActive: true,
        emailVerified: faker.datatype.boolean(0.9),
        createdAt: faker.date.past({ years: 2 }),
      },
    });
    users.push(user);
  }

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@techverse.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      avatar: faker.image.avatar(),
      bio: 'TechVerse Platform Administrator - Building the future of tech communities',
      role: UserRole.BARISTA,
      xp: 5000,
      techCoin: 1000, // Admin gets more TechCoin
      languageId: createdLanguages[0].id,
      countryId: createdCountries[0].id,
      cityId: createdCities[0].id,
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
    },
  });
  users.push(adminUser);

  // 5. Seed Projects
  console.log('🚀 Seeding projects...');
  const projects: any[] = [];
  const projectTitles = [
    'E-commerce Website Development',
    'Mobile App for Food Delivery',
    'React Dashboard for Analytics',
    'REST API for Task Management',
    'Vue.js Frontend for CRM',
    'Node.js Microservices Architecture',
    'Python Data Analysis Tool',
    'Flutter Cross-platform App',
    'Angular Admin Panel',
    'Express.js Backend Service',
  ];

  for (let i = 0; i < 10; i++) {
    const owner = faker.helpers.arrayElement(users);
    const project = await prisma.project.create({
      data: {
        title: faker.helpers.arrayElement(projectTitles),
        description: faker.lorem.paragraphs(2),
        isPublic: faker.datatype.boolean(0.8), // 80% public
        status: faker.helpers.arrayElement(['OPEN', 'IN_PROGRESS', 'COMPLETED']),
        ownerId: owner.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    });
    projects.push(project);
  }

  // 6. Seed Tasks
  console.log('📋 Seeding tasks...');
  const taskTitles = [
    'Setup authentication system',
    'Create user dashboard',
    'Implement payment gateway',
    'Design responsive layouts',
    'Build REST API endpoints',
    'Add search functionality',
    'Integrate third-party services',
    'Write unit tests',
    'Configure deployment pipeline',
    'Optimize database queries',
    'Create admin panel',
    'Implement real-time features',
    'Add data validation',
    'Setup monitoring system',
    'Create documentation',
  ];

  for (const project of projects) {
    const numTasks = faker.number.int({ min: 2, max: 6 });
    for (let i = 0; i < numTasks; i++) {
      const task = await prisma.projectTask.create({
        data: {
          title: faker.helpers.arrayElement(taskTitles),
          description: faker.lorem.paragraphs(1),
          price: faker.number.int({ min: 10, max: 200 }), // 10-200 TechCoin
          status: faker.helpers.arrayElement(['PENDING', 'ASSIGNED', 'DONE']),
          projectId: project.id,
          createdAt: faker.date.between({ from: project.createdAt, to: new Date() }),
        },
      });

      // Add some applications for pending tasks
      if (task.status === 'PENDING') {
        const numApplications = faker.number.int({ min: 0, max: 3 });
        for (let j = 0; j < numApplications; j++) {
          const applicant = faker.helpers.arrayElement(users.filter(u => u.id !== project.ownerId));
          try {
            await prisma.taskApplication.create({
              data: {
                taskId: task.id,
                applicantId: applicant.id,
                message: faker.lorem.paragraph(),
                createdAt: faker.date.between({ from: task.createdAt, to: new Date() }),
              },
            });
          } catch (error) {
            // Skip if user already applied
          }
        }
      }

      // Add assignments for assigned/done tasks
      if (task.status === 'ASSIGNED' || task.status === 'DONE') {
        const assignee = faker.helpers.arrayElement(users.filter(u => u.id !== project.ownerId));
        await prisma.taskAssignment.create({
          data: {
            taskId: task.id,
            userId: assignee.id,
            assignedAt: faker.date.between({ from: task.createdAt, to: new Date() }),
          },
        });

        // Add payment record
        await prisma.taskPayment.create({
          data: {
            taskId: task.id,
            userId: assignee.id,
            amount: task.price,
            isPaid: task.status === 'DONE',
            paidAt: task.status === 'DONE' ? faker.date.between({ from: task.createdAt, to: new Date() }) : null,
          },
        });
      }
    }
  }

  // Print summary
  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`   👤 Users: ${users.length} (including admin)`);
  console.log(`   🌍 Languages: ${createdLanguages.length}`);
  console.log(`   🏁 Countries: ${createdCountries.length}`);
  console.log(`   🏙️  Cities: ${createdCities.length}`);
  console.log(`   🚀 Projects: ${projects.length}`);
  console.log(`   📋 Tasks: Various tasks with applications and assignments`);
  
  console.log('\n🔑 Admin Login Info:');
  console.log('   📧 Email: admin@techverse.com');
  console.log('   🔒 Password: password123');
  console.log('   🌐 Role: BARISTA (Full Platform Access)');
  console.log('   💰 TechCoin Balance: 1000');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Start your server: npm run start:dev');
  console.log('   2. Visit the API docs: http://localhost:4040/api/docs');
  console.log('   3. Login with admin credentials to test all features');
  console.log('   4. Create projects, add tasks, and test the mini projects system!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
