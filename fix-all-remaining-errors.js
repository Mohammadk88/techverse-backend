const fs = require('fs');
const path = require('path');

// Mapping of incorrect names to correct names
const fieldMappings = {
  // Fields that should be snake_case
  'isPublished': 'is_published',
  'isActive': 'is_active',
  'isDefault': 'is_default',
  'isPrivate': 'is_private',
  'isAI': 'is_ai',
  'techCoin': 'tech_coin',
  'firstName': 'first_name',
  'lastName': 'last_name',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'scheduledFor': 'scheduled_for',
  'publishedAt': 'published_at',
  'featuredImage': 'featured_image',
  'coverImage': 'cover_image',
  'languageCode': 'language_code',
  'countryCode': 'country_code',
  'countryId': 'country_id',
  'cityId': 'city_id',
  'languageId': 'language_id',
  'userId': 'user_id',
  'cafeId': 'cafe_id',
  'roleId': 'role_id',
  'userId_cafeId_roleId': 'user_id_cafe_id_role_id',
  'emailVerified': 'email_verified',
  'nativeName': 'native_name',
  'secretKey': 'secret_key',
  'providerId': 'provider_id',
  'keyName': 'key_name',
  'ownerId': 'owner_id',
  'authorId': 'author_id',
  'categoryId': 'category_id',
  'articleId': 'article_id',
  'tagId': 'tag_id'
};

// Include mappings for relation names
const relationMappings = {
  // Direct relation names
  'user': 'users',
  'follow': 'follows',
  'article': 'articles',
  'category': 'article_categories',
  'author': 'users',
  'owner': 'users',
  'provider': 'ai_providers',
  'role': 'global_roles',
  'country': 'countries',
  'language': 'languages',
  'city': 'cities',
  'cafe': 'cafes',
  'tag': 'article_tags',
  'tags': 'article_tag_relations',
  'members': 'cafe_members',
  'posts': 'cafe_posts',
  'reactions': 'reactions',
  'bookmarks': 'bookmarks',
  'articles': 'articles',
  'ownedCafes': 'cafes',
  'globalRoles': 'user_global_roles',
  'cafeRoles': 'user_cafe_roles',
  'follower': 'users_follows_follower_idTousers',
  'following': 'users_follows_following_idTousers'
};

// Enum imports that need to be updated
const enumMappings = {
  'user_roles': 'user_roles',
  'UserRole': 'user_roles',
  'ReactionType': 'reaction_types',
  'TransactionType': 'transaction_types',
  'ChallengeStatus': 'challenge_status',
  'ChallengeType': 'challenge_types',
  'TaskStatus': 'task_status',
  'ProjectStatus': 'project_status',
  'ParticipantResults': 'participant_results',
  'ScheduledPostStatus': 'scheduled_post_status',
  'AiEnhancementTypes': 'ai_enhancement_types'
};

