const fs = require('fs');
const path = require('path');

// Define common replacements
const replacements = [
  // Table name fixes
  { from: /\.article_tagss\./g, to: '.article_tags.' },
  { from: /\.article_tags_tag_relations\./g, to: '.article_tag_relations.' },
  { from: /\.article_tags_categories\./g, to: '.article_categories.' },
  { from: /\.article_tags_boosts\./g, to: '.article_boosts.' },
  { from: /\.taskPayment\./g, to: '.task_payments.' },
  { from: /\.taskAssignment\./g, to: '.task_assignments.' },
  { from: /\.taskApplication\./g, to: '.task_applications.' },
  { from: /\.projectTask\./g, to: '.project_tasks.' },
  { from: /\.project\./g, to: '.projects.' },
  { from: /\.articleTagRelation\./g, to: '.article_tag_relations.' },
  
  // Field name fixes
  { from: /publishAt:/g, to: 'publish_at:' },
  { from: /paidAt:/g, to: 'paid_at:' },
  { from: /submittedAt:/g, to: 'submitted_at:' },
  { from: /joinedAt:/g, to: 'joined_at:' },
  { from: /createdById:/g, to: 'created_by_id:' },
  { from: /followingId:/g, to: 'following_id:' },
  { from: /followerId:/g, to: 'follower_id:' },
  { from: /firstName:/g, to: 'first_name:' },
  { from: /isActive:/g, to: 'is_active:' },
  { from: /first_role_name:/g, to: 'first_name:' },
  
  // Enum fixes
  { from: /UserRole\./g, to: 'user_roles.' },
  { from: /task_status\./g, to: 'task_status.' },
  
  // Property access fixes
  { from: /\.users_id/g, to: '.user_id' },
  { from: /\.cafe\.users_id/g, to: '.cafes.owner_id' },
  { from: /\.challenge\./g, to: '.challenges.' },
  { from: /\.participants\./g, to: '.challenge_participants.' },
  { from: /\.members\./g, to: '.cafe_members.' },
  { from: /\.userss\./g, to: '.users.' },
  
  // Include fixes
  { from: /members:\s*{/g, to: 'cafe_members: {' },
  { from: /cafe:\s*{/g, to: 'cafes: {' },
  { from: /challenge:\s*{/g, to: 'challenges: {' },
  { from: /participants:\s*{/g, to: 'challenge_participants: {' },
  { from: /task:\s*{/g, to: 'project_tasks: {' },
  { from: /payment:\s*true/g, to: 'task_payments: true' },
  
  // Count fixes
  { from: /\._count\.members/g, to: '._count.cafe_members' },
  { from: /\._count\.posts/g, to: '._count.cafe_posts' },
  { from: /\._count\.participants/g, to: '._count.challenge_participants' },
  { from: /\._count\.reactions/g, to: '._count.reactions' },
  { from: /\._count\.bookmarks/g, to: '._count.bookmarks' },
  
  // Unique constraint fixes
  { from: /cafeId_user_id:/g, to: 'cafe_id_user_id:' },
  { from: /challengeId:/g, to: 'challenge_id:' },
  
  // Order by fixes
  { from: /orderBy:\s*{\s*joinedAt:/g, to: 'orderBy: { joined_at:' },
  { from: /orderBy:\s*{\s*createdAt:/g, to: 'orderBy: { created_at:' },
  { from: /orderBy:\s*{\s*publishAt:/g, to: 'orderBy: { publish_at:' },
  { from: /orderBy:\s*{\s*role_name:/g, to: 'orderBy: { name:' },
  
  // Where clause fixes
  { from: /where:\s*{\s*createdById:/g, to: 'where: { created_by_id:' },
  { from: /where:\s*{\s*followingId:/g, to: 'where: { following_id:' },
  { from: /where:\s*{\s*followerId:/g, to: 'where: { follower_id:' },
  { from: /where:\s*{\s*isActive:/g, to: 'where: { is_active:' },
];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(replacement => {
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

// Process src directory
const srcDir = path.join(__dirname, 'src');
const prismaDir = path.join(__dirname, 'prisma');

console.log('Processing src directory...');
processDirectory(srcDir);

console.log('Processing prisma directory...');
processDirectory(prismaDir);

console.log('Done!');
