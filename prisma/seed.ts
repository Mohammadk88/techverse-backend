import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // ===========================================
  // LANGUAGES SEED
  // ===========================================
  const languages = [
    { name: 'English', nativeName: 'English', code: 'en', direction: 'ltr' },
    { name: 'Arabic', nativeName: 'العربية', code: 'ar', direction: 'rtl' },
    { name: 'Turkish', nativeName: 'Türkçe', code: 'tr', direction: 'ltr' },
    { name: 'French', nativeName: 'Français', code: 'fr', direction: 'ltr' },
    { name: 'Spanish', nativeName: 'Español', code: 'es', direction: 'ltr' },
    { name: 'German', nativeName: 'Deutsch', code: 'de', direction: 'ltr' },
    { name: 'Italian', nativeName: 'Italiano', code: 'it', direction: 'ltr' },
    { name: 'Portuguese', nativeName: 'Português', code: 'pt', direction: 'ltr' },
    { name: 'Russian', nativeName: 'Русский', code: 'ru', direction: 'ltr' },
    { name: 'Chinese', nativeName: '中文', code: 'zh', direction: 'ltr' },
    { name: 'Japanese', nativeName: '日本語', code: 'ja', direction: 'ltr' },
    { name: 'Korean', nativeName: '한국어', code: 'ko', direction: 'ltr' },
    { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi', direction: 'ltr' },
    { name: 'Dutch', nativeName: 'Nederlands', code: 'nl', direction: 'ltr' },
    { name: 'Swedish', nativeName: 'Svenska', code: 'sv', direction: 'ltr' },
    { name: 'Norwegian', nativeName: 'Norsk', code: 'no', direction: 'ltr' },
    { name: 'Danish', nativeName: 'Dansk', code: 'da', direction: 'ltr' },
    { name: 'Finnish', nativeName: 'Suomi', code: 'fi', direction: 'ltr' },
    { name: 'Greek', nativeName: 'Ελληνικά', code: 'el', direction: 'ltr' },
    { name: 'Hebrew', nativeName: 'עברית', code: 'he', direction: 'rtl' },
    { name: 'Urdu', nativeName: 'اردو', code: 'ur', direction: 'rtl' },
    { name: 'Persian', nativeName: 'فارسی', code: 'fa', direction: 'rtl' },
    { name: 'Kurdish', nativeName: 'کوردی', code: 'ku', direction: 'rtl' },
    { name: 'Polish', nativeName: 'Polski', code: 'pl', direction: 'ltr' },
    { name: 'Czech', nativeName: 'Čeština', code: 'cs', direction: 'ltr' },
    { name: 'Hungarian', nativeName: 'Magyar', code: 'hu', direction: 'ltr' },
    { name: 'Romanian', nativeName: 'Română', code: 'ro', direction: 'ltr' },
    { name: 'Bulgarian', nativeName: 'Български', code: 'bg', direction: 'ltr' },
    { name: 'Croatian', nativeName: 'Hrvatski', code: 'hr', direction: 'ltr' },
    { name: 'Serbian', nativeName: 'Српски', code: 'sr', direction: 'ltr' },
  ];

  console.log('🔤 Creating languages...');
  for (const lang of languages) {
    await prisma.languages.upsert({
      where: { code: lang.code },
      update: {
        ...lang,
        native_name: lang.nativeName,
        updated_at: new Date()
      },
      create: {
        ...lang,
        native_name: lang.nativeName,
        updated_at: new Date()
      },
    });
  }
  console.log(`✅ ${languages.length} languages created!`);

  // ===========================================
  // COUNTRIES SEED
  // ===========================================
  const countries = [
    // Middle East & Arab Countries
    { name: 'Saudi Arabia', code: 'SA', languageCode: 'ar' },
    { name: 'United Arab Emirates', code: 'AE', languageCode: 'ar' },
    { name: 'Qatar', code: 'QA', languageCode: 'ar' },
    { name: 'Kuwait', code: 'KW', languageCode: 'ar' },
    { name: 'Bahrain', code: 'BH', languageCode: 'ar' },
    { name: 'Oman', code: 'OM', languageCode: 'ar' },
    { name: 'Jordan', code: 'JO', languageCode: 'ar' },
    { name: 'Lebanon', code: 'LB', languageCode: 'ar' },
    { name: 'Syria', code: 'SY', languageCode: 'ar' },
    { name: 'Iraq', code: 'IQ', languageCode: 'ar' },
    { name: 'Yemen', code: 'YE', languageCode: 'ar' },
    { name: 'Egypt', code: 'EG', languageCode: 'ar' },
    { name: 'Libya', code: 'LY', languageCode: 'ar' },
    { name: 'Tunisia', code: 'TN', languageCode: 'ar' },
    { name: 'Algeria', code: 'DZ', languageCode: 'ar' },
    { name: 'Morocco', code: 'MA', languageCode: 'ar' },
    { name: 'Sudan', code: 'SD', languageCode: 'ar' },
    { name: 'Palestine', code: 'PS', languageCode: 'ar' },
    { name: 'Turkey', code: 'TR', languageCode: 'tr' },
    { name: 'Iran', code: 'IR', languageCode: 'fa' },
    { name: 'Israel', code: 'IL', languageCode: 'he' },

    // Europe
    { name: 'United Kingdom', code: 'GB', languageCode: 'en' },
    { name: 'Germany', code: 'DE', languageCode: 'de' },
    { name: 'France', code: 'FR', languageCode: 'fr' },
    { name: 'Italy', code: 'IT', languageCode: 'it' },
    { name: 'Spain', code: 'ES', languageCode: 'es' },
    { name: 'Portugal', code: 'PT', languageCode: 'pt' },
    { name: 'Netherlands', code: 'NL', languageCode: 'nl' },
    { name: 'Belgium', code: 'BE', languageCode: 'nl' },
    { name: 'Switzerland', code: 'CH', languageCode: 'de' },
    { name: 'Austria', code: 'AT', languageCode: 'de' },
    { name: 'Sweden', code: 'SE', languageCode: 'sv' },
    { name: 'Norway', code: 'NO', languageCode: 'no' },
    { name: 'Denmark', code: 'DK', languageCode: 'da' },
    { name: 'Finland', code: 'FI', languageCode: 'fi' },
    { name: 'Poland', code: 'PL', languageCode: 'pl' },
    { name: 'Czech Republic', code: 'CZ', languageCode: 'cs' },
    { name: 'Hungary', code: 'HU', languageCode: 'hu' },
    { name: 'Romania', code: 'RO', languageCode: 'ro' },
    { name: 'Bulgaria', code: 'BG', languageCode: 'bg' },
    { name: 'Greece', code: 'GR', languageCode: 'el' },
    { name: 'Croatia', code: 'HR', languageCode: 'hr' },
    { name: 'Serbia', code: 'RS', languageCode: 'sr' },
    { name: 'Russia', code: 'RU', languageCode: 'ru' },

    // Americas
    { name: 'United States', code: 'US', languageCode: 'en' },
    { name: 'Canada', code: 'CA', languageCode: 'en' },
    { name: 'Mexico', code: 'MX', languageCode: 'es' },
    { name: 'Brazil', code: 'BR', languageCode: 'pt' },
    { name: 'Argentina', code: 'AR', languageCode: 'es' },
    { name: 'Chile', code: 'CL', languageCode: 'es' },
    { name: 'Colombia', code: 'CO', languageCode: 'es' },
    { name: 'Peru', code: 'PE', languageCode: 'es' },
    { name: 'Venezuela', code: 'VE', languageCode: 'es' },

    // Asia
    { name: 'China', code: 'CN', languageCode: 'zh' },
    { name: 'Japan', code: 'JP', languageCode: 'ja' },
    { name: 'South Korea', code: 'KR', languageCode: 'ko' },
    { name: 'India', code: 'IN', languageCode: 'hi' },
    { name: 'Pakistan', code: 'PK', languageCode: 'ur' },
    { name: 'Bangladesh', code: 'BD', languageCode: 'en' },
    { name: 'Indonesia', code: 'ID', languageCode: 'en' },
    { name: 'Malaysia', code: 'MY', languageCode: 'en' },
    { name: 'Singapore', code: 'SG', languageCode: 'en' },
    { name: 'Thailand', code: 'TH', languageCode: 'en' },
    { name: 'Vietnam', code: 'VN', languageCode: 'en' },
    { name: 'Philippines', code: 'PH', languageCode: 'en' },

    // Africa
    { name: 'South Africa', code: 'ZA', languageCode: 'en' },
    { name: 'Nigeria', code: 'NG', languageCode: 'en' },
    { name: 'Kenya', code: 'KE', languageCode: 'en' },
    { name: 'Ghana', code: 'GH', languageCode: 'en' },
    { name: 'Ethiopia', code: 'ET', languageCode: 'en' },

    // Oceania
    { name: 'Australia', code: 'AU', languageCode: 'en' },
    { name: 'New Zealand', code: 'NZ', languageCode: 'en' },
  ];

  console.log('🌍 Creating countries...');
  for (const country of countries) {
    await prisma.countries.upsert({
      where: { code: country.code },
      update: {
        name: country.name,
      },
      create: {
        name: country.name,
        code: country.code,
        languages: {
          connect: { code: country.languageCode },
        },
        updated_at: new Date(),
      },
    });
  }
  console.log(`✅ ${countries.length} countries created!`);

  // ===========================================
  // CITIES SEED
  // ===========================================
  const cities = [
    // Saudi Arabia
    { name: 'Riyadh', countryCode: 'SA' },
    { name: 'Jeddah', countryCode: 'SA' },
    { name: 'Mecca', countryCode: 'SA' },
    { name: 'Medina', countryCode: 'SA' },
    { name: 'Dammam', countryCode: 'SA' },
    { name: 'Khobar', countryCode: 'SA' },
    { name: 'Taif', countryCode: 'SA' },
    { name: 'Tabuk', countryCode: 'SA' },
    { name: 'Abha', countryCode: 'SA' },

    // UAE
    { name: 'Dubai', countryCode: 'AE' },
    { name: 'Abu Dhabi', countryCode: 'AE' },
    { name: 'Sharjah', countryCode: 'AE' },
    { name: 'Ajman', countryCode: 'AE' },
    { name: 'Ras Al Khaimah', countryCode: 'AE' },
    { name: 'Fujairah', countryCode: 'AE' },

    // Qatar
    { name: 'Doha', countryCode: 'QA' },
    { name: 'Al Rayyan', countryCode: 'QA' },
    { name: 'Al Khor', countryCode: 'QA' },

    // Kuwait
    { name: 'Kuwait City', countryCode: 'KW' },
    { name: 'Hawalli', countryCode: 'KW' },
    { name: 'Salmiya', countryCode: 'KW' },

    // Turkey
    { name: 'Istanbul', countryCode: 'TR' },
    { name: 'Ankara', countryCode: 'TR' },
    { name: 'Izmir', countryCode: 'TR' },
    { name: 'Bursa', countryCode: 'TR' },
    { name: 'Antalya', countryCode: 'TR' },
    { name: 'Gaziantep', countryCode: 'TR' },

    // Syria
    { name: 'Damascus', countryCode: 'SY' },
    { name: 'Aleppo', countryCode: 'SY' },
    { name: 'Homs', countryCode: 'SY' },
    { name: 'Latakia', countryCode: 'SY' },
    { name: 'Hama', countryCode: 'SY' },

    // Lebanon
    { name: 'Beirut', countryCode: 'LB' },
    { name: 'Tripoli', countryCode: 'LB' },
    { name: 'Sidon', countryCode: 'LB' },

    // Jordan
    { name: 'Amman', countryCode: 'JO' },
    { name: 'Zarqa', countryCode: 'JO' },
    { name: 'Irbid', countryCode: 'JO' },

    // Egypt
    { name: 'Cairo', countryCode: 'EG' },
    { name: 'Alexandria', countryCode: 'EG' },
    { name: 'Giza', countryCode: 'EG' },
    { name: 'Luxor', countryCode: 'EG' },
    { name: 'Aswan', countryCode: 'EG' },

    // Morocco
    { name: 'Casablanca', countryCode: 'MA' },
    { name: 'Rabat', countryCode: 'MA' },
    { name: 'Marrakech', countryCode: 'MA' },
    { name: 'Fez', countryCode: 'MA' },

    // United States
    { name: 'New York', countryCode: 'US' },
    { name: 'Los Angeles', countryCode: 'US' },
    { name: 'Chicago', countryCode: 'US' },
    { name: 'Houston', countryCode: 'US' },
    { name: 'Phoenix', countryCode: 'US' },
    { name: 'Philadelphia', countryCode: 'US' },
    { name: 'San Antonio', countryCode: 'US' },
    { name: 'San Diego', countryCode: 'US' },
    { name: 'Dallas', countryCode: 'US' },
    { name: 'San Jose', countryCode: 'US' },
    { name: 'Austin', countryCode: 'US' },
    { name: 'Jacksonville', countryCode: 'US' },
    { name: 'San Francisco', countryCode: 'US' },
    { name: 'Indianapolis', countryCode: 'US' },
    { name: 'Columbus', countryCode: 'US' },
    { name: 'Fort Worth', countryCode: 'US' },
    { name: 'Charlotte', countryCode: 'US' },
    { name: 'Detroit', countryCode: 'US' },
    { name: 'El Paso', countryCode: 'US' },
    { name: 'Memphis', countryCode: 'US' },
    { name: 'Boston', countryCode: 'US' },
    { name: 'Seattle', countryCode: 'US' },
    { name: 'Denver', countryCode: 'US' },
    { name: 'Washington', countryCode: 'US' },
    { name: 'Nashville', countryCode: 'US' },

    // Canada
    { name: 'Toronto', countryCode: 'CA' },
    { name: 'Montreal', countryCode: 'CA' },
    { name: 'Vancouver', countryCode: 'CA' },
    { name: 'Calgary', countryCode: 'CA' },
    { name: 'Ottawa', countryCode: 'CA' },
    { name: 'Edmonton', countryCode: 'CA' },

    // United Kingdom
    { name: 'London', countryCode: 'GB' },
    { name: 'Birmingham', countryCode: 'GB' },
    { name: 'Liverpool', countryCode: 'GB' },
    { name: 'Leeds', countryCode: 'GB' },
    { name: 'Glasgow', countryCode: 'GB' },
    { name: 'Sheffield', countryCode: 'GB' },
    { name: 'Bradford', countryCode: 'GB' },
    { name: 'Edinburgh', countryCode: 'GB' },
    { name: 'Leicester', countryCode: 'GB' },
    { name: 'Newcastle', countryCode: 'GB' },

    // Germany
    { name: 'Berlin', countryCode: 'DE' },
    { name: 'Hamburg', countryCode: 'DE' },
    { name: 'Munich', countryCode: 'DE' },
    { name: 'Cologne', countryCode: 'DE' },
    { name: 'Frankfurt', countryCode: 'DE' },
    { name: 'Stuttgart', countryCode: 'DE' },
    { name: 'Düsseldorf', countryCode: 'DE' },
    { name: 'Dortmund', countryCode: 'DE' },

    // France
    { name: 'Paris', countryCode: 'FR' },
    { name: 'Marseille', countryCode: 'FR' },
    { name: 'Lyon', countryCode: 'FR' },
    { name: 'Toulouse', countryCode: 'FR' },
    { name: 'Nice', countryCode: 'FR' },
    { name: 'Nantes', countryCode: 'FR' },
    { name: 'Strasbourg', countryCode: 'FR' },
    { name: 'Montpellier', countryCode: 'FR' },

    // Italy
    { name: 'Rome', countryCode: 'IT' },
    { name: 'Milan', countryCode: 'IT' },
    { name: 'Naples', countryCode: 'IT' },
    { name: 'Turin', countryCode: 'IT' },
    { name: 'Palermo', countryCode: 'IT' },
    { name: 'Genoa', countryCode: 'IT' },
    { name: 'Bologna', countryCode: 'IT' },
    { name: 'Florence', countryCode: 'IT' },

    // Spain
    { name: 'Madrid', countryCode: 'ES' },
    { name: 'Barcelona', countryCode: 'ES' },
    { name: 'Valencia', countryCode: 'ES' },
    { name: 'Seville', countryCode: 'ES' },
    { name: 'Zaragoza', countryCode: 'ES' },
    { name: 'Málaga', countryCode: 'ES' },
    { name: 'Murcia', countryCode: 'ES' },
    { name: 'Palma', countryCode: 'ES' },

    // Netherlands
    { name: 'Amsterdam', countryCode: 'NL' },
    { name: 'Rotterdam', countryCode: 'NL' },
    { name: 'The Hague', countryCode: 'NL' },
    { name: 'Utrecht', countryCode: 'NL' },
    { name: 'Eindhoven', countryCode: 'NL' },

    // China
    { name: 'Beijing', countryCode: 'CN' },
    { name: 'Shanghai', countryCode: 'CN' },
    { name: 'Guangzhou', countryCode: 'CN' },
    { name: 'Shenzhen', countryCode: 'CN' },
    { name: 'Chengdu', countryCode: 'CN' },
    { name: 'Hangzhou', countryCode: 'CN' },

    // Japan
    { name: 'Tokyo', countryCode: 'JP' },
    { name: 'Yokohama', countryCode: 'JP' },
    { name: 'Osaka', countryCode: 'JP' },
    { name: 'Nagoya', countryCode: 'JP' },
    { name: 'Sapporo', countryCode: 'JP' },
    { name: 'Fukuoka', countryCode: 'JP' },

    // South Korea
    { name: 'Seoul', countryCode: 'KR' },
    { name: 'Busan', countryCode: 'KR' },
    { name: 'Incheon', countryCode: 'KR' },
    { name: 'Daegu', countryCode: 'KR' },
    { name: 'Daejeon', countryCode: 'KR' },

    // India
    { name: 'Mumbai', countryCode: 'IN' },
    { name: 'Delhi', countryCode: 'IN' },
    { name: 'Bangalore', countryCode: 'IN' },
    { name: 'Hyderabad', countryCode: 'IN' },
    { name: 'Chennai', countryCode: 'IN' },
    { name: 'Kolkata', countryCode: 'IN' },
    { name: 'Pune', countryCode: 'IN' },
    { name: 'Ahmedabad', countryCode: 'IN' },

    // Australia
    { name: 'Sydney', countryCode: 'AU' },
    { name: 'Melbourne', countryCode: 'AU' },
    { name: 'Brisbane', countryCode: 'AU' },
    { name: 'Perth', countryCode: 'AU' },
    { name: 'Adelaide', countryCode: 'AU' },

    // Brazil
    { name: 'São Paulo', countryCode: 'BR' },
    { name: 'Rio de Janeiro', countryCode: 'BR' },
    { name: 'Brasília', countryCode: 'BR' },
    { name: 'Salvador', countryCode: 'BR' },
    { name: 'Fortaleza', countryCode: 'BR' },

    // Russia
    { name: 'Moscow', countryCode: 'RU' },
    { name: 'Saint Petersburg', countryCode: 'RU' },
    { name: 'Novosibirsk', countryCode: 'RU' },
    { name: 'Yekaterinburg', countryCode: 'RU' },
    { name: 'Nizhny Novgorod', countryCode: 'RU' },
  ];

  console.log('🏙️ Creating cities...');
  let cityCount = 0;
  for (const city of cities) {
    // Get country by code first
    const country = await prisma.countries.findUnique({
      where: { code: city.countryCode },
    });
    
    if (country) {
      await prisma.cities.upsert({
        where: {
          name_country_id: {
            name: city.name,
            country_id: country.id,
          },
        },
        update: {
          name: city.name,
        },
        create: {
          name: city.name,
          country_id: country.id,
          updated_at: new Date(),
        },
      });
      cityCount++;
    }
  }
  console.log(`✅ ${cityCount} cities created!`);

  // ===========================================
  // ROLES SEED
  // ===========================================
  console.log('👥 Creating roles...');

  // Create default global roles
  const memberRole = await prisma.global_roles.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Default member role',
      updated_at: new Date(),
    },
  });

  const adminRole = await prisma.global_roles.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role',
      updated_at: new Date(),
    },
  });

  // Create default café roles
  const cafeBarista = await prisma.cafe_roles.upsert({
    where: { name: 'Barista' },
    update: {},
    create: {
      name: 'Barista',
      description: 'Café manager role',
      updated_at: new Date(),
    },
  });

  const cafeMember = await prisma.cafe_roles.upsert({
    where: { name: 'Member' },
    update: {},
    create: {
      name: 'Member',
      description: 'Café member role',
      updated_at: new Date(),
    },
  });

  console.log('✅ Default roles created successfully!');
  console.log('- Member role:', memberRole);
  console.log('- Admin role:', adminRole);
  console.log('- Barista role:', cafeBarista);
  console.log('- Café Member role:', cafeMember);

  // ===========================================
  // ARTICLE CATEGORIES SEED
  // ===========================================
  console.log('📚 Creating article categories...');
  
  const categories = [
    { 
      name: 'Programming', 
      slug: 'programming', 
      description: 'Programming languages, frameworks, and development',
      updated_at: new Date(),
    },
    { 
      name: 'Web Development', 
      slug: 'web-development', 
      description: 'Frontend, backend, and full-stack web development',
      updated_at: new Date(),
    },
    { 
      name: 'Mobile Development', 
      slug: 'mobile-development', 
      description: 'iOS, Android, and cross-platform mobile development',
      updated_at: new Date(),
    },
    { 
      name: 'Data Science', 
      slug: 'data-science', 
      description: 'Data analysis, machine learning, and AI',
      updated_at: new Date(),
    },
    { 
      name: 'DevOps', 
      slug: 'devops', 
      description: 'CI/CD, containerization, and deployment strategies',
      updated_at: new Date(),
    },
    { 
      name: 'Cybersecurity', 
      slug: 'cybersecurity', 
      description: 'Security practices, ethical hacking, and privacy',
      updated_at: new Date(),
    },
    { 
      name: 'Cloud Computing', 
      slug: 'cloud-computing', 
      description: 'AWS, Azure, GCP, and cloud architectures',
      updated_at: new Date(),
    },
    { 
      name: 'Blockchain', 
      slug: 'blockchain', 
      description: 'Cryptocurrency, DeFi, and blockchain technology',
      updated_at: new Date(),
    },
    { 
      name: 'UI/UX Design', 
      slug: 'ui-ux-design', 
      description: 'User interface and user experience design',
      updated_at: new Date(),
    },
    { 
      name: 'Career & Learning', 
      slug: 'career-learning', 
      description: 'Tech careers, learning resources, and industry insights',
      updated_at: new Date(),
    },
  ];

  const createdCategories: any[] = [];
  for (const category of categories) {
    const createdCategory = await prisma.article_categories.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    createdCategories.push(createdCategory);
  }

  // ===========================================
  // ARTICLE TAGS SEED
  // ===========================================
  console.log('🏷️ Creating article tags...');
  
  const tags = [
    { name: 'JavaScript', slug: 'javascript', updated_at: new Date() },
    { name: 'TypeScript', slug: 'typescript', updated_at: new Date() },
    { name: 'React', slug: 'react', updated_at: new Date() },
    { name: 'Node.js', slug: 'nodejs', updated_at: new Date() },
    { name: 'Python', slug: 'python', updated_at: new Date() },
    { name: 'Machine Learning', slug: 'machine-learning', updated_at: new Date() },
    { name: 'Docker', slug: 'docker', updated_at: new Date() },
    { name: 'Kubernetes', slug: 'kubernetes', updated_at: new Date() },
    { name: 'AWS', slug: 'aws', updated_at: new Date() },
    { name: 'Firebase', slug: 'firebase', updated_at: new Date() },
    { name: 'MongoDB', slug: 'mongodb', updated_at: new Date() },
    { name: 'PostgreSQL', slug: 'postgresql', updated_at: new Date() },
    { name: 'Vue.js', slug: 'vuejs', updated_at: new Date() },
    { name: 'Angular', slug: 'angular', updated_at: new Date() },
    { name: 'Flutter', slug: 'flutter', updated_at: new Date() },
    { name: 'Swift', slug: 'swift', updated_at: new Date() },
    { name: 'Kotlin', slug: 'kotlin', updated_at: new Date() },
    { name: 'Go', slug: 'go', updated_at: new Date() },
    { name: 'Rust', slug: 'rust', updated_at: new Date() },
    { name: 'Next.js', slug: 'nextjs', updated_at: new Date() },
    { name: 'GraphQL', slug: 'graphql', updated_at: new Date() },
    { name: 'REST API', slug: 'rest-api', updated_at: new Date() },
    { name: 'Microservices', slug: 'microservices', updated_at: new Date() },
    { name: 'AI', slug: 'ai', updated_at: new Date() },
    { name: 'Blockchain', slug: 'blockchain', updated_at: new Date() },
    { name: 'Security', slug: 'security', updated_at: new Date() },
    { name: 'Testing', slug: 'testing', updated_at: new Date() },
    { name: 'Performance', slug: 'performance', updated_at: new Date() },
    { name: 'Tutorial', slug: 'tutorial', updated_at: new Date() },
    { name: 'Best Practices', slug: 'best-practices', updated_at: new Date() },
  ];

  const createdTags: any[] = [];
  for (const tag of tags) {
    const createdTag = await prisma.article_tags.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
    createdTags.push(createdTag);
  }

  // ===========================================
  // DEMO USERS SEED
  // ===========================================
  console.log('👥 Creating demo users...');
  
  const demoUsers = [
    {
      email: 'ahmed.tech@example.com',
      password: '$2b$10$YourHashedPasswordHere', // This should be properly hashed
      first_name: 'Ahmed',
      last_name: 'Al-Rashid',
      username: 'ahmed_tech',
      bio: 'Full-stack developer passionate about React and Node.js',
      role: 'JOURNALIST' as const,
      tech_coin: 1500,
      language_id: 13, // Arabic
      country_id: 26, // Saudi Arabia
      updated_at: new Date(),
    },
    {
      email: 'sarah.dev@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      first_name: 'Sarah',
      last_name: 'Johnson',
      username: 'sarah_codes',
      bio: 'Frontend specialist and UI/UX enthusiast',
      role: 'THINKER' as const,
      tech_coin: 2000,
      language_id: 12, // English
      country_id: 91, // United States
      updated_at: new Date(),
    },
    {
      email: 'mohamed.ai@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      first_name: 'Mohamed',
      last_name: 'Hassan',
      username: 'mo_ai_expert',
      bio: 'AI researcher and machine learning engineer',
      role: 'JOURNALIST' as const,
      tech_coin: 3000,
      language_id: 13, // Arabic
      country_id: 68, // Egypt
      updated_at: new Date(),
    },
    {
      email: 'yuki.dev@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      first_name: 'Yuki',
      last_name: 'Tanaka',
      username: 'yuki_tech',
      bio: 'Mobile developer specializing in Flutter and React Native',
      role: 'MEMBER' as const,
      tech_coin: 800,
      language_id: 27, // Japanese
      country_id: 52, // Japan
      updated_at: new Date(),
    },
    {
      email: 'fatma.blockchain@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      first_name: 'Fatma',
      last_name: 'Özkan',
      username: 'fatma_chain',
      bio: 'Blockchain developer and cryptocurrency enthusiast',
      role: 'THINKER' as const,
      tech_coin: 2500,
      language_id: 14, // Turkish
      country_id: 30, // Turkey
      updated_at: new Date(),
    },
  ];

  const createdUsers: any[] = [];
  for (const user of demoUsers) {
    const createdUser = await prisma.users.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    createdUsers.push(createdUser);
  }

  // ===========================================
  // ARTICLES SEED - COMPREHENSIVE SET
  // ===========================================
  console.log('📄 Creating diverse articles...');

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const articlesData = [
    // Published Articles (Regular)
    {
      title: 'Getting Started with React Hooks',
      slug: 'getting-started-react-hooks',
      content: `React Hooks revolutionized the way we write React components by allowing us to use state and other React features in functional components.

## What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don't work inside classes — they let you use React without classes.

### useState Hook

The most commonly used hook is \`useState\`, which lets you add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect Hook

The \`useEffect\` Hook lets you perform side effects in function components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Best Practices

1. Always use hooks at the top level of your React function
2. Don't call hooks inside loops, conditions, or nested functions
3. Use custom hooks to extract component logic
4. Follow the rules of hooks

React Hooks provide a more direct API to the React concepts you already know, making your code more readable and maintainable.`,
      excerpt: 'Learn how to use React Hooks to manage state and side effects in functional components. A comprehensive guide for beginners.',
      categoryId: createdCategories[1].id, // Web Development
      authorId: createdUsers[0].id, // Ahmed
      languageCode: 'en',
      countryCode: 'SA',
      isPublished: true,
      publishedAt: lastWeek,
      featured: true,
    },
    {
      title: 'دليل شامل لتطوير تطبيقات الويب بـ Node.js',
      slug: 'nodejs-web-development-guide-ar',
      content: `Node.js هو بيئة تشغيل JavaScript مبنية على محرك V8 الخاص بـ Chrome، تتيح لك تشغيل JavaScript على الخادم.

## لماذا Node.js؟

### المزايا الرئيسية:

1. **أداء عالي**: محرك V8 السريع
2. **نفس اللغة**: JavaScript للواجهة الأمامية والخلفية
3. **NPM**: أكبر مكتبة للحزم في العالم
4. **مجتمع نشط**: دعم واسع من المطورين

## إنشاء خادم بسيط

\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('مرحباً بك في Node.js!');
});

server.listen(3000, () => {
  console.log('الخادم يعمل على المنفذ 3000');
});
\`\`\`

## استخدام Express.js

Express.js هو إطار عمل سريع ومرن لـ Node.js:

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('مرحباً من Express!');
});

app.listen(3000, () => {
  console.log('تطبيق Express يعمل على المنفذ 3000');
});
\`\`\`

## الاتصال بقاعدة البيانات

يمكنك استخدام MongoDB مع Mongoose:

\`\`\`javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model('User', UserSchema);
\`\`\`

Node.js يوفر بيئة ممتازة لتطوير تطبيقات الويب الحديثة والقابلة للتطوير.`,
      excerpt: 'تعلم كيفية استخدام Node.js لبناء تطبيقات ويب سريعة وقابلة للتطوير. دليل شامل باللغة العربية.',
      categoryId: createdCategories[1].id, // Web Development
      authorId: createdUsers[0].id, // Ahmed
      languageCode: 'ar',
      countryCode: 'SA',
      isPublished: true,
      publishedAt: yesterday,
      featured: false,
    },
    // Scheduled Articles
    {
      title: 'Machine Learning with Python: A Complete Guide',
      slug: 'machine-learning-python-complete-guide',
      content: `Machine Learning is transforming industries and creating new opportunities for developers and data scientists.

## Introduction to Machine Learning

Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

### Types of Machine Learning:

1. **Supervised Learning**: Learning with labeled data
2. **Unsupervised Learning**: Finding patterns in unlabeled data
3. **Reinforcement Learning**: Learning through interaction and feedback

## Getting Started with Python

Python is the most popular language for machine learning due to its simplicity and powerful libraries.

### Essential Libraries:

\`\`\`python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
\`\`\`

## Building Your First Model

Let's create a simple linear regression model:

\`\`\`python
# Load data
from sklearn.datasets import load_boston
boston = load_boston()
X, y = boston.data, boston.target

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate model
mse = mean_squared_error(y_test, predictions)
print(f'Mean Squared Error: {mse}')
\`\`\`

## Advanced Topics

- Deep Learning with TensorFlow and Keras
- Natural Language Processing
- Computer Vision
- Time Series Analysis

Machine Learning is a powerful tool that can solve complex problems and provide valuable insights from data.`,
      excerpt: 'A comprehensive guide to machine learning with Python, covering fundamentals, libraries, and practical examples.',
      categoryId: createdCategories[3].id, // Data Science
      authorId: createdUsers[2].id, // Mohamed
      languageCode: 'en',
      countryCode: 'EG',
      isPublished: false,
      scheduledFor: tomorrow,
      featured: false,
    },
    {
      title: 'Mobile App Development with Flutter',
      slug: 'flutter-mobile-app-development',
      content: `Flutter is Google's UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.

## Why Choose Flutter?

### Key Advantages:
- **Single Codebase**: Write once, run everywhere
- **Hot Reload**: Instant updates during development
- **Rich Widgets**: Beautiful, customizable UI components
- **High Performance**: Compiled to native code

## Setting Up Flutter

\`\`\`bash
# Install Flutter SDK
git clone https://github.com/flutter/flutter.git
export PATH="$PATH:pwd/flutter/bin"

# Verify installation
flutter doctor
\`\`\`

## Creating Your First App

\`\`\`dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My First Flutter App',
      home: HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter Demo'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text('You have pushed the button this many times:'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ),
    );
  }
}
\`\`\`

## State Management

Flutter offers several state management solutions:
- **setState()**: For simple local state
- **Provider**: Recommended for most apps
- **Bloc**: For complex state management
- **Riverpod**: Modern alternative to Provider

Flutter enables rapid development of beautiful, high-performance mobile applications.`,
      excerpt: 'Learn how to build cross-platform mobile apps with Flutter. Complete guide from setup to deployment.',
      categoryId: createdCategories[2].id, // Mobile Development
      authorId: createdUsers[3].id, // Yuki
      languageCode: 'en',
      countryCode: 'JP',
      isPublished: false,
      scheduledFor: nextWeek,
      featured: false,
    },
    // AI-Enhanced Article
    {
      title: 'Blockchain Development Fundamentals',
      slug: 'blockchain-development-fundamentals',
      content: `Blockchain technology is revolutionizing how we think about data, trust, and decentralization.

## What is Blockchain?

A blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography.

### Key Characteristics:
- **Decentralization**: No single point of control
- **Immutability**: Records cannot be altered
- **Transparency**: All transactions are visible
- **Security**: Cryptographic protection

## Smart Contracts

Smart contracts are self-executing contracts with terms directly written into code:

\`\`\`solidity
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}
\`\`\`

## Building DApps with Web3.js

\`\`\`javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

// Connect to smart contract
const contractABI = [...]; // Your contract ABI
const contractAddress = '0x...'; // Your contract address

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Call contract method
const result = await contract.methods.get().call();
console.log('Stored value:', result);
\`\`\`

## Popular Blockchain Platforms:
- **Ethereum**: Most popular smart contract platform
- **Binance Smart Chain**: Fast and low-cost alternative
- **Polygon**: Layer 2 scaling solution
- **Solana**: High-performance blockchain

Understanding blockchain development opens doors to the decentralized future of technology.`,
      excerpt: 'Master blockchain development from basics to building decentralized applications. Learn smart contracts and Web3 development.',
      categoryId: createdCategories[7].id, // Blockchain
      authorId: createdUsers[4].id, // Fatma
      languageCode: 'en',
      countryCode: 'TR',
      isPublished: true,
      publishedAt: yesterday,
      isAI: true,
      aiPrompt: 'Create a comprehensive guide to blockchain development covering smart contracts, DApps, and popular platforms',
      featured: false,
    },
    // More diverse articles with different statuses
    {
      title: 'DevOps Best Practices for 2024',
      slug: 'devops-best-practices-2024',
      content: `DevOps continues to evolve, and staying updated with best practices is crucial for modern software development teams.

## CI/CD Pipeline Excellence

### Key Components:
1. **Source Control**: Git with branching strategies
2. **Build Automation**: Docker containers
3. **Testing**: Automated unit, integration, and E2E tests
4. **Deployment**: Blue-green or rolling deployments

## Infrastructure as Code

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

## Monitoring and Observability

Essential monitoring tools:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Logging
- **Jaeger**: Distributed tracing

## Security in DevOps

- Container scanning
- Dependency vulnerability checks
- Secrets management
- Access control and audit logs

DevOps practices ensure reliable, scalable, and secure software delivery.`,
      excerpt: 'Essential DevOps practices for 2024: CI/CD, Infrastructure as Code, monitoring, and security best practices.',
      categoryId: createdCategories[4].id, // DevOps
      authorId: createdUsers[1].id, // Sarah
      languageCode: 'en',
      countryCode: 'US',
      isPublished: true,
      publishedAt: now,
      featured: true,
    },
  ];

  const createdArticles: any[] = [];
  for (const articleData of articlesData) {
    // Transform camelCase to snake_case for Prisma schema
    const transformedData = {
      title: articleData.title,
      slug: articleData.slug,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category_id: articleData.categoryId,
      author_id: articleData.authorId,
      language_code: articleData.languageCode,
      country_code: articleData.countryCode,
      is_published: articleData.isPublished,
      published_at: articleData.publishedAt,
      featured: articleData.featured,
      scheduled_for: articleData.scheduledFor,
      is_ai: articleData.isAI,
      ai_prompt: articleData.aiPrompt,
      updated_at: new Date(),
    };

    const article = await prisma.articles.upsert({
      where: { slug: transformedData.slug },
      update: transformedData,
      create: transformedData,
    });
    createdArticles.push(article);
  }

  console.log(`✅ ${createdArticles.length} articles created!`);

  // ===========================================
  // ARTICLE TAGS RELATIONS
  // ===========================================
  console.log('🔗 Creating article-tag relations...');

  // Add tags to articles
  const articleTagRelations = [
    { articleId: createdArticles[0].id, tagIds: [createdTags[0].id, createdTags[2].id, createdTags[28].id] }, // React Hooks: JavaScript, React, Tutorial
    { articleId: createdArticles[1].id, tagIds: [createdTags[3].id, createdTags[28].id, createdTags[29].id] }, // Node.js Arabic: Node.js, Tutorial, Best Practices
    { articleId: createdArticles[2].id, tagIds: [createdTags[4].id, createdTags[5].id, createdTags[23].id, createdTags[28].id] }, // ML Python: Python, Machine Learning, AI, Tutorial
    { articleId: createdArticles[3].id, tagIds: [createdTags[14].id, createdTags[28].id] }, // Flutter: Flutter, Tutorial
    { articleId: createdArticles[4].id, tagIds: [createdTags[24].id, createdTags[28].id, createdTags[29].id] }, // Blockchain: Blockchain, Tutorial, Best Practices
    { articleId: createdArticles[5].id, tagIds: [createdTags[6].id, createdTags[7].id, createdTags[29].id] }, // DevOps: Docker, Kubernetes, Best Practices
  ];

  for (const relation of articleTagRelations) {
    for (const tagId of relation.tagIds) {
      await prisma.article_tag_relations.create({
        data: {
          article_id: relation.articleId,
          tag_id: tagId,
        },
      });
    }
  }

  // ===========================================
  // SCHEDULED POSTS
  // ===========================================
  console.log('⏰ Creating scheduled posts...');

  await prisma.scheduled_posts.createMany({
    data: [
      {
        article_id: createdArticles[2].id, // ML Python article
        user_id: createdUsers[2].id, // Mohamed
        publish_at: tomorrow,
        status: 'SCHEDULED',
        updated_at: new Date(),
      },
      {
        article_id: createdArticles[3].id, // Flutter article
        user_id: createdUsers[3].id, // Yuki
        publish_at: nextWeek,
        status: 'SCHEDULED',
        updated_at: new Date(),
      },
    ],
  });

  // ===========================================
  // ARTICLE BOOSTS
  // ===========================================
  console.log('🚀 Creating article boosts...');

  const boostEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  await prisma.article_boosts.createMany({
    data: [
      {
        article_id: createdArticles[0].id, // React Hooks
        user_id: createdUsers[0].id, // Ahmed
        coin_spent: 500,
        start_date: yesterday,
        end_date: boostEndDate,
      },
      {
        article_id: createdArticles[5].id, // DevOps
        user_id: createdUsers[1].id, // Sarah
        coin_spent: 300,
        start_date: now,
        end_date: boostEndDate,
      },
    ],
  });

  // ===========================================
  // AI ENHANCEMENTS
  // ===========================================
  console.log('🤖 Creating AI enhancements...');

  await prisma.article_ai_enhancements.createMany({
    data: [
      {
        article_id: createdArticles[4].id, // Blockchain article
        user_id: createdUsers[4].id, // Fatma
        enhancement_type: 'TITLE_OPTIMIZATION',
        original_value: 'Basic Blockchain Development',
        enhanced_value: 'Blockchain Development Fundamentals',
        coin_spent: 100,
        is_applied: true,
      },
      {
        article_id: createdArticles[4].id, // Blockchain article
        user_id: createdUsers[4].id, // Fatma
        enhancement_type: 'SEO_TAGS',
        original_value: 'blockchain, development',
        enhanced_value: 'blockchain development, smart contracts, web3, dapps, ethereum, solidity',
        coin_spent: 150,
        is_applied: true,
      },
      {
        article_id: createdArticles[2].id, // ML Python article
        user_id: createdUsers[2].id, // Mohamed
        enhancement_type: 'SUMMARY_GENERATION',
        original_value: '',
        enhanced_value: 'A comprehensive guide to machine learning with Python, covering fundamentals, libraries, and practical examples.',
        coin_spent: 200,
        is_applied: false,
      },
    ],
  });

  console.log('✅ Articles ecosystem created successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Tags: ${tags.length}`);
  console.log(`   - Demo Users: ${demoUsers.length}`);
  console.log(`   - Articles: ${articlesData.length}`);
  console.log(`   - Scheduled Posts: 2`);
  console.log(`   - Article Boosts: 2`);
  console.log(`   - AI Enhancements: 3`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
