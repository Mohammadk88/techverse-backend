#!/usr/bin/env tsx

import { PrismaClient, user_roles } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Mini Projects seed process...');
  console.log('📅 Seed Date:', new Date().toISOString());

  // Clear existing data in dependency order
  console.log('🧹 Cleaning existing data...');
  
  // Clean project-related data first
  await prisma.task_payments.deleteMany();
  await prisma.task_assignments.deleteMany();
  await prisma.task_applications.deleteMany();
  await prisma.project_tasks.deleteMany();
  await prisma.projects.deleteMany();
  
  // Clean other data
  await prisma.article_tag_relations.deleteMany();
  await prisma.bookmarks.deleteMany();
  await prisma.cafe_posts.deleteMany();
  await prisma.cafe_members.deleteMany();
  await prisma.cafes.deleteMany();
  await prisma.articles.deleteMany();
  await prisma.article_tags.deleteMany();
  await prisma.article_categories.deleteMany();
  await prisma.user_cafe_roles.deleteMany();
  await prisma.user_global_roles.deleteMany();
  await prisma.cafe_roles.deleteMany();
  await prisma.global_roles.deleteMany();
  await prisma.ai_keys.deleteMany();
  await prisma.users.deleteMany();
  await prisma.cities.deleteMany();
  await prisma.countries.deleteMany();
  await prisma.languages.deleteMany();

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
    const language = await prisma.languages.create({ 
      data: {
        ...lang,
        native_name: lang.nativeName,
        updated_at: new Date()
      }
    });
    createdLanguages.push(language);
  }

  // 2. Seed Countries
  console.log('🏁 Seeding countries...');
  const countries = [
    { name: 'United States', code: 'US', language_id: createdLanguages[0].id },
    { name: 'Syria', code: 'SY', language_id: createdLanguages[1].id },
    { name: 'Turkey', code: 'TR', language_id: createdLanguages[2].id },
    { name: 'France', code: 'FR', language_id: createdLanguages[3].id },
    { name: 'Spain', code: 'ES', language_id: createdLanguages[4].id },
    { name: 'Saudi Arabia', code: 'SA', language_id: createdLanguages[1].id },
  ];

  const createdCountries: any[] = [];
  for (const country of countries) {
    const createdCountry = await prisma.countries.create({ 
      data: {
        ...country,
        updated_at: new Date()
      }
    });
    createdCountries.push(createdCountry);
  }

  // 3. Seed Cities
  console.log('🏙️ Seeding cities...');
  const cities = [
    { name: 'New York', country_id: createdCountries[0].id },
    { name: 'Damascus', country_id: createdCountries[1].id },
    { name: 'Istanbul', country_id: createdCountries[2].id },
    { name: 'Paris', country_id: createdCountries[3].id },
    { name: 'Madrid', country_id: createdCountries[4].id },
    { name: 'Riyadh', country_id: createdCountries[5].id },
  ];

  const createdCities: any[] = [];
  for (const city of cities) {
    const createdCity = await prisma.cities.create({ 
      data: {
        ...city,
        updated_at: new Date()
      }
    });
    createdCities.push(createdCity);
  }

  // 4. Seed Users
  console.log('👥 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users: any[] = [];
  const userRoles = [user_roles.MEMBER, user_roles.THINKER, user_roles.JOURNALIST, user_roles.BARISTA];
  
  for (let i = 0; i < 20; i++) {
    const randomLanguage = faker.helpers.arrayElement(createdLanguages);
    const randomCountry = faker.helpers.arrayElement(createdCountries);
    const randomCity = faker.helpers.arrayElement(createdCities);
    
    const user = await prisma.users.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        username: faker.internet.username(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.paragraph(2),
        role: faker.helpers.arrayElement(userRoles),
        xp: faker.number.int({ min: 0, max: 1000 }),
        tech_coin: faker.number.int({ min: 50, max: 500 }), // Random TechCoin balance
        language_id: randomLanguage.id,
        country_id: randomCountry.id,
        city_id: randomCity.id,
        is_active: true,
        email_verified: faker.datatype.boolean(0.9),
        created_at: faker.date.past({ years: 2 }),
        updated_at: new Date(),
      },
    });
    users.push(user);
  }

  // Create admin user
  const adminUser = await prisma.users.create({
    data: {
      email: 'admin@techverse.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      username: 'admin',
      avatar: faker.image.avatar(),
      bio: 'TechVerse Platform Administrator - Building the future of tech communities',
      role: user_roles.BARISTA,
      xp: 5000,
      tech_coin: 1000, // Admin gets more TechCoin
      language_id: createdLanguages[0].id,
      country_id: createdCountries[0].id,
      city_id: createdCities[0].id,
      is_active: true,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
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
    const project = await prisma.projects.create({
      data: {
        title: faker.helpers.arrayElement(projectTitles),
        description: faker.lorem.paragraphs(2),
        is_public: faker.datatype.boolean(0.8), // 80% public
        status: faker.helpers.arrayElement(['OPEN', 'IN_PROGRESS', 'COMPLETED']),
        owner_id: owner.id,
        created_at: faker.date.past({ years: 1 }),
        updated_at: new Date(),
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
      const task = await prisma.project_tasks.create({
        data: {
          title: faker.helpers.arrayElement(taskTitles),
          description: faker.lorem.paragraphs(1),
          price: faker.number.int({ min: 10, max: 200 }), // 10-200 TechCoin
          status: faker.helpers.arrayElement(['PENDING', 'ASSIGNED', 'DONE']),
          project_id: project.id,
          created_at: faker.date.between({ from: project.created_at, to: new Date() }),
          updated_at: new Date(),
        },
      });

      // Add some applications for pending tasks
      if (task.status === 'PENDING') {
        const numApplications = faker.number.int({ min: 0, max: 3 });
        for (let j = 0; j < numApplications; j++) {
          const applicant = faker.helpers.arrayElement(users.filter(u => u.id !== project.ownerId));
          try {
            await prisma.task_applications.create({
              data: {
                task_id: task.id,
                applicant_id: applicant.id,
                message: faker.lorem.paragraph(),
                created_at: faker.date.between({ from: task.created_at, to: new Date() }),
              },
            });
          } catch (_error) {
            // Skip if user already applied
          }
        }
      }

      // Add assignments for assigned/done tasks
      if (task.status === 'ASSIGNED' || task.status === 'DONE') {
        const assignee = faker.helpers.arrayElement(users.filter(u => u.id !== project.owner_id));
        await prisma.task_assignments.create({
          data: {
            task_id: task.id,
            user_id: assignee.id,
            assigned_at: faker.date.between({ from: task.created_at, to: new Date() }),
          },
        });

        // Add payment record
        await prisma.task_payments.create({
          data: {
            task_id: task.id,
            user_id: assignee.id,
            amount: task.price,
            is_paid: task.status === 'DONE',
            paid_at: task.status === 'DONE' ? faker.date.between({ from: task.created_at, to: new Date() }) : null,
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
