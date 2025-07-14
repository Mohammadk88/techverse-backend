import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding scheduled content and AI data...');

  // Ensure we have a test user with journalist role
  const testUser = await prisma.user.upsert({
    where: { email: 'journalist@techverse.test' },
    update: {},
    create: {
      email: 'journalist@techverse.test',
      username: 'test_journalist',
      firstName: 'Test',
      lastName: 'Journalist',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewthePdusua0aGQy', // password123
      role: UserRole.JOURNALIST,
      bio: 'Test journalist for AI and scheduling features',
      emailVerified: true,
    },
  });

  console.log(`👤 Created/Updated test user: ${testUser.email}`);

  // Create categories for testing
  const categories = [
    'Technology',
    'AI & Machine Learning',
    'Web Development',
    'Mobile Apps',
    'DevOps',
  ];
  const createdCategories: any[] = [];

  for (const categoryName of categories) {
    const category = await prisma.articleCategory.upsert({
      where: {
        slug: categoryName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/&/g, 'and'),
      },
      update: {},
      create: {
        name: categoryName,
        description: `Articles about ${categoryName}`,
        slug: categoryName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/&/g, 'and'),
      },
    });
    createdCategories.push(category);
  }

  console.log(`📂 Created/Updated ${createdCategories.length} categories`);

  // Create scheduled articles (future dates for testing auto-publishing)
  const now = new Date();
  const scheduledArticles = [
    {
      title: 'AI-Generated: The Future of Machine Learning in 2025',
      content: 'This is an AI-generated article about machine learning trends that are reshaping technology...',
      excerpt: 'Exploring the latest ML trends and their impact on software development.',
      scheduledFor: new Date(now.getTime() + 2 * 60 * 1000), // 2 minutes from now
      isAI: true,
      aiPrompt: 'Write an article about machine learning trends in 2025',
      categoryId: createdCategories[1].id,
    },
    {
      title: 'Scheduled: Best Practices for React Performance Optimization',
      content: 'Learn how to optimize your React applications for better performance...',
      excerpt: 'A comprehensive guide to React optimization techniques.',
      scheduledFor: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
      isAI: false,
      categoryId: createdCategories[2].id,
    },
    {
      title: 'AI-Generated: Building Scalable Microservices Architecture',
      content: 'This AI-generated content covers microservices architecture patterns...',
      excerpt: 'Understanding microservices design patterns and implementation strategies.',
      scheduledFor: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes from now
      isAI: true,
      aiPrompt: 'Create an article about microservices architecture best practices',
      categoryId: createdCategories[4].id,
    },
  ];

  for (let i = 0; i < scheduledArticles.length; i++) {
    const articleData = scheduledArticles[i];
    const baseSlug = articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now()}-${i}`;
    
    const article = await prisma.article.create({
      data: {
        ...articleData,
        slug: uniqueSlug,
        authorId: testUser.id,
        isPublished: false, // Will be published by scheduler
      },
    });
    console.log(`📄 Created scheduled article: "${article.title}" - Publishing at ${article.scheduledFor}`);
  }

  // Create scheduled posts
  const scheduledPosts = [
    {
      content: 'AI-Generated: Just discovered an amazing new framework for building APIs! 🚀 #TechNews #API',
      scheduledFor: new Date(now.getTime() + 3 * 60 * 1000), // 3 minutes from now
      isAI: true,
      aiPrompt: 'Create a social media post about a new API framework',
    },
    {
      content: 'Scheduled post: Working on some exciting new features for our platform! Stay tuned 💻 #Development',
      scheduledFor: new Date(now.getTime() + 7 * 60 * 1000), // 7 minutes from now
      isAI: false,
    },
    {
      content: 'AI-Generated: The future of web development is here! Progressive Web Apps are changing everything 🌐 #PWA #WebDev',
      scheduledFor: new Date(now.getTime() + 12 * 60 * 1000), // 12 minutes from now
      isAI: true,
      aiPrompt: 'Write a social media post about Progressive Web Apps',
    },
  ];

  for (const postData of scheduledPosts) {
    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: testUser.id,
        isPublished: false, // Will be published by scheduler
      },
    });
    console.log(`📱 Created scheduled post: "${post.content.substring(0, 50)}..." - Publishing at ${post.scheduledFor}`);
  }

  // Create some published content for comparison
  const publishedArticle = await prisma.article.create({
    data: {
      title: 'Published: Getting Started with NestJS and Prisma',
      content: 'This is a comprehensive guide to building modern APIs with NestJS and Prisma...',
      excerpt: 'Learn how to set up a robust backend with NestJS and Prisma ORM.',
      slug: 'published-getting-started-with-nestjs-and-prisma',
      authorId: testUser.id,
      categoryId: createdCategories[2].id,
      isPublished: true,
      publishedAt: now,
      isAI: false,
    },
  });

  const publishedPost = await prisma.post.create({
    data: {
      content: 'Just published a new article about NestJS! Check it out 📖 #NestJS #Backend',
      authorId: testUser.id,
      isPublished: true,
      publishedAt: now,
      isAI: false,
    },
  });

  console.log(`✅ Created published content for comparison`);

  // Display summary
  const totalScheduledArticles = await prisma.article.count({
    where: { scheduledFor: { not: null }, isPublished: false },
  });

  const totalScheduledPosts = await prisma.post.count({
    where: { scheduledFor: { not: null }, isPublished: false },
  });

  const totalAIContent = await prisma.article.count({
    where: { isAI: true },
  }) + await prisma.post.count({
    where: { isAI: true },
  });

  console.log('\n📊 SEEDING SUMMARY:');
  console.log(`   📄 Scheduled Articles: ${totalScheduledArticles}`);
  console.log(`   📱 Scheduled Posts: ${totalScheduledPosts}`);
  console.log(`   🤖 AI-Generated Content: ${totalAIContent}`);
  console.log(`   👤 Test User: ${testUser.email} (${testUser.role})`);
  console.log('\n⏰ SCHEDULER TESTING:');
  console.log('   • Articles will auto-publish in 2, 5, and 10 minutes');
  console.log('   • Posts will auto-publish in 3, 7, and 12 minutes');
  console.log('   • Check /scheduler/scheduled endpoint to monitor');
  console.log('   • The cron job runs every 5 minutes to publish due content');
  console.log('\n🤖 AI TESTING:');
  console.log('   • Use the test user credentials to access AI endpoints');
  console.log('   • Try POST /articles/ai/generate with different prompts');
  console.log('   • Try GET /articles/ai/suggestions for content ideas');
  console.log('\n🎯 API Documentation: http://localhost:4040/api/docs');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
