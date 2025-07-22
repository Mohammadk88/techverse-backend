#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical fixes to get the server running
const fixes = [
  // Fix users service model references
  {
    file: 'src/users/users.service.ts',
    from: /this\.prisma\.user\./g,
    to: 'this.prisma.users.'
  },
  {
    file: 'src/users/users.service.ts',
    from: /this\.prisma\.follow\./g,
    to: 'this.prisma.follows.'
  },
  
  // Fix projects service model references  
  {
    file: 'src/projects/projects.service.ts',
    from: /this\.prisma\.project\.project_tasks/g,
    to: 'this.prisma.project_tasks'
  },
  {
    file: 'src/projects/projects.service.ts',
    from: /this\.prisma\.task\.task_applications/g,
    to: 'this.prisma.task_applications'
  },
  {
    file: 'src/projects/projects.service.ts',
    from: /this\.prisma\.task\.task_assignmentss/g,
    to: 'this.prisma.task_assignments'
  },
  {
    file: 'src/projects/projects.service.ts',
    from: /this\.prisma\.task\.task_paymentss/g,
    to: 'this.prisma.task_payments'
  },
  {
    file: 'src/projects/projects.service.ts',
    from: /prisma\.project\.project_tasks/g,
    to: 'prisma.project_tasks'
  },
  {
    file: 'src/projects/projects.service.ts',
    from: /prisma\.task\.task_assignmentss/g,
    to: 'prisma.task_assignments'
  },
  {
    file: 'src/projects/projects.service.ts',
    from: /prisma\.task\.task_paymentss/g,
    to: 'prisma.task_payments'
  },
  
  // Fix scheduler service model references
  {
    file: 'src/scheduler/scheduler.service.ts',
    from: /this\.prisma\.article_tagss/g,
    to: 'this.prisma.article_tags'
  },
  
  // Fix search service model references
  {
    file: 'src/search/search.service.ts',
    from: /this\.prisma\.article_tagss/g,
    to: 'this.prisma.article_tags'
  },
  
  // Fix reactions service model references
  {
    file: 'src/reactions/reactions.service.ts',
    from: /this\.prisma\.article_tagss/g,
    to: 'this.prisma.article_tags'
  },
  
  // Fix test database file
  {
    file: 'test-database.ts',
    from: /user:/g,
    to: 'users:'
  },
  {
    file: 'test-database.ts',
    from: /\.userss/g,
    to: '.users'
  }
];

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.match(fix.from)) {
    content = content.replace(fix.from, fix.to);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fix.file}: ${fix.from} -> ${fix.to}`);
  }
});

console.log('Critical fixes applied!');
