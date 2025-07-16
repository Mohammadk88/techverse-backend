# TechVerse Backend - MVP Features API Test

This document demonstrates the MVP features implemented for TechVerse backend:

## 1. Wallet & TechCoin System

### Get wallet information
```bash
curl -X GET "http://localhost:4040/wallet" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Buy TechCoin
```bash
curl -X POST "http://localhost:4040/wallet/buy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 100,
    "paymentMethod": "stripe_mock"
  }'
```

### Get transaction history
```bash
curl -X GET "http://localhost:4040/wallet/transactions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 2. Challenges System

### Get all challenges
```bash
curl -X GET "http://localhost:4040/challenges" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a new challenge
```bash
curl -X POST "http://localhost:4040/challenges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Code Master Challenge",
    "description": "Build a web app using React and Node.js",
    "reward": 100,
    "entryFee": 25,
    "type": "VOTE",
    "startDate": "2025-07-20T00:00:00Z",
    "endDate": "2025-07-27T23:59:59Z"
  }'
```

### Join a challenge
```bash
curl -X POST "http://localhost:4040/challenges/1/join" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "I want to participate in this challenge"
  }'
```

## 3. Projects & Tasks System

### Get all projects
```bash
curl -X GET "http://localhost:4040/projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a new project
```bash
curl -X POST "http://localhost:4040/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "TechVerse Mobile App",
    "description": "React Native mobile application for TechVerse platform",
    "isPublic": true
  }'
```

### Add task to project
```bash
curl -X POST "http://localhost:4040/projects/1/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Design login screen",
    "description": "Create a modern login screen with animations",
    "price": 50
  }'
```

### Apply to a task
```bash
curl -X POST "http://localhost:4040/projects/tasks/1/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "I have 3 years of React Native experience"
  }'
```

### Get all tasks
```bash
curl -X GET "http://localhost:4040/projects/tasks/all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```


## 4. Core Features

The TechVerse platform includes these MVP features:

- ✅ **Articles**: Content creation and management system
- ✅ **Posts**: Community social posts and interactions  
- ✅ **Cafes**: Discussion groups and communities
- ✅ **Wallet**: TechCoin balance and transaction management
- ✅ **Challenges**: Programming/design competitions
- ✅ **Projects**: Task management and collaboration system

## Features Implemented

### ✅ Database Schema
- User wallet system with TechCoin and XP
- Challenge creation and participation
- Project and task management
- Transaction history and payments

### ✅ API Endpoints
- **Wallet**: Balance management, TechCoin purchases, transaction history
- **Challenges**: Challenge creation, joining, submissions, voting
- **Projects**: Project creation, task management, applications, assignments

### ✅ Business Logic
- **TechCoin Economy**: Earning and spending mechanics
- **Challenge System**: Entry fees, rewards, voting mechanism
- **Task Management**: Application process, assignments, payments

## Next Steps
1. Frontend integration with React Query for data fetching
2. Stripe integration for TechCoin purchases
3. Real-time notifications for challenges and task updates
4. Advanced filtering and search capabilities
