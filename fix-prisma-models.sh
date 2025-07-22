#!/bin/bash

# Fix Prisma Model Names Script
# This script fixes all incorrect Prisma model references in the codebase

echo "🔧 Starting Prisma model name fixes..."

# Directory containing source files
SRC_DIR="src"

# Map of incorrect model names to correct ones
declare -A MODEL_MAPPINGS=(
    ["user"]="users"
    ["article"]="articles"
    ["articleCategory"]="article_categories"
    ["articleTag"]="article_tags"
    ["articleTagRelation"]="article_tag_relations"
    ["articleBoost"]="article_boosts"
    ["articleAIEnhancement"]="article_ai_enhancements"
    ["bookmark"]="bookmarks"
    ["cafe"]="cafes"
    ["cafeMember"]="cafe_members"
    ["cafePost"]="cafe_posts"
    ["cafeRole"]="cafe_roles"
    ["challenge"]="challenges"
    ["challengeParticipant"]="challenge_participants"
    ["city"]="cities"
    ["country"]="countries"
    ["follow"]="follows"
    ["globalRole"]="global_roles"
    ["language"]="languages"
    ["project"]="projects"
    ["projectTask"]="project_tasks"
    ["taskApplication"]="task_applications"
    ["taskAssignment"]="task_assignments"
    ["taskPayment"]="task_payments"
    ["reaction"]="reactions"
    ["scheduledPost"]="scheduled_posts"
    ["wallet"]="wallets"
    ["walletTransaction"]="wallet_transactions"
    ["aIProvider"]="ai_providers"
    ["aIKey"]="ai_keys"
    ["userGlobalRole"]="user_global_roles"
    ["userCafeRole"]="user_cafe_roles"
    ["translation"]="translations"
)

# Map of incorrect enum names to correct ones
declare -A ENUM_MAPPINGS=(
    ["ReactionType"]="reaction_types"
    ["TransactionType"]="transaction_types"
    ["UserRole"]="user_roles"
    ["ProjectStatus"]="project_status"
    ["TaskStatus"]="task_status"
    ["ChallengeType"]="challenge_types"
    ["ChallengeStatus"]="challenge_status"
    ["ParticipantResult"]="participant_results"
    ["ScheduledPostStatus"]="scheduled_post_status"
    ["AIEnhancementType"]="ai_enhancement_types"
)

# Function to fix model names in TypeScript files
fix_model_names() {
    local file="$1"
    echo "  📝 Fixing: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Process the file
    cp "$file" "$temp_file"
    
    # Fix Prisma model references
    for incorrect in "${!MODEL_MAPPINGS[@]}"; do
        correct="${MODEL_MAPPINGS[$incorrect]}"
        # Fix .prisma.ModelName patterns
        sed -i '' "s/\.prisma\.$incorrect\./\.prisma\.$correct\./g" "$temp_file"
        # Fix prisma.ModelName patterns
        sed -i '' "s/prisma\.$incorrect\./prisma\.$correct\./g" "$temp_file"
    done
    
    # Fix enum imports and references
    for incorrect in "${!ENUM_MAPPINGS[@]}"; do
        correct="${ENUM_MAPPINGS[$incorrect]}"
        # Fix enum imports
        sed -i '' "s/{ $incorrect }/{ $correct }/g" "$temp_file"
        sed -i '' "s/, $incorrect }/, $correct }/g" "$temp_file"
        sed -i '' "s/{ $incorrect,/{ $correct,/g" "$temp_file"
        # Fix enum type references
        sed -i '' "s/: $incorrect/: $correct/g" "$temp_file"
        sed -i '' "s/<$incorrect>/<$correct>/g" "$temp_file"
    done
    
    # Copy back if changes were made
    if ! cmp -s "$file" "$temp_file"; then
        cp "$temp_file" "$file"
        echo "    ✅ Fixed: $file"
    else
        echo "    ⏭️  No changes: $file"
    fi
    
    # Clean up
    rm "$temp_file"
}

# Find all TypeScript files and fix them
find "$SRC_DIR" -name "*.ts" -type f | while read -r file; do
    fix_model_names "$file"
done

# Also fix test files
find . -name "test-*.ts" -type f | while read -r file; do
    fix_model_names "$file"
done

echo "🎉 Prisma model name fixes complete!"
echo "📋 Next steps:"
echo "   1. Run: npm run build"
echo "   2. Check for any remaining type errors"
echo "   3. Test the application"
