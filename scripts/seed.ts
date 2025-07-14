#!/usr/bin/env tsx

import { PrismaClient, UserRole, PostType, IssueStatus, DeveloperRank, ReportStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Clear existing data (be careful in production!)
  console.log('🧹 Cleaning existing data...');
  
  // Clear in dependency order
  await prisma.articleTagRelation.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.episodeComment.deleteMany();
  await prisma.episodeLike.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.cafePost.deleteMany();
  await prisma.cafeMember.deleteMany();
  await prisma.cafe.deleteMany();
  await prisma.post.deleteMany();
  await prisma.article.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.articleCategory.deleteMany();
  await prisma.forumVote.deleteMany();
  await prisma.forumAnswer.deleteMany();
  await prisma.forumQuestion.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.userCafeRole.deleteMany();
  await prisma.userGlobalRole.deleteMany();
  await prisma.aIKey.deleteMany();
  
  // Clear new models
  await prisma.report.deleteMany();
  await prisma.developerProfile.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.event.deleteMany();
  
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.language.deleteMany();

  // Seed Languages
  console.log('🌍 Seeding languages...');
  const languages = [
    { name: 'English', nativeName: 'English', code: 'en', direction: 'ltr' },
    { name: 'Arabic', nativeName: 'العربية', code: 'ar', direction: 'rtl' },
    { name: 'Turkish', nativeName: 'Türkçe', code: 'tr', direction: 'ltr' },
    { name: 'French', nativeName: 'Français', code: 'fr', direction: 'ltr' },
    { name: 'Spanish', nativeName: 'Español', code: 'es', direction: 'ltr' },
    { name: 'German', nativeName: 'Deutsch', code: 'de', direction: 'ltr' },
  ];

  const createdLanguages: any[] = [];
  for (const lang of languages) {
    const createdLang = await prisma.language.create({ data: lang });
    createdLanguages.push(createdLang);
  }

  // Seed Countries
  console.log('🏴 Seeding countries...');
  const countries = [
    { name: 'United States', code: 'US', languageId: createdLanguages[0].id },
    { name: 'United Kingdom', code: 'GB', languageId: createdLanguages[0].id },
    { name: 'Canada', code: 'CA', languageId: createdLanguages[0].id },
    { name: 'Saudi Arabia', code: 'SA', languageId: createdLanguages[1].id },
    { name: 'Syria', code: 'SY', languageId: createdLanguages[1].id },
    { name: 'Turkey', code: 'TR', languageId: createdLanguages[2].id },
    { name: 'France', code: 'FR', languageId: createdLanguages[3].id },
    { name: 'Spain', code: 'ES', languageId: createdLanguages[4].id },
    { name: 'Germany', code: 'DE', languageId: createdLanguages[5].id },
  ];

  const createdCountries: any[] = [];
  for (const country of countries) {
    const createdCountry = await prisma.country.create({ data: country });
    createdCountries.push(createdCountry);
  }

  // Seed Cities
  console.log('🏙️ Seeding cities...');
  const cities = [
    { name: 'New York', countryId: createdCountries[0].id },
    { name: 'Los Angeles', countryId: createdCountries[0].id },
    { name: 'London', countryId: createdCountries[1].id },
    { name: 'Toronto', countryId: createdCountries[2].id },
    { name: 'Riyadh', countryId: createdCountries[3].id },
    { name: 'Damascus', countryId: createdCountries[4].id },
    { name: 'Istanbul', countryId: createdCountries[5].id },
    { name: 'Paris', countryId: createdCountries[6].id },
    { name: 'Madrid', countryId: createdCountries[7].id },
    { name: 'Berlin', countryId: createdCountries[8].id },
  ];

  const createdCities: any[] = [];
  for (const city of cities) {
    const createdCity = await prisma.city.create({ data: city });
    createdCities.push(createdCity);
  }

  // Seed Users
  console.log('👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users: any[] = [];
  const userRoles = [UserRole.MEMBER, UserRole.THINKER, UserRole.JOURNALIST, UserRole.BARISTA];
  
  for (let i = 0; i < 20; i++) {
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
        languageId: createdLanguages[faker.number.int({ min: 0, max: createdLanguages.length - 1 })].id,
        countryId: createdCountries[faker.number.int({ min: 0, max: createdCountries.length - 1 })].id,
        cityId: createdCities[faker.number.int({ min: 0, max: createdCities.length - 1 })].id,
        isActive: true,
        emailVerified: true,
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
      bio: 'TechVerse Platform Administrator',
      role: UserRole.BARISTA,
      xp: 9999,
      languageId: createdLanguages[0].id,
      countryId: createdCountries[0].id,
      cityId: createdCities[0].id,
      isActive: true,
      emailVerified: true,
    },
  });
  users.push(adminUser);

  // Seed Article Categories
  console.log('📂 Seeding article categories...');
  const categories = [
    { name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming articles' },
    { name: 'React', slug: 'react', description: 'React framework articles' },
    { name: 'Node.js', slug: 'nodejs', description: 'Node.js backend development' },
    { name: 'Python', slug: 'python', description: 'Python programming articles' },
    { name: 'AI & ML', slug: 'ai-ml', description: 'Artificial Intelligence and Machine Learning' },
    { name: 'DevOps', slug: 'devops', description: 'DevOps and deployment articles' },
  ];

  const createdCategories: any[] = [];
  for (const category of categories) {
    const createdCategory = await prisma.articleCategory.create({ data: category });
    createdCategories.push(createdCategory);
  }

  // Seed Article Tags
  console.log('🏷️ Seeding article tags...');
  const tags = [
    { name: 'Beginner', slug: 'beginner' },
    { name: 'Advanced', slug: 'advanced' },
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Tips', slug: 'tips' },
    { name: 'Best Practices', slug: 'best-practices' },
    { name: 'Performance', slug: 'performance' },
    { name: 'Security', slug: 'security' },
    { name: 'Testing', slug: 'testing' },
  ];

  const createdTags: any[] = [];
  for (const tag of tags) {
    const createdTag = await prisma.articleTag.create({ data: tag });
    createdTags.push(createdTag);
  }

  // Seed Articles
  console.log('📰 Seeding articles...');
  const languageCodes = ['en', 'ar', 'tr', 'fr', 'es', 'de'];
  const countryCodes = ['US', 'GB', 'CA', 'SA', 'SY', 'TR', 'FR', 'ES', 'DE'];

  const createdArticles: any[] = [];
  for (let i = 0; i < 50; i++) {
    const title = faker.lorem.sentence({ min: 5, max: 12 });
    const slug = faker.helpers.slugify(title).toLowerCase();
    
    const article = await prisma.article.create({
      data: {
        title,
        slug: `${slug}-${i}`,
        content: faker.lorem.paragraphs(8, '\n\n'),
        excerpt: faker.lorem.paragraph(3),
        featuredImage: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
        categoryId: createdCategories[faker.number.int({ min: 0, max: createdCategories.length - 1 })].id,
        authorId: faker.helpers.arrayElement(users).id,
        languageCode: faker.helpers.arrayElement(languageCodes),
        countryCode: faker.helpers.arrayElement(countryCodes),
        isPublished: faker.datatype.boolean(0.8),
        publishedAt: faker.date.past(),
        featured: faker.datatype.boolean(0.2),
      },
    });

    // Add tags to articles
    const numTags = faker.number.int({ min: 1, max: 3 });
    const selectedTags = faker.helpers.arrayElements(createdTags, numTags);
    
    for (const tag of selectedTags) {
      await prisma.articleTagRelation.create({
        data: {
          articleId: article.id,
          tagId: tag.id,
        },
      });
    }
  }

  // Seed Posts
  console.log('📱 Seeding posts...');
  const postTypes = [PostType.TEXT, PostType.IMAGE, PostType.VIDEO, PostType.LINK];
  
  for (let i = 0; i < 100; i++) {
    const postType = faker.helpers.arrayElement(postTypes);
    let mediaUrl = null;
    let linkUrl = null;

    if (postType === PostType.IMAGE) {
      mediaUrl = faker.image.urlPicsumPhotos({ width: 600, height: 400 });
    } else if (postType === PostType.VIDEO) {
      mediaUrl = 'https://example.com/video.mp4';
    } else if (postType === PostType.LINK) {
      linkUrl = faker.internet.url();
    }

    await prisma.post.create({
      data: {
        content: faker.lorem.paragraph(faker.number.int({ min: 1, max: 4 })),
        type: postType,
        mediaUrl,
        linkUrl,
        authorId: faker.helpers.arrayElement(users).id,
        isPublic: faker.datatype.boolean(0.9),
        isPublished: faker.datatype.boolean(0.95),
        publishedAt: faker.date.past(),
        languageCode: faker.helpers.arrayElement(languageCodes),
        countryCode: faker.helpers.arrayElement(countryCodes),
      },
    });
  }

  // Seed Cafes
  console.log('☕ Seeding cafes...');
  const cafeNames = [
    'JavaScript Developers',
    'React Enthusiasts', 
    'Python Coders',
    'AI Researchers',
    'Frontend Masters',
    'Backend Engineers',
    'Mobile Developers',
    'DevOps Experts',
    'Data Scientists',
    'Cybersecurity Pros',
  ];

  const cafes: any[] = [];
  for (const name of cafeNames) {
    const cafe = await prisma.cafe.create({
      data: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        description: faker.lorem.paragraph(3),
        coverImage: faker.image.urlPicsumPhotos({ width: 800, height: 300 }),
        ownerId: faker.helpers.arrayElement(users).id,
        isPrivate: faker.datatype.boolean(0.2),
        languageCode: faker.helpers.arrayElement(languageCodes),
        countryCode: faker.helpers.arrayElement(countryCodes),
      },
    });
    cafes.push(cafe);

    // Add members to cafes
    const numMembers = faker.number.int({ min: 3, max: 10 });
    const selectedUsers = faker.helpers.arrayElements(users, numMembers);
    
    for (const user of selectedUsers) {
      try {
        await prisma.cafeMember.create({
          data: {
            cafeId: cafe.id,
            userId: user.id,
          },
        });
      } catch {
        // Ignore duplicate member errors
      }
    }
  }

  // Seed Cafe Posts
  console.log('📝 Seeding cafe posts...');
  for (let i = 0; i < 50; i++) {
    await prisma.cafePost.create({
      data: {
        content: faker.lorem.paragraph(faker.number.int({ min: 1, max: 3 })),
        cafeId: faker.helpers.arrayElement(cafes).id,
        authorId: faker.helpers.arrayElement(users).id,
      },
    });
  }

  // Seed Playlists (Podcasts)
  console.log('🎧 Seeding playlists and episodes...');
  const playlistTitles = [
    'Tech Talks Weekly',
    'JavaScript Deep Dive',
    'AI Revolution',
    'Startup Stories',
    'Code Reviews Live',
    'DevOps Chronicles',
  ];

  for (const title of playlistTitles) {
    const playlist = await prisma.playlist.create({
      data: {
        title,
        description: faker.lorem.paragraph(2),
        coverImage: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
        isPublic: true,
        languageCode: faker.helpers.arrayElement(languageCodes),
        countryCode: faker.helpers.arrayElement(countryCodes),
      },
    });

    // Add episodes to playlist
    const numEpisodes = faker.number.int({ min: 5, max: 15 });
    for (let i = 0; i < numEpisodes; i++) {
      await prisma.episode.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          description: faker.lorem.paragraph(2),
          videoUrl: `https://youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
          thumbnail: faker.image.urlPicsumPhotos({ width: 640, height: 360 }),
          duration: faker.number.int({ min: 300, max: 7200 }), // 5 min to 2 hours
          playlistId: playlist.id,
          orderIndex: i,
          isPublished: true,
        },
      });
    }
  }

  // Seed Events
  console.log('🎪 Seeding events...');
  const eventHosts = ['Google', 'Apple', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'Spotify'];
  const eventTypes = ['Conference', 'Workshop', 'Webinar', 'Meetup', 'Hackathon'];

  for (let i = 0; i < 20; i++) {
    const host = faker.helpers.arrayElement(eventHosts);
    const eventType = faker.helpers.arrayElement(eventTypes);
    const startDate = faker.date.future();
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000);

    await prisma.event.create({
      data: {
        title: `${host} ${eventType} ${faker.date.recent().getFullYear()}`,
        host,
        startDate,
        endDate,
        details: faker.lorem.paragraph(4),
        link: faker.internet.url(),
        mediaUrl: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
        result: faker.datatype.boolean(0.3) ? faker.lorem.paragraph(2) : null,
        resultUrl: faker.datatype.boolean(0.3) ? faker.internet.url() : null,
      },
    });
  }

  // Seed Issues
  console.log('🐛 Seeding issues...');
  const issueTags = [
    'bug', 'feature', 'enhancement', 'question', 'help-wanted',
    'good-first-issue', 'documentation', 'performance', 'security'
  ];

  const issues: any[] = [];
  for (let i = 0; i < 30; i++) {
    const status = faker.helpers.arrayElement([IssueStatus.OPEN, IssueStatus.ACTIVE, IssueStatus.SOLVED]);
    const createdBy = faker.helpers.arrayElement(users);
    let solvedBy = null;
    let solvedAt = null;

    if (status === IssueStatus.SOLVED) {
      solvedBy = faker.helpers.arrayElement(users);
      solvedAt = faker.date.past();
    }

    const issue = await prisma.issue.create({
      data: {
        title: faker.lorem.sentence({ min: 4, max: 10 }),
        description: faker.lorem.paragraphs(3, '\n\n'),
        status,
        tags: faker.helpers.arrayElements(issueTags, faker.number.int({ min: 1, max: 3 })),
        createdById: createdBy.id,
        solvedById: solvedBy?.id,
        solvedAt,
      },
    });
    issues.push(issue);
  }

  // Seed Developer Profiles
  console.log('🏆 Seeding developer profiles...');
  for (const user of users) {
    // Count solved issues for this user
    const solvedIssuesCount = await prisma.issue.count({
      where: { solvedById: user.id, status: IssueStatus.SOLVED }
    });

    // Calculate points (10 points per solved issue)
    const points = solvedIssuesCount * 10;

    // Determine rank based on points
    let rank = DeveloperRank.BEGINNER;
    if (points >= 500) rank = DeveloperRank.CONSULTANT;
    else if (points >= 200) rank = DeveloperRank.EXPERT;
    else if (points >= 50) rank = DeveloperRank.PROBLEM_SOLVER;

    await prisma.developerProfile.create({
      data: {
        userId: user.id,
        points,
        rank,
      },
    });
  }

  // Seed Reports
  console.log('📢 Seeding reports...');
  const contentTypes = ['article', 'post', 'cafe', 'episode'];
  const reportReasons = [
    'Inappropriate content',
    'Spam',
    'Harassment',
    'Copyright violation',
    'Misinformation',
    'Offensive language',
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.report.create({
      data: {
        contentType: faker.helpers.arrayElement(contentTypes),
        contentId: faker.number.int({ min: 1, max: 10 }),
        reason: faker.helpers.arrayElement(reportReasons),
        reportedById: faker.helpers.arrayElement(users).id,
        status: faker.helpers.arrayElement(['PENDING', 'REVIEWED', 'REJECTED']),
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Articles: 50`);
  console.log(`   Posts: 100`);
  console.log(`   Cafes: ${cafes.length}`);
  console.log(`   Playlists: ${playlistTitles.length}`);
  console.log(`   Events: 20`);
  console.log(`   Issues: 30`);
  console.log(`   Reports: 15`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
