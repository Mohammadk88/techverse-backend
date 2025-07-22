const fs = require('fs');
const path = require('path');

// Final round of replacements for remaining field issues
const finalReplacements = [
  // Field name fixes in prisma calls
  { from: /nativeName:/g, to: 'native_name:' },
  { from: /languageId:/g, to: 'language_id:' },
  { from: /countryId:/g, to: 'country_id:' },
  { from: /lastName:/g, to: 'last_name:' },
  { from: /isPublic:/g, to: 'is_public:' },
  { from: /projectId:/g, to: 'project_id:' },
  { from: /taskId:/g, to: 'task_id:' },
  { from: /applicantId:/g, to: 'applicant_id:' },
  { from: /userId:/g, to: 'user_id:' },
  { from: /cafeId:/g, to: 'cafe_id:' },
  { from: /challengeId:/g, to: 'challenge_id:' },
  { from: /articleId:/g, to: 'article_id:' },
  { from: /categoryId:/g, to: 'category_id:' },
  { from: /authorId:/g, to: 'author_id:' },
  { from: /ownerId:/g, to: 'owner_id:' },
  { from: /roleId:/g, to: 'role_id:' },
  { from: /providerId:/g, to: 'provider_id:' },
  { from: /cityId:/g, to: 'city_id:' },
  { from: /parentId:/g, to: 'parent_id:' },
  { from: /tagId:/g, to: 'tag_id:' },
  { from: /postId:/g, to: 'post_id:' },
  { from: /memberId:/g, to: 'member_id:' },
  { from: /participantId:/g, to: 'participant_id:' },
  { from: /entryFee:/g, to: 'entryFee:' }, // This one should stay as is based on schema
  { from: /techCoin:/g, to: 'tech_coin:' },
  { from: /emailVerified:/g, to: 'email_verified:' },
  { from: /isActive:/g, to: 'is_active:' },
  { from: /isPaid:/g, to: 'is_paid:' },
  { from: /isApplied:/g, to: 'is_applied:' },
  { from: /secretKey:/g, to: 'secret_key:' },
  { from: /keyName:/g, to: 'key_name:' },
  { from: /isDefault:/g, to: 'is_default:' },
  { from: /featuredImage:/g, to: 'featured_image:' },
  { from: /coverImage:/g, to: 'cover_image:' },
  { from: /isPrivate:/g, to: 'is_private:' },
  { from: /isPublished:/g, to: 'is_published:' },
  { from: /publishedAt:/g, to: 'published_at:' },
  { from: /voteCount:/g, to: 'vote_count:' },
  { from: /aiPrompt:/g, to: 'ai_prompt:' },
  { from: /isAi:/g, to: 'is_ai:' },
  { from: /enhancementType:/g, to: 'enhancement_type:' },
  { from: /originalValue:/g, to: 'original_value:' },
  { from: /enhancedValue:/g, to: 'enhanced_value:' },
  { from: /coinSpent:/g, to: 'coin_spent:' },
  { from: /isApplied:/g, to: 'is_applied:' },
  { from: /startDate:/g, to: 'start_date:' },
  { from: /endDate:/g, to: 'end_date:' },
  { from: /joinedAt:/g, to: 'joined_at:' },
  { from: /assignedAt:/g, to: 'assigned_at:' },
  { from: /submittedAt:/g, to: 'submitted_at:' },
  { from: /submissionUrl:/g, to: 'submission_url:' },
  { from: /createdAt:/g, to: 'created_at:' },
  { from: /updatedAt:/g, to: 'updated_at:' },
  { from: /paidAt:/g, to: 'paid_at:' },
  { from: /publishAt:/g, to: 'publish_at:' },
  { from: /countryCode:/g, to: 'country_code:' },
  { from: /languageCode:/g, to: 'language_code:' },
  { from: /createdBy:/g, to: 'created_by:' },
  { from: /createdById:/g, to: 'created_by_id:' },
  { from: /followerId:/g, to: 'follower_id:' },
  { from: /followingId:/g, to: 'following_id:' },
  { from: /aiEnhanced:/g, to: 'ai_enhanced:' },
  
  // Fix property accesses that reference wrong field names
  { from: /\.createdAt\b/g, to: '.created_at' },
  { from: /\.updatedAt\b/g, to: '.updated_at' },
  { from: /\.publishedAt\b/g, to: '.published_at' },
  { from: /\.startDate\b/g, to: '.start_date' },
  { from: /\.endDate\b/g, to: '.end_date' },
  { from: /\.submissionUrl\b/g, to: '.submission_url' },
  { from: /\.submittedAt\b/g, to: '.submitted_at' },
  { from: /\.assignedAt\b/g, to: '.assigned_at' },
  { from: /\.joinedAt\b/g, to: '.joined_at' },
  { from: /\.paidAt\b/g, to: '.paid_at' },
  
  // Fix relation references that need to use correct names
  { from: /language:\s*{/g, to: 'languages: {' },
  { from: /country:\s*{/g, to: 'countries: {' },
  { from: /city:\s*{/g, to: 'cities: {' },
  
  // Additional updated_at requirements fixes
  { from: /(create\([^}]+data:\s*{[^}]+)(\}\s*,?\s*\})/g, to: '$1, updated_at: new Date()$2' },
];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    finalReplacements.forEach(replacement => {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively process directory
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(itemPath);
    } else if (stats.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
      processFile(itemPath);
    }
  });
}

// Process both src and prisma directories
const srcDir = path.join(__dirname, 'src');
const prismaDir = path.join(__dirname, 'prisma');

console.log('Processing final field name issues...');
processDirectory(srcDir);
processDirectory(prismaDir);

console.log('Done!');
