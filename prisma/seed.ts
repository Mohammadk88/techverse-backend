import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Languages seed data
  console.log('� Seeding languages...');
  const languages = [
    {
      name: 'English',
      nativeName: 'English',
      code: 'en',
      direction: 'ltr',
    },
    {
      name: 'Arabic',
      nativeName: 'العربية',
      code: 'ar',
      direction: 'rtl',
    },
    {
      name: 'Turkish',
      nativeName: 'Türkçe',
      code: 'tr',
      direction: 'ltr',
    },
    {
      name: 'French',
      nativeName: 'Français',
      code: 'fr',
      direction: 'ltr',
    },
    {
      name: 'Spanish',
      nativeName: 'Español',
      code: 'es',
      direction: 'ltr',
    },
  ];

  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: {},
      create: language,
    });
  }

  // Get created languages
  const englishLang = await prisma.language.findUnique({ where: { code: 'en' } });
  const arabicLang = await prisma.language.findUnique({ where: { code: 'ar' } });
  const turkishLang = await prisma.language.findUnique({ where: { code: 'tr' } });
  const frenchLang = await prisma.language.findUnique({ where: { code: 'fr' } });
  const spanishLang = await prisma.language.findUnique({ where: { code: 'es' } });

  // Countries seed data with default languages
  console.log('🌍 Seeding countries...');
  const countries = [
    // English-speaking countries
    { name: 'United States', code: 'US', languageId: englishLang!.id },
    { name: 'United Kingdom', code: 'GB', languageId: englishLang!.id },
    { name: 'Canada', code: 'CA', languageId: englishLang!.id },
    { name: 'Australia', code: 'AU', languageId: englishLang!.id },
    
    // Arabic-speaking countries
    { name: 'Saudi Arabia', code: 'SA', languageId: arabicLang!.id },
    { name: 'United Arab Emirates', code: 'AE', languageId: arabicLang!.id },
    { name: 'Egypt', code: 'EG', languageId: arabicLang!.id },
    
    // Turkish
    { name: 'Turkey', code: 'TR', languageId: turkishLang!.id },
    
    // French-speaking countries
    { name: 'France', code: 'FR', languageId: frenchLang!.id },
    
    // Spanish-speaking countries
    { name: 'Spain', code: 'ES', languageId: spanishLang!.id },
    { name: 'Mexico', code: 'MX', languageId: spanishLang!.id },
    
    // Other major countries
    { name: 'Germany', code: 'DE', languageId: englishLang!.id },
    { name: 'Italy', code: 'IT', languageId: englishLang!.id },
    { name: 'Japan', code: 'JP', languageId: englishLang!.id },
    { name: 'China', code: 'CN', languageId: englishLang!.id },
    { name: 'India', code: 'IN', languageId: englishLang!.id },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }

  // Cities seed data for major countries
  console.log('�️ Seeding cities...');
  
  // Get country IDs
  const usCountry = await prisma.country.findUnique({ where: { code: 'US' } });
  const ukCountry = await prisma.country.findUnique({ where: { code: 'GB' } });
  const trCountry = await prisma.country.findUnique({ where: { code: 'TR' } });
  const saCountry = await prisma.country.findUnique({ where: { code: 'SA' } });
  const aeCountry = await prisma.country.findUnique({ where: { code: 'AE' } });
  
  const cities = [
    // US Cities
    { name: 'New York', countryId: usCountry!.id },
    { name: 'Los Angeles', countryId: usCountry!.id },
    { name: 'Chicago', countryId: usCountry!.id },
    { name: 'Houston', countryId: usCountry!.id },
    { name: 'San Francisco', countryId: usCountry!.id },
    
    // UK Cities
    { name: 'London', countryId: ukCountry!.id },
    { name: 'Birmingham', countryId: ukCountry!.id },
    { name: 'Manchester', countryId: ukCountry!.id },
    { name: 'Liverpool', countryId: ukCountry!.id },
    { name: 'Edinburgh', countryId: ukCountry!.id },
    
    // Turkey Cities
    { name: 'Istanbul', countryId: trCountry!.id },
    { name: 'Ankara', countryId: trCountry!.id },
    { name: 'Izmir', countryId: trCountry!.id },
    { name: 'Bursa', countryId: trCountry!.id },
    { name: 'Antalya', countryId: trCountry!.id },
    
    // Saudi Arabia Cities
    { name: 'Riyadh', countryId: saCountry!.id },
    { name: 'Jeddah', countryId: saCountry!.id },
    { name: 'Mecca', countryId: saCountry!.id },
    { name: 'Medina', countryId: saCountry!.id },
    { name: 'Dammam', countryId: saCountry!.id },
    
    // UAE Cities
    { name: 'Dubai', countryId: aeCountry!.id },
    { name: 'Abu Dhabi', countryId: aeCountry!.id },
    { name: 'Sharjah', countryId: aeCountry!.id },
    { name: 'Al Ain', countryId: aeCountry!.id },
    { name: 'Ajman', countryId: aeCountry!.id },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: {
        id: -1, // Dummy ID since we can't use composite unique constraint in upsert
      },
      update: {},
      create: city,
    });
  }

  // Seed Admin User
  console.log('👤 Seeding admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const newYork = await prisma.city.findFirst({ 
    where: { name: 'New York', countryId: usCountry!.id } 
  });
  
  await prisma.user.upsert({
    where: { email: 'admin@techverse.com' },
    update: {},
    create: {
      email: 'admin@techverse.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: 'BARISTA',
      isActive: true,
      emailVerified: true,
      languageId: englishLang!.id,
      countryId: usCountry!.id,
      cityId: newYork!.id,
    },
  });

  // Seed Article Categories
  console.log('📚 Seeding article categories...');
  await prisma.articleCategory.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: { 
      name: 'Web Development', 
      slug: 'web-development', 
      description: 'Frontend and backend web development' 
    },
  });

  await prisma.articleCategory.upsert({
    where: { slug: 'mobile-development' },
    update: {},
    create: { 
      name: 'Mobile Development', 
      slug: 'mobile-development', 
      description: 'iOS and Android app development' 
    },
  });

  // Seed Article Tags
  console.log('🏷️ Seeding article tags...');
  await prisma.articleTag.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: { name: 'JavaScript', slug: 'javascript' },
  });

  await prisma.articleTag.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: { name: 'TypeScript', slug: 'typescript' },
  });

  // Seed Forum Categories
  console.log('💬 Seeding forum categories...');
  await prisma.forumCategory.upsert({
    where: { slug: 'general-discussion' },
    update: {},
    create: { 
      name: 'General Discussion', 
      slug: 'general-discussion', 
      description: 'General tech discussions' 
    },
  });

  // Seed Sample Playlists
  console.log('🎧 Seeding podcast playlists...');
  await prisma.playlist.upsert({
    where: { title: 'Getting Started with Tech' },
    update: {},
    create: {
      title: 'Getting Started with Tech',
      description: 'Perfect for beginners entering the tech world',
      coverImage: 'https://via.placeholder.com/300x300?text=Getting+Started',
    },
  });

  // Seed Global Roles
  console.log('🔐 Seeding global roles...');
  const globalRoles = [
    { name: 'ADMIN', description: 'System administrator with full access' },
    { name: 'SUPERVISOR', description: 'Platform supervisor with moderation privileges' },
    { name: 'EDITOR', description: 'Content editor with publishing privileges' },
    { name: 'MEMBER', description: 'Regular platform member' },
  ];

  for (const role of globalRoles) {
    await prisma.globalRole.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Seed Café Roles
  console.log('☕ Seeding café roles...');
  const cafeRoles = [
    { name: 'BARISTA', description: 'Café owner/administrator with full café control' },
    { name: 'THINKER', description: 'Café moderator with content management privileges' },
    { name: 'JOURNALIST', description: 'Café contributor with publishing privileges' },
    { name: 'MEMBER', description: 'Regular café member' },
  ];

  for (const role of cafeRoles) {
    await prisma.cafeRole.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Assign default global role to admin user
  console.log('👑 Assigning roles to admin user...');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@techverse.com' },
  });
  const adminRole = await prisma.globalRole.findUnique({
    where: { name: 'ADMIN' },
  });

  if (adminUser && adminRole) {
    await prisma.userGlobalRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log('✅ Database seeding completed!');
  console.log(`📚 ${languages.length} languages seeded`);
  console.log(`🌍 ${countries.length} countries seeded`);
  console.log(`🏙️ ${cities.length} cities seeded`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
