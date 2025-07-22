const fs = require('fs');
const path = require('path');

// Additional replacements for seed files and remaining issues
const seedReplacements = [
  // Prisma model name fixes
  { from: /prisma\.bookmark\./g, to: 'prisma.bookmarks.' },
  { from: /prisma\.cafePost\./g, to: 'prisma.cafe_posts.' },
  { from: /prisma\.cafeMember\./g, to: 'prisma.cafe_members.' },
  { from: /prisma\.cafe\./g, to: 'prisma.cafes.' },
  { from: /prisma\.article\./g, to: 'prisma.articles.' },
  { from: /prisma\.articleTag\./g, to: 'prisma.article_tags.' },
  { from: /prisma\.articleCategory\./g, to: 'prisma.article_categories.' },
  { from: /prisma\.userCafeRole\./g, to: 'prisma.user_cafe_roles.' },
  { from: /prisma\.userGlobalRole\./g, to: 'prisma.user_global_roles.' },
  { from: /prisma\.cafeRole\./g, to: 'prisma.cafe_roles.' },
  { from: /prisma\.globalRole\./g, to: 'prisma.global_roles.' },
  { from: /prisma\.aIKey\./g, to: 'prisma.ai_keys.' },
  { from: /prisma\.user\./g, to: 'prisma.users.' },
  { from: /prisma\.city\./g, to: 'prisma.cities.' },
  { from: /prisma\.country\./g, to: 'prisma.countries.' },
  { from: /prisma\.language\./g, to: 'prisma.languages.' },
  
  // Additional field fixes that might have been missed
  { from: /updated_at:\s*new\s*Date\(\)/g, to: 'updated_at: new Date()' },
  { from: /startDate/g, to: 'start_date' },
  { from: /endDate/g, to: 'end_date' },
  { from: /submissionUrl/g, to: 'submission_url' },
  { from: /submission_url_url/g, to: 'submission_url' }, // Fix double replacement
  
  // Fix count and relation issues
  { from: /\._count\.posts\b/g, to: '._count.cafe_posts' },
  { from: /\._count\.members\b/g, to: '._count.cafe_members' },
  
  // Fix includes that might have been missed
  { from: /include:\s*{\s*task:\s*{/g, to: 'include: { project_tasks: {' },
  { from: /include:\s*{\s*payment:\s*true/g, to: 'include: { task_payments: true' },
  
  // Fix enum references
  { from: /task_status\.PENDING/g, to: 'task_status.PENDING' },
  { from: /task_status\.ASSIGNED/g, to: 'task_status.ASSIGNED' },
  { from: /task_status\.DONE/g, to: 'task_status.DONE' },
  
  // Fix other common issues
  { from: /\.project\b/g, to: '.projects' },
  { from: /is_published:\s*false/g, to: 'is_published: false' },
  { from: /scheduled_for:/g, to: 'scheduled_for:' },
  { from: /featured:/g, to: 'featured:' },
  { from: /title:/g, to: 'title:' },
];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    seedReplacements.forEach(replacement => {
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

console.log('Processing remaining issues...');
processDirectory(srcDir);
processDirectory(prismaDir);

console.log('Done!');
