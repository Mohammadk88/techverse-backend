# TechVerse Backend - New Features API Test

This document demonstrates the new features implemented for TechVerse backend:

## 1. Events System (Replacing Forum)

### Get all events
```bash
curl -X GET "http://localhost:4040/events" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get upcoming events
```bash
curl -X GET "http://localhost:4040/events/upcoming" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a new event
```bash
curl -X POST "http://localhost:4040/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "React Conference 2024",
    "host": "React Team",
    "startDate": "2024-12-01T10:00:00Z",
    "endDate": "2024-12-01T18:00:00Z",
    "details": "Annual React conference with latest updates",
    "link": "https://reactconf.com",
    "mediaUrl": "https://example.com/event-banner.jpg"
  }'
```

## 2. Issues System with Developer Ranking

### Get all issues
```bash
curl -X GET "http://localhost:4040/issues" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get issues by status
```bash
curl -X GET "http://localhost:4040/issues?status=OPEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a new issue
```bash
curl -X POST "http://localhost:4040/issues" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Bug in user authentication",
    "description": "Users cannot login after password reset",
    "tags": ["authentication", "bug", "urgent"],
    "createdBy": {
      "connect": { "id": 1 }
    }
  }'
```

### Mark issue as solved
```bash
curl -X PATCH "http://localhost:4040/issues/1/solve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "solverId": 2
  }'
```

### Get developer rankings
```bash
curl -X GET "http://localhost:4040/issues/rankings?take=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. Reports System for Content Moderation

### Get all reports
```bash
curl -X GET "http://localhost:4040/reports" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get pending reports
```bash
curl -X GET "http://localhost:4040/reports?status=PENDING" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a new report
```bash
curl -X POST "http://localhost:4040/reports" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "contentType": "POST",
    "contentId": 1,
    "reason": "Spam content",
    "reportedBy": {
      "connect": { "id": 1 }
    }
  }'
```

### Update report status
```bash
curl -X PATCH "http://localhost:4040/reports/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "REVIEWED"
  }'
```

### Get report statistics
```bash
curl -X GET "http://localhost:4040/reports/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. Seed Data

The database has been populated with comprehensive seed data:

- ✅ **Users**: 21 users (including 1 admin)
- ✅ **Articles**: 50 articles with categories and tags
- ✅ **Posts**: 100 posts with different types (text, image, video, link)
- ✅ **Cafes**: 10 cafes with posts
- ✅ **Playlists**: 6 podcast playlists with episodes
- ✅ **Events**: 20 events with various dates and hosts
- ✅ **Issues**: 30 issues with different statuses
- ✅ **Developer Profiles**: Ranking system with points and ranks
- ✅ **Reports**: 15 reports for content moderation

## Features Implemented

### ✅ Database Schema Updates
- Removed Forum, ForumMember, ForumTopic, ForumReply models
- Added Event, Issue, DeveloperProfile, Report models
- Added new enums: IssueStatus, DeveloperRank, ReportStatus

### ✅ API Endpoints
- **Events**: Full CRUD operations, upcoming events, date range filtering
- **Issues**: Full CRUD operations, status filtering, developer rankings, solve tracking
- **Reports**: Full CRUD operations, status management, statistics, content type filtering

### ✅ Business Logic
- **Issue Solving**: Automatic point awarding and rank updates
- **Developer Ranking**: BEGINNER → PROBLEM_SOLVER → EXPERT → CONSULTANT progression
- **Report Management**: Content moderation workflow with status tracking

### ✅ Seed Data Generation
- Realistic data using Faker.js
- Proper foreign key relationships
- Comprehensive coverage of all content types

## Next Steps
1. Add authentication to test endpoints with real JWT tokens
2. Implement frontend components for the new features
3. Add real-time notifications for issue solving and report updates
4. Implement advanced filtering and search capabilities
