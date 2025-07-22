const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive Prisma model name fixes...');

// Map of incorrect model names to correct ones
const modelMappings = {
    'user': 'users',
    'article': 'articles',
    'articleCategory': 'article_categories',
    'articleTag': 'article_tags',
    'articleTagRelation': 'article_tag_relations',
    'articleBoost': 'article_boosts',
    'articleAIEnhancement': 'article_ai_enhancements',
    'bookmark': 'bookmarks',
    'cafe': 'cafes',
    'cafeMember': 'cafe_members',
    'cafePost': 'cafe_posts',
    'cafeRole': 'cafe_roles',
    'challenge': 'challenges',
    'challengeParticipant': 'challenge_participants',
    'city': 'cities',
    'country': 'countries',
    'follow': 'follows',
    'globalRole': 'global_roles',
    'language': 'languages',
    'project': 'projects',
    'projectTask': 'project_tasks',
    'taskApplication': 'task_applications',
    'taskAssignment': 'task_assignments',
    'taskPayment': 'task_payments',
    'reaction': 'reactions',
    'scheduledPost': 'scheduled_posts',
    'wallet': 'wallets',
    'walletTransaction': 'wallet_transactions',
    'aIProvider': 'ai_providers',
    'aIKey': 'ai_keys',
    'userGlobalRole': 'user_global_roles',
    'userCafeRole': 'user_cafe_roles',
    'translation': 'translations'
};

// Map of incorrect enum names to correct ones
const enumMappings = {
    'ReactionType': 'reaction_types',
    'TransactionType': 'transaction_types',
    'UserRole': 'user_roles',
    'ProjectStatus': 'project_status',
    'TaskStatus': 'task_status',
    'ChallengeType': 'challenge_types',
    'ChallengeStatus': 'challenge_status',
    'ParticipantResult': 'participant_results',
    'ScheduledPostStatus': 'scheduled_post_status',
    'AIEnhancementType': 'ai_enhancement_types',
    'Wallet': 'wallets',
    'WalletTransaction': 'wallet_transactions'
};

// Special field name mappings for specific models
const fieldMappings = {
    'followerId': 'follower_id',
    'followingId': 'following_id',
    'userId': 'user_id',
    'articleId': 'article_id',
    'firstName': 'first_name',
    'lastName': 'last_name',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'techCoin': 'tech_coin',
    'ownerId': 'owner_id',
    'applicantId': 'applicant_id'
};

// Function to fix model names in a file
function fixModelNames(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix Prisma model references
        for (const [incorrect, correct] of Object.entries(modelMappings)) {
            const patterns = [
                new RegExp(`\\.prisma\\.${incorrect}\\.`, 'g'),
                new RegExp(`prisma\\.${incorrect}\\.`, 'g'),
                new RegExp(`this\\.prisma\\.${incorrect}\\.`, 'g')
            ];
            
            patterns.forEach(pattern => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, match => match.replace(incorrect, correct));
                    modified = true;
                }
            });
        }
        
        // Fix enum imports and references
        for (const [incorrect, correct] of Object.entries(enumMappings)) {
            const patterns = [
                new RegExp(`{ ${incorrect} }`, 'g'),
                new RegExp(`, ${incorrect} }`, 'g'),
                new RegExp(`{ ${incorrect},`, 'g'),
                new RegExp(`: ${incorrect}`, 'g'),
                new RegExp(`<${incorrect}>`, 'g'),
                new RegExp(`import.*${incorrect}.*from.*@prisma/client`, 'g')
            ];
            
            patterns.forEach(pattern => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, match => match.replace(incorrect, correct));
                    modified = true;
                }
            });
        }
        
        // Fix specific field names
        for (const [incorrect, correct] of Object.entries(fieldMappings)) {
            const patterns = [
                new RegExp(`${incorrect}:`, 'g'),
                new RegExp(`{ ${incorrect} }`, 'g'),
                new RegExp(`where.*${incorrect}`, 'g')
            ];
            
            patterns.forEach(pattern => {
                if (pattern.test(content)) {
                    content = content.replace(pattern, match => match.replace(incorrect, correct));
                    modified = true;
                }
            });
        }
        
        // Fix specific unique constraint names
        content = content.replace(/followerId_followingId/g, 'follower_id_following_id');
        if (content.includes('follower_id_following_id')) {
            modified = true;
        }
        
        // Fix specific relation names in Follow model
        content = content.replace(/following:/g, 'users_follows_following_idTousers:');
        content = content.replace(/follower:/g, 'users_follows_follower_idTousers:');
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ Fixed: ${filePath}`);
        } else {
            console.log(`  ⏭️  No changes: ${filePath}`);
        }
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
}

// Function to recursively find all TypeScript files
function findTSFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
            files.push(...findTSFiles(fullPath));
        } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Find all TypeScript files in src directory
const srcFiles = findTSFiles('src');
const testFiles = fs.readdirSync('.').filter(file => file.startsWith('test-') && file.endsWith('.ts'));

// Process all files
const allFiles = [...srcFiles, ...testFiles];
allFiles.forEach(fixModelNames);

console.log('🎉 Comprehensive Prisma model name fixes complete!');
console.log('📋 Next steps:');
console.log('   1. Run: npm run build');
console.log('   2. Check for any remaining type errors');
console.log('   3. Test the application');
