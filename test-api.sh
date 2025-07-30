#!/bin/bash

# TechVerse Café MVP - Quick API Test Script

echo "🚀 TechVerse Café MVP - API Testing"
echo "=================================="

# Set base URL
BASE_URL="http://localhost:4040"

echo ""
echo "1. Testing Health Check..."
curl -s "$BASE_URL/" | head -c 100
echo ""

echo ""
echo "2. Testing Swagger Documentation..."
curl -s -I "$BASE_URL/api/docs" | grep "HTTP"

echo ""
echo "3. Testing API Spec Download..."
curl -s -I "$BASE_URL/api/swagger.json" | grep "HTTP"

echo ""
echo "4. Testing Authentication Endpoints..."
echo "   - Register endpoint:"
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{}' | head -c 100
echo ""

echo ""
echo "   - Login endpoint:"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}' | head -c 100
echo ""

echo ""
echo "5. Testing Public Endpoints..."
echo "   - Languages:"
curl -s "$BASE_URL/languages" | head -c 100
echo ""

echo "   - Countries:"
curl -s "$BASE_URL/countries" | head -c 100
echo ""

echo "   - Public Articles:"
curl -s "$BASE_URL/articles?is_published=true" | head -c 100
echo ""

echo ""
echo "6. Testing Wallet XP Thresholds (Public):"
curl -s "$BASE_URL/wallet/xp/thresholds" | head -c 100
echo ""

echo ""
echo "=================================="
echo "✅ API Test completed!"
echo ""
echo "📚 Full API Documentation:"
echo "   $BASE_URL/api/docs"
echo ""
echo "💡 To test authenticated endpoints:"
echo "   1. Register a new user"
echo "   2. Login to get JWT token"
echo "   3. Use token in X-HTTP-TOKEN header"
echo ""