// Fix all TypeScript and JavaScript files
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix field names
  for (const [wrong, correct] of Object.entries(fieldMappings)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, correct);
      changed = true;
    }
  }

  // Fix relation names in includes/selects
  for (const [wrong, correct] of Object.entries(relationMappings)) {
    // Fix in include statements
    const includeRegex = new RegExp(`(include\\s*:\\s*\\{[^}]*\\s*)${wrong}(\\s*:)`, 'g');
    if (content.match(includeRegex)) {
      content = content.replace(includeRegex, `$1${correct}$2`);
      changed = true;
    }
    
    // Fix in select statements
    const selectRegex = new RegExp(`(select\\s*:\\s*\\{[^}]*\\s*)${wrong}(\\s*:)`, 'g');
    if (content.match(selectRegex)) {
      content = content.replace(selectRegex, `$1${correct}$2`);
      changed = true;
    }
    
    // Fix in where clauses
    const whereRegex = new RegExp(`(where\\s*:\\s*\\{[^}]*\\s*)${wrong}(\\s*:)`, 'g');
    if (content.match(whereRegex)) {
      content = content.replace(whereRegex, `$1${correct}$2`);
      changed = true;
    }
    
    // Fix in orderBy clauses
    const orderByRegex = new RegExp(`(orderBy\\s*:\\s*\\{[^}]*\\s*)${wrong}(\\s*:)`, 'g');
    if (content.match(orderByRegex)) {
      content = content.replace(orderByRegex, `$1${correct}$2`);
      changed = true;
    }
  }

  // Fix property access patterns
  const propertyAccessFixes = [
    ['article.author', 'article.users'],
    ['article.category', 'article.article_categories'],
    ['article.tags', 'article.article_tag_relations'],
    ['article.featuredImage', 'article.featured_image'],
    ['article.isPublished', 'article.is_published'],
    ['article.isAI', 'article.is_ai'],
    ['article.scheduledFor', 'article.scheduled_for'],
    ['article.languageCode', 'article.language_code'],
    ['article.countryCode', 'article.country_code'],
    ['article.createdAt', 'article.created_at'],
    ['cafe.coverImage', 'cafe.cover_image'],
    ['cafe.isPrivate', 'cafe.is_private'],
    ['cafe.owner', 'cafe.users'],
    ['cafe.country', 'cafe.countries'],
    ['cafe.createdAt', 'cafe.created_at'],
    ['user.firstName', 'user.first_name'],
    ['user.lastName', 'user.last_name'],
    ['user.techCoin', 'user.tech_coin'],
    ['user.isActive', 'user.is_active'],
    ['user.createdAt', 'user.created_at'],
    ['user.country', 'user.countries'],
    ['user.city', 'user.cities'],
    ['user.language', 'user.languages'],
    ['tag.createdAt', 'tag.created_at'],
    ['key.isActive', 'key.is_active'],
    ['key.provider', 'key.ai_providers'],
    ['key.user', 'key.users'],
    ['p.isActive', 'p.is_active'],
    ['p.isDefault', 'p.is_default'],
    ['wallet.techCoin', 'wallet.tech_coin'],
    ['follow.follower', 'follow.users_follows_follower_idTousers'],
    ['follow.following', 'follow.users_follows_following_idTousers'],
    ['walletsService', 'WalletService']
  ];

  for (const [wrong, correct] of propertyAccessFixes) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, correct);
      changed = true;
    }
  }

  // Fix enum imports and usage
  for (const [wrong, correct] of Object.entries(enumMappings)) {
    // Fix import statements
    const importRegex = new RegExp(`import\\s*\\{[^}]*\\b${wrong}\\b[^}]*\\}`, 'g');
    if (content.match(importRegex)) {
      content = content.replace(new RegExp(`\\b${wrong}\\b`, 'g'), correct);
      changed = true;
    }
    
    // Fix usage in code
    const usageRegex = new RegExp(`\\b${wrong}\\.(\\w+)`, 'g');
    if (content.match(usageRegex)) {
      content = content.replace(usageRegex, `${correct}.$1`);
      changed = true;
    }
  }

  // Fix specific enum value usage
  content = content.replace(/user_roles\\.BARISTA/g, 'user_roles.BARISTA');
  content = content.replace(/user_roles\\.JOURNALIST/g, 'user_roles.JOURNALIST');
  content = content.replace(/user_roles\\.MEMBER/g, 'user_roles.MEMBER');
  content = content.replace(/user_roles\\.THINKER/g, 'user_roles.THINKER');

  // Fix specific variable naming issues
  content = content.replace(/ai_enhancement_types/g, '0'); // This was being used as a default value
  
  // Fix the walletsService issue
  content = content.replace(/walletsService/g, 'WalletService');

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Get all TypeScript and JavaScript files in src directory
function getAllFiles(dir, fileTypes = ['.ts', '.js']) {
  const files = [];
  
  function traverseDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverseDir(itemPath);
      } else if (stat.isFile() && fileTypes.some(ext => item.endsWith(ext))) {
        files.push(itemPath);
      }
    }
  }
  
  traverseDir(dir);
  return files;
}

// Process all files
const srcFiles = getAllFiles('/Users/mohammadkfelati/MyProjects/TechVerse/projects/backend/src');
const rootFiles = [
  '/Users/mohammadkfelati/MyProjects/TechVerse/projects/backend/test-database.ts',
  '/Users/mohammadkfelati/MyProjects/TechVerse/projects/backend/test-follow-system.ts'
];

console.log('Fixing remaining TypeScript errors...');
[...srcFiles, ...rootFiles].forEach(fixFile);
console.log('All files processed!');
