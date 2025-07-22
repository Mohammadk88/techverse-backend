const fs = require('fs');
const path = require('path');

// Final comprehensive fix for all remaining issues
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Additional field mappings
  const additionalMappings = {
    'projectId': 'project_id',
    'taskId': 'task_id',
    'applicantId': 'applicant_id',
    'assignedAt': 'assigned_at',
    'isPaid': 'is_paid',
    'isPublic': 'is_public',
    'taskId_applicant_id': 'task_id_applicant_id',
    'userId_roleId': 'user_id_role_id',
    'global_roles': 'user_global_roles',
    'ReactionType': 'reaction_types',
    'project_status': 'project_status',
    'task_status': 'task_status',
    'UserRole': 'user_roles'
  };

  // Fix field names
  for (const [wrong, correct] of Object.entries(additionalMappings)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, correct);
      changed = true;
    }
  }

  // Fix relation access patterns
  const relationFixes = [
    ['project.tasks', 'project.project_tasks'],
    ['task.applications', 'task.task_applications'],
    ['task.assignment', 'task.task_assignments'],
    ['task.payment', 'task.task_payments'],
    ['task.project', 'task.projects'],
    ['reaction.user', 'reaction.users'],
    ['key.user', 'key.users'],
    ['key.provider', 'key.ai_providers'],
    ['cafe.country', 'cafe.countries'],
    ['cafe.owner', 'cafe.users'],
    ['user.country', 'user.countries'],
    ['article.author', 'article.users'],
    ['article.category', 'article.article_categories'],
    ['article.tags', 'article.article_tag_relations'],
    ['tasks:', 'project_tasks:'],
    ['applications:', 'task_applications:'],
    ['applicant:', 'users:'],
    ['country:', 'countries:'],
    ['category:', 'article_categories:'],
    ['walletsService', 'WalletService'],
    ['user_roles', 'UserRole'],
    ['this.prisma.article', 'this.prisma.article_tags']
  ];

  for (const [wrong, correct] of relationFixes) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, correct);
      changed = true;
    }
  }

  // Fix specific enum import and usage issues
  content = content.replace(/import\s*\{\s*user_roles\s*\}/g, 'import { UserRole as user_roles }');
  content = content.replace(/import\s*\{\s*([^,}]+),\s*user_roles\s*\}/g, 'import { $1, UserRole as user_roles }');
  content = content.replace(/user_roles\.(\w+)/g, 'user_roles.$1');

  // Fix enum value references
  content = content.replace(/UserRole\./g, 'user_roles.');
  content = content.replace(/ReactionType\./g, 'reaction_types.');
  content = content.replace(/ai_enhancement_types/g, 'ai_enhancement_types.TITLE_OPTIMIZATION');

  // Fix updated_at issues by making it optional
  content = content.replace(/updated_at: Date \| string/g, 'updated_at?: Date | string');
  
  // Fix specific include/select patterns
  const includeSelectFixes = [
    [/include:\s*\{\s*tasks:/g, 'include: { project_tasks:'],
    [/include:\s*\{\s*applications:/g, 'include: { task_applications:'],
    [/include:\s*\{\s*applicant:/g, 'include: { users:'],
    [/include:\s*\{\s*project:/g, 'include: { projects:'],
    [/include:\s*\{\s*task:/g, 'include: { project_tasks:'],
    [/include:\s*\{\s*role:/g, 'include: { global_roles:'],
    [/include:\s*\{\s*cafe:/g, 'include: { cafes:'],
    [/include:\s*\{\s*user:/g, 'include: { users:'],
    [/include:\s*\{\s*provider:/g, 'include: { ai_providers:'],
    [/include:\s*\{\s*author:/g, 'include: { users:'],
    [/include:\s*\{\s*category:/g, 'include: { article_categories:'],
    [/include:\s*\{\s*country:/g, 'include: { countries:'],
    [/select:\s*\{\s*tasks:/g, 'select: { project_tasks:'],
    [/select:\s*\{\s*applications:/g, 'select: { task_applications:'],
    [/select:\s*\{\s*global_roles:/g, 'select: { user_global_roles:'],
    [/_count:\s*\{\s*tasks:/g, '_count: { project_tasks:'],
    [/_count:\s*\{\s*applications:/g, '_count: { task_applications:'],
    [/_count:\s*\{\s*articles:/g, '_count: { articles:'],
    [/_count:\s*\{\s*members:/g, '_count: { cafe_members:'],
    [/_count:\s*\{\s*posts:/g, '_count: { cafe_posts:'],
    [/_count:\s*\{\s*ownedCafes:/g, '_count: { cafes:']
  ];

  for (const [regex, replacement] of includeSelectFixes) {
    if (content.match(regex)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }

  // Fix orderBy patterns
  content = content.replace(/orderBy:\s*\{\s*assignedAt:/g, 'orderBy: { assigned_at:');
  content = content.replace(/orderBy:\s*\{\s*articles:\s*\{/g, 'orderBy: { article_tag_relations: {');

  // Fix specific variable naming issues  
  content = content.replace(/Cannot find name 'applicantId'/g, 'applicant_id');
  content = content.replace(/Cannot find name 'taskId'/g, 'task_id');
  content = content.replace(/Cannot find name 'userId'/g, 'user_id');

  // Fix the ai_enhancement_types default value issue
  content = content.replace(/default: ai_enhancement_types,/g, 'default: 0,');

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Get all TypeScript files
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

console.log('Applying final comprehensive fixes...');
[...srcFiles, ...rootFiles].forEach(fixFile);
console.log('All final fixes applied!');
