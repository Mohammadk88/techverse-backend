#!/bin/bash

echo "🧹 Cleaning up test files..."

# Remove test files
rm -f test-follow-system.ts
rm -f test-follow-apis.ts

echo "✅ Test files cleaned up successfully!"

# Show final structure
echo ""
echo "📁 Follow System Files:"
echo "├── src/follow/follow.controller.ts"
echo "├── src/follow/follow.service.ts"
echo "├── src/follow/follow.module.ts"
echo "├── prisma/migrations/20250717232204_add_follow_system/"
echo "└── FOLLOW_SYSTEM_IMPLEMENTATION.md"
echo ""
echo "🎉 Follow System implementation complete!"
