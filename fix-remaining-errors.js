#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining TypeScript errors...\n');

// Helper function to read file
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`⚠️  Could not read ${filePath}: ${error.message}`);
    return null;
  }
}

// Helper function to write file
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Could not write ${filePath}: ${error.message}`);
    return false;
  }
}

// Fix challenges service
function fixChallengesService() {
  const filePath = './src/challenges/challenges.service.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix property names
  content = content.replace(/challenge\.createdById/g, 'challenge.created_by_id');
  content = content.replace(/challenge\.endDate/g, 'challenge.end_date');
  content = content.replace(/challengeId_user_id/g, 'challenge_id_user_id');
  content = content.replace(/submissionUrl/g, 'submission_url');
  content = content.replace(/voteCount/g, 'vote_count');
  content = content.replace(/submittedAt/g, 'submitted_at');
  content = content.replace(/createdById/g, 'created_by_id');
  
  // Fix include properties
  content = content.replace(/participants: \{/g, 'challenge_participants: {');
  content = content.replace(/participants: true/g, 'challenge_participants: true');
  content = content.replace(/challenge: \{/g, 'challenges: {');
  content = content.replace(/challenge: true/g, 'challenges: true');
  
  // Fix property access
  content = content.replace(/challenge\.participants/g, 'challenge.challenge_participants');
  content = content.replace(/p\.challenge/g, 'p.challenges');

  writeFile(filePath, content);
}

// Fix challenges DTO
function fixChallengesDto() {
  const filePath = './src/challenges/dto/create-challenge.dto.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix enum reference
  content = content.replace(/ChallengeType/g, 'challenge_types');
  
  // Add import if not present
  if (!content.includes('challenge_types')) {
    content = content.replace(
      /import.*from.*class-validator.*;\n/,
      `$&import { challenge_types } from '@prisma/client';\n`
    );
  }

  writeFile(filePath, content);
}

// Fix projects service
function fixProjectsService() {
  const filePath = './src/projects/projects.service.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix Prisma model names
  content = content.replace(/this\.prisma\.project\./g, 'this.prisma.projects.');
  content = content.replace(/prisma\.project\./g, 'prisma.projects.');
  content = content.replace(/this\.prisma\.task\./g, 'this.prisma.task_applications.');
  content = content.replace(/prisma\.task\./g, 'prisma.task_applications.');
  
  // Fix include properties
  content = content.replace(/assignment: \{/g, 'task_assignments: {');
  content = content.replace(/assignment: true/g, 'task_assignments: true');
  
  // Fix property access
  content = content.replace(/project\.project_tasks/g, 'project.project_tasks');
  
  // Fix missing updated_at
  content = content.replace(
    /data: \{\s*owner_id: number;\s*title: string;\s*description: string;\s*is_public\?: boolean;\s*\}/,
    'data: {\n        owner_id: number,\n        title: string,\n        description: string,\n        is_public?: boolean,\n        updated_at: new Date()\n      }'
  );

  writeFile(filePath, content);
}

// Fix projects DTO
function fixProjectsDto() {
  const filePath = './src/projects/dto/project.dto.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix enum references
  content = content.replace(/enum: project_status/g, 'enum: ProjectStatus');
  content = content.replace(/status\?: project_status/g, 'status?: ProjectStatus');
  content = content.replace(/enum: task_status/g, 'enum: TaskStatus');
  content = content.replace(/status\?: task_status/g, 'status?: TaskStatus');

  writeFile(filePath, content);
}

// Fix projects controller
function fixProjectsController() {
  const filePath = './src/projects/projects.controller.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix parameter name
  content = content.replace(/assignTask\(taskId,/g, 'assignTask(task_id,');

  writeFile(filePath, content);
}

// Fix reactions service
function fixReactionsService() {
  const filePath = './src/reactions/reactions.service.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix property names
  content = content.replace(/updatedReaction\.user/g, 'updatedReaction.users');
  content = content.replace(/newReaction\.user/g, 'newReaction.users');
  content = content.replace(/challengeId,/g, 'challenge_id: challengeId,');
  content = content.replace(/reaction\.users_id/g, 'reaction.user_id');
  content = content.replace(/this\.prisma\.article_tagss/g, 'this.prisma.article_tags');
  
  // Fix EarnTechCoinDto property
  content = content.replace(/article_categories: 'engagement'/g, 'category: "engagement"');

  writeFile(filePath, content);
}

// Fix roles files
function fixRolesFiles() {
  // Fix roles controller
  const controllerPath = './src/roles/roles.controller.ts';
  let controllerContent = readFile(controllerPath);
  if (controllerContent) {
    // Add import for user_roles
    if (!controllerContent.includes('user_roles')) {
      controllerContent = controllerContent.replace(
        /import.*from.*@nestjs\/common.*;\n/,
        `$&import { user_roles } from '@prisma/client';\n`
      );
    }
    writeFile(controllerPath, controllerContent);
  }

  // Fix roles service
  const servicePath = './src/roles/roles.service.ts';
  let serviceContent = readFile(servicePath);
  if (serviceContent) {
    // Fix property names
    serviceContent = serviceContent.replace(/orderBy: \{ name: 'asc' \}/g, 'orderBy: { role_name: "asc" }');
    serviceContent = serviceContent.replace(/data: \{ name, description \}/g, 'data: { role_name: name, description, updated_at: new Date() }');
    serviceContent = serviceContent.replace(/role: true/g, 'global_roles: true');
    serviceContent = serviceContent.replace(/cafe: \{/g, 'cafes: {');
    serviceContent = serviceContent.replace(/user_global_roles: true/g, 'global_roles: true');
    serviceContent = serviceContent.replace(/user_global_roles: \{ name: roleName \}/g, 'global_roles: { role_name: roleName }');
    
    writeFile(servicePath, serviceContent);
  }
}

// Fix scheduler files
function fixSchedulerFiles() {
  // Fix scheduler controller
  const controllerPath = './src/scheduler/scheduler.controller.ts';
  let controllerContent = readFile(controllerPath);
  if (controllerContent) {
    // Add import for user_roles
    if (!controllerContent.includes('user_roles')) {
      controllerContent = controllerContent.replace(
        /import.*from.*@nestjs\/common.*;\n/,
        `$&import { user_roles } from '@prisma/client';\n`
      );
    }
    writeFile(controllerPath, controllerContent);
  }

  // Fix scheduler service
  const servicePath = './src/scheduler/scheduler.service.ts';
  let serviceContent = readFile(servicePath);
  if (serviceContent) {
    // Fix property names
    serviceContent = serviceContent.replace(/this\.prisma\.article_tagss/g, 'this.prisma.article_tags');
    writeFile(servicePath, serviceContent);
  }
}

// Fix search service
function fixSearchService() {
  const filePath = './src/search/search.service.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix property names
  content = content.replace(/this\.prisma\.article_tagss/g, 'this.prisma.article_tags');
  content = content.replace(/cafe\._count\.members/g, 'cafe._count.cafe_members');
  content = content.replace(/cafe\._count\.posts/g, 'cafe._count.cafe_posts');
  content = content.replace(/user\.role/g, 'user.user_global_roles[0]?.global_roles?.role_name');
  content = content.replace(/user\._count\.ownedCafes/g, 'user._count.cafes');
  content = content.replace(/article_tags\.article_tag_relations/g, 'article_tag_relations');

  writeFile(filePath, content);
}

// Fix users files
function fixUsersFiles() {
  // Fix users DTO
  const dtoPath = './src/users/dto/user.dto.ts';
  let dtoContent = readFile(dtoPath);
  if (dtoContent) {
    // Add import for user_roles
    if (!dtoContent.includes('user_roles')) {
      dtoContent = dtoContent.replace(
        /import.*from.*@nestjs\/swagger.*;\n/,
        `$&import { user_roles } from '@prisma/client';\n`
      );
    }
    writeFile(dtoPath, dtoContent);
  }

  // Fix users controller
  const controllerPath = './src/users/users.controller.ts';
  let controllerContent = readFile(controllerPath);
  if (controllerContent) {
    // Add import for user_roles
    if (!controllerContent.includes('user_roles')) {
      controllerContent = controllerContent.replace(
        /import.*from.*@nestjs\/common.*;\n/,
        `$&import { user_roles } from '@prisma/client';\n`
      );
    }
    writeFile(controllerPath, controllerContent);
  }

  // Fix users service
  const servicePath = './src/users/users.service.ts';
  let serviceContent = readFile(servicePath);
  if (serviceContent) {
    // Fix property names
    serviceContent = serviceContent.replace(/city: \{/g, 'cities: {');
    serviceContent = serviceContent.replace(/currentUser\.role/g, 'currentUser.user_global_roles[0]?.global_roles?.role_name');
    
    // Add import for user_roles
    if (!serviceContent.includes('user_roles')) {
      serviceContent = serviceContent.replace(
        /import.*from.*@nestjs\/common.*;\n/,
        `$&import { user_roles } from '@prisma/client';\n`
      );
    }
    writeFile(servicePath, serviceContent);
  }
}

// Fix wallet files
function fixWalletFiles() {
  // Fix wallet DTO
  const dtoPath = './src/wallet/dto/earn-techcoin.dto.ts';
  let dtoContent = readFile(dtoPath);
  if (dtoContent) {
    // Add import for ai_enhancement_types
    if (!dtoContent.includes('ai_enhancement_types')) {
      dtoContent = dtoContent.replace(
        /import.*from.*@nestjs\/swagger.*;\n/,
        `$&import { ai_enhancement_types } from '@prisma/client';\n`
      );
    }
    writeFile(dtoPath, dtoContent);
  }

  // Fix wallet service
  const servicePath = './src/wallet/wallet.service.ts';
  let serviceContent = readFile(servicePath);
  if (serviceContent) {
    // Fix missing updated_at
    serviceContent = serviceContent.replace(
      /data: \{\s*user_id: number;\s*tech_coin: number;\s*xp: number;\s*\}/,
      'data: {\n          user_id: number,\n          tech_coin: number,\n          xp: number,\n          updated_at: new Date()\n        }'
    );
    writeFile(servicePath, serviceContent);
  }
}

// Fix test database
function fixTestDatabase() {
  const filePath = './test-database.ts';
  let content = readFile(filePath);
  if (!content) return;

  // Fix property names
  content = content.replace(/user: \{/g, 'users: {');
  content = content.replace(/key\.userss/g, 'key.users');
  content = content.replace(/key\.ai_providers/g, 'key.ai_providers');

  writeFile(filePath, content);
}

// Main execution
async function main() {
  console.log('Starting comprehensive TypeScript error fixes...\n');

  // Fix all the files
  fixChallengesService();
  fixChallengesDto();
  fixProjectsService();
  fixProjectsDto();
  fixProjectsController();
  fixReactionsService();
  fixRolesFiles();
  fixSchedulerFiles();
  fixSearchService();
  fixUsersFiles();
  fixWalletFiles();
  fixTestDatabase();

  console.log('\n🎉 All fixes applied!');
  console.log('Run "npm run build" to verify the fixes.');
}

main().catch(console.error);
