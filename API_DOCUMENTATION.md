# TechVerse Café API Documentation

## 🚀 Overview
TechVerse Café API is a comprehensive backend system for a developer community platform featuring digital wallet, challenges, task management, and café communities.

## 📋 New Features Added

### 💰 Digital Wallet & TechCoin System
Complete digital economy with TechCoin cryptocurrency for platform interactions.

**Endpoints:**
- `GET /wallet` - Get wallet information
- `POST /wallet/buy` - Purchase TechCoin (mock Stripe integration)
- `POST /wallet/spend` - Spend TechCoin for platform activities
- `POST /wallet/earn` - Earn TechCoin through activities
- `GET /wallet/transactions` - Transaction history with pagination
- `GET /wallet/balance` - Check balance and sufficiency

**TechCoin Economy:**
- 1 USD = 10 TechCoin
- Café creation: 50 TechCoin
- Challenge entry fees: Variable (set by creator)
- Task completion rewards: Variable
- XP points separate from TechCoin

### 🏆 Challenges & Competitions
Gamified coding/design challenges with voting and rewards.

**Endpoints:**
- `POST /challenges` - Create new challenge (requires TechCoin for reward pool)
- `GET /challenges` - List all challenges with filtering
- `GET /challenges/my-created` - User's created challenges
- `GET /challenges/my-participated` - User's participations
- `GET /challenges/:id` - Challenge details
- `POST /challenges/:id/join` - Join challenge (pays entry fee)
- `POST /challenges/:id/submit` - Submit solution
- `POST /challenges/:id/vote/:participantId` - Vote for participant
- `POST /challenges/:id/close` - Close challenge and determine winner

**Challenge Types:**
- `VOTE` - Community voting determines winner
- `JUDGE` - Creator/judges determine winner

### 🚀 Enhanced Project & Task Management
Improved task system with escrow payments and TechCoin integration.

**Key Features:**
- Task posting with TechCoin escrow
- Automatic payment release on completion
- Enhanced project collaboration
- Improved task tracking

### ☕ Enhanced Café System
Community spaces now require TechCoin to create, encouraging quality content.

**Updates:**
- 50 TechCoin fee for café creation
- Prevents spam communities
- Enhanced café management

## 🔧 API Usage Examples

### Authentication
All protected endpoints require JWT Bearer token:
```bash
Authorization: Bearer <your-jwt-token>
```

### Create Challenge
```bash
POST /challenges
{
  "title": "React Component Challenge",
  "description": "Build a reusable component library with React and TypeScript",
  "reward": 100,
  "entryFee": 25,
  "type": "VOTE",
  "startDate": "2025-07-20T00:00:00Z",
  "endDate": "2025-07-27T23:59:59Z",
  "requirements": "Must include unit tests and documentation",
  "tags": ["react", "typescript", "components"]
}
```

### Buy TechCoin
```bash
POST /wallet/buy
{
  "amount": 100,
  "paymentMethod": "stripe"
}
```

### Join Challenge
```bash
POST /challenges/123/join
{
  "message": "I plan to use React with TypeScript and focus on accessibility",
  "portfolioUrl": "https://github.com/username"
}
```

### Submit Solution
```bash
POST /challenges/123/submit
{
  "submissionUrl": "https://github.com/username/challenge-solution",
  "demoUrl": "https://my-app.vercel.app",
  "description": "Built a comprehensive component library with 15+ components",
  "technologies": ["React", "TypeScript", "Storybook", "Jest"],
  "notes": "Focused on accessibility and performance optimization"
}
```

### Create Café
```bash
POST /cafes
{
  "name": "React Developers Hub",
  "description": "Community for React developers to share knowledge and collaborate",
  "isPrivate": false,
  "languageCode": "en",
  "countryCode": "US"
}
```

## 📊 Response Examples

### Wallet Information
```json
{
  "id": 1,
  "userId": 123,
  "techCoin": 250,
  "xp": 850,
  "createdAt": "2025-07-16T00:00:00Z",
  "updatedAt": "2025-07-16T12:00:00Z",
  "recentTransactions": [
    {
      "id": 5,
      "type": "EARN",
      "amount": 25,
      "description": "Task completion reward",
      "createdAt": "2025-07-16T10:30:00Z"
    }
  ]
}
```

### Challenge Details
```json
{
  "id": 10,
  "title": "Code Master Challenge",
  "description": "Build a web app using React and Node.js",
  "reward": 100,
  "entryFee": 25,
  "type": "VOTE",
  "status": "ACTIVE",
  "startDate": "2025-07-20T00:00:00Z",
  "endDate": "2025-07-27T23:59:59Z",
  "createdBy": {
    "id": 123,
    "username": "johndoe",
    "avatar": null
  },
  "participants": [
    {
      "id": 1,
      "user": {
        "id": 456,
        "username": "jane_dev",
        "firstName": "Jane",
        "lastName": "Developer"
      },
      "submissionUrl": "https://github.com/jane_dev/solution",
      "votes": 5,
      "joinedAt": "2025-07-20T10:00:00Z"
    }
  ],
  "participantCount": 8,
  "totalVotes": 25,
  "createdAt": "2025-07-16T14:00:00Z"
}
```

## 🛡️ Error Handling

### Common Error Responses

**Insufficient TechCoin:**
```json
{
  "statusCode": 400,
  "message": "Insufficient TechCoin balance. Required: 50, Available: 25",
  "error": "Bad Request"
}
```

**Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Challenge Already Joined:**
```json
{
  "statusCode": 400,
  "message": "User already joined this challenge",
  "error": "Bad Request"
}
```

## 🌐 API Documentation
- **Swagger UI**: http://localhost:4040/api
- **OpenAPI JSON**: http://localhost:4040/api/swagger.json
- **Server**: http://localhost:4040

## 🔄 Pagination
Most list endpoints support pagination:
```
GET /challenges?page=1&limit=10
GET /wallet/transactions?page=2&limit=20
```

## 🏷️ API Tags Organization
- **💰 Digital Wallet & TechCoin** - All wallet and currency operations
- **🏆 Challenges & Competitions** - Challenge management and participation
- **🚀 Projects & Task Management** - Project and task operations
- **☕ TechVerse Cafés** - Community café management
- **👥 User Management** - User profiles and authentication
- **📚 Articles & Content** - Content management system

## 🔐 Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting (configurable)
- CORS protection

## 📈 Performance Features
- Database query optimization
- Pagination for large datasets
- Efficient transaction handling
- Caching strategies (Redis ready)

## 🚀 Deployment
The API is production-ready with:
- Environment-based configuration
- Docker support
- Database migrations
- Health check endpoints
- Logging and monitoring

## 📞 Support
For questions about the API or integration support, please refer to the Swagger documentation at `/api` endpoint.
