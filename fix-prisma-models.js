#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File patterns and their replacements
const filePatterns = [
  {
    file: 'src/challenges/challenges.service.ts',
    replacements: [
      // Fix snake_case issues
      { from: /\.createdById/g, to: '.created_by_id' },
      { from: /\.startDate/g, to: '.start_date' },
      { from: /\.endDate/g, to: '.end_date' },
      { from: /startDate:/g, to: 'start_date:' },
      { from: /endDate:/g, to: 'end_date:' },
      { from: /submissionUrl:/g, to: 'submission_url:' },
      { from: /voteCount:/g, to: 'vote_count:' },
      { from: /\.submissionUrl/g, to: '.submission_url' },
      { from: /\.voteCount/g, to: '.vote_count' },
      { from: /\.submittedAt/g, to: '.submitted_at' },
      
      // Fix include relationships
      { from: /participants:/g, to: 'challenge_participants:' },
      { from: /createdBy:/g, to: 'users:' },
      { from: /challenge:/g, to: 'challenges:' },
      
      // Fix the challengeId parameter issue
      { from: /challenge_id: challengeId/g, to: 'challenge_id: challenge_id' },
    ]
  },
  {
    file: 'src/projects/projects.service.ts',
    replacements: [
      // Fix incorrect model references
      { from: /this\.prisma\.project\.project_tasks/g, to: 'this.prisma.project_tasks' },
      { from: /this\.prisma\.task\.task_applications/g, to: 'this.prisma.task_applications' },
      { from: /this\.prisma\.task\.task_assignmentss/g, to: 'this.prisma.task_assignments' },
      { from: /this\.prisma\.task\.task_paymentss/g, to: 'this.prisma.task_payments' },
      { from: /prisma\.project\.project_tasks/g, to: 'prisma.project_tasks' },
      { from: /prisma\.task\.task_assignmentss/g, to: 'prisma.task_assignments' },
      { from: /prisma\.task\.task_paymentss/g, to: 'prisma.task_payments' },
      
      // Fix task_status enum
      { from: /task_status\./g, to: 'task_status.' },
      
      // Fix include relationships
      { from: /assignment:/g, to: 'task_assignments:' },
    ]
  },
  {
    file: 'src/reactions/reactions.service.ts',
    replacements: [
      // Fix field names
      { from: /challengeId:/g, to: 'challenge_id:' },
      { from: /\.users_id/g, to: '.user_id' },
      { from: /\.user/g, to: '.users' },
      { from: /article_tagss/g, to: 'article_tags' },
    ]
  },
  {
    file: 'src/roles/roles.service.ts',
    replacements: [
      // Fix field names
      { from: /name:/g, to: 'role_name:' },
      { from: /\.name/g, to: '.role_name' },
      { from: /cafe:/g, to: 'cafes:' },
      { from: /user_global_roles:/g, to: 'global_roles:' },
    ]
  },
  {
    file: 'src/scheduler/scheduler.service.ts',
    replacements: [
      // Fix model references
      { from: /article_tagss/g, to: 'article_tags' },
    ]
  },
  {
    file: 'src/search/search.service.ts',
    replacements: [
      // Fix model references and field names
      { from: /article_tagss/g, to: 'article_tags' },
      { from: /\.members/g, to: '.cafe_members' },
      { from: /\.posts/g, to: '.cafe_posts' },
      { from: /\.role/g, to: '.user_global_roles' },
      { from: /\.ownedCafes/g, to: '.cafes' },
      { from: /\.article_tag_relations/g, to: '.article_tag_relations' },
    ]
  },
  {
    file: 'src/users/users.service.ts',
    replacements: [
      // Fix select field
      { from: /city:/g, to: 'cities:' },
    ]
  },
  {
    file: 'test-database.ts',
    replacements: [
      // Fix include relationships
      { from: /user:/g, to: 'users:' },
      { from: /\.userss/g, to: '.users' },
      { from: /\.ai_providers/g, to: '.ai_providers' },
    ]
  },
];

// Apply replacements to files
filePatterns.forEach(pattern => {
  const filePath = path.join(__dirname, pattern.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  pattern.replacements.forEach(replacement => {
    if (content.match(replacement.from)) {
      content = content.replace(replacement.from, replacement.to);
      modified = true;
      console.log(`Fixed in ${pattern.file}: ${replacement.from} -> ${replacement.to}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${pattern.file}`);
  }
});

console.log('Prisma model fixes completed!');
