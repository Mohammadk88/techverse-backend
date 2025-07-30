# TechVerse Café MVP - Complete Backend Implementation

This document provides a comprehensive overview of the TechVerse Café MVP backend implementation using NestJS, Prisma, PostgreSQL, and Stripe.

## 🚀 Technology Stack

- **Framework**: NestJS v10+
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Payments**: Stripe Checkout
- **API Documentation**: Swagger
- **Validation**: class-validator
- **Language**: TypeScript

## 🔐 Authentication & User Management

### Features Implemented:
- User registration and login with JWT
- Role-based access control (RBAC)
- Email verification system
- Profile management
- Password hashing with bcrypt

### User Roles:
- **GUEST**: Default role for new users (0 XP)
- **MEMBER**: Basic member role (0 XP)
- **JOURNALIST**: Content creator role (1000 XP required)
- **THINKER**: Advanced contributor role (3000 XP required)
- **BARISTA**: Admin role (7000 XP required)

### Key Endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

## 💰 Digital Wallet & TechCoin System

### Features Implemented:
- Digital wallet for each user
- TechCoin currency system
- XP (Experience Points) tracking
- Automatic role upgrades based on XP
- Stripe payment integration
- Transaction history

### TechCoin Economy:
- **Pricing**: $0.01 USD per TechCoin
- **Initial Balance**: 100 TechCoin for new users
- **Payment**: Stripe Checkout integration
- **Webhook**: Real-time payment processing

### XP Rewards:
- Article publish: +100 XP
- Café comment: +50 XP
- Challenge win: +200 XP
- Get followed: +20 XP
- Follow user: +10 XP
- Project completion: +150 XP
- Task completion: +75 XP

### Key Endpoints:
- `GET /wallet` - Get wallet information
- `POST /wallet/buy` - Create Stripe checkout session
- `POST /wallet/webhook` - Stripe webhook handler
- `GET /wallet/transactions` - Transaction history
- `GET /wallet/xp/next-role` - Next role information
- `GET /wallet/xp/thresholds` - XP thresholds for all roles

## 📚 Articles System

### Features Implemented:
- Article CRUD operations
- Category and tag management
- Article scheduling
- AI content enhancement
- Article boosting with TechCoin
- Featured articles
- Multi-language support
- Search and filtering

### Article Boosting:
- Pay TechCoin to boost article visibility
- Configurable boost duration
- Boost tracking and analytics

### AI Enhancement:
- Title optimization
- Summary generation
- SEO tags
- Full content enhancement

### Key Endpoints:
- `GET /articles` - List articles with filters
- `POST /articles` - Create article
- `GET /articles/:id` - Get single article
- `PUT /articles/:id` - Update article
- `DELETE /articles/:id` - Delete article
- `POST /articles/:id/schedule` - Schedule article
- `POST /articles/:id/boost` - Boost article
- `POST /articles/:id/enhance` - AI enhance article

## ☕ Cafés (Discussion Spaces)

### Features Implemented:
- Café creation and management
- Public and private cafés
- Café membership system
- Posts and comments within cafés
- Café-specific roles
- Country and language filtering

### Café Roles:
- **MEMBER**: Basic café member
- **THINKER**: Advanced contributor
- **JOURNALIST**: Content moderator
- **BARISTA**: Café administrator

### Key Endpoints:
- `GET /cafes` - List cafés
- `POST /cafes` - Create café
- `GET /cafes/:id` - Get café details
- `POST /cafes/:id/join` - Join café
- `DELETE /cafes/:id/leave` - Leave café
- `GET /cafes/:id/posts` - Get café posts
- `POST /cafes/:id/posts` - Create café post

## 🏆 Challenges & Competitions

### Features Implemented:
- Challenge creation and management
- Entry fees in TechCoin
- Automatic and manual judging
- Voting system
- Reward distribution
- Challenge types (VOTE, JUDGE)

### Challenge Flow:
1. Creator sets entry fee and reward
2. Users pay TechCoin to join
3. Participants submit entries
4. Voting or judging determines winner
5. Winner receives TechCoin reward + XP

### Key Endpoints:
- `GET /challenges` - List challenges
- `POST /challenges` - Create challenge
- `POST /challenges/:id/join` - Join challenge
- `POST /challenges/:id/submit` - Submit entry
- `POST /challenges/:id/vote` - Vote for entry

## 💼 Mini Projects & Task System

### Features Implemented:
- Project creation and management
- Task creation with TechCoin pricing
- Task application system
- Task assignment
- TechCoin payments for completed tasks
- Project status tracking

### Project Workflow:
1. Create project with multiple tasks
2. Set TechCoin price for each task
3. Users apply for tasks
4. Project owner assigns tasks
5. Complete tasks and receive payment

### Key Endpoints:
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id/tasks` - Get project tasks
- `POST /projects/:id/tasks` - Create task
- `POST /tasks/:id/apply` - Apply for task
- `POST /tasks/:id/assign` - Assign task
- `POST /tasks/:id/complete` - Mark task complete

## 👥 Follow System

### Features Implemented:
- User following/unfollowing
- Follower/following lists
- Follow statistics
- Mutual follows discovery
- Follow suggestions
- XP rewards for social interactions

### Social Features:
- Follow users to see their content
- Get XP for following and being followed
- Discover mutual connections
- Smart follow suggestions

### Key Endpoints:
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/unfollow` - Unfollow user
- `GET /users/:id/followers` - Get followers
- `GET /users/:id/following` - Get following
- `GET /follow/suggestions` - Get follow suggestions

## 🌍 Internationalization

### Features Implemented:
- Multi-language support (5 languages)
- User language preferences
- Content localization
- Country and city data
- Direction support (LTR/RTL)

### Supported Languages:
- **Arabic** (ar) - RTL
- **English** (en) - LTR
- **Turkish** (tr) - LTR
- **French** (fr) - LTR
- **Spanish** (es) - LTR

### Key Endpoints:
- `GET /languages` - List supported languages
- `GET /countries` - List countries with cities
- `PUT /users/language` - Update user language

## 🔖 Additional Features

### Bookmarks:
- Save articles for later reading
- Personal bookmark collections
- Quick access to saved content

### Reactions:
- Like, love, laugh, wow, sad, angry
- React to articles, projects, challenges, café posts
- Reaction analytics

### Search:
- Global content search
- Semantic search across articles
- Filter by content type

## 🛠️ API Documentation

### Swagger Integration:
- **URL**: `http://localhost:4040/api/docs`
- **Export**: `http://localhost:4040/api/swagger.json`
- Complete API documentation with examples
- Interactive testing interface
- Authentication support

### API Features:
- Comprehensive error handling
- Input validation
- Response schemas
- Rate limiting ready
- CORS support

## 🚀 Deployment & Configuration

### Environment Variables:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/techverse_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRATION_TIME="24h"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Application
PORT=4040
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
BCRYPT_SALT_ROUNDS=12
```

### Getting Started:
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:migrate`
5. Seed the database: `npm run db:seed`
6. Start development server: `npm run start:dev`

### Available Scripts:
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key tables include:

- **users** - User accounts and profiles
- **wallets** - Digital wallet data
- **wallet_transactions** - Transaction history
- **articles** - Article content
- **cafes** - Discussion spaces
- **challenges** - Competitions and challenges
- **projects** - Mini projects and tasks
- **follows** - User relationships
- **bookmarks** - Saved content
- **reactions** - User reactions
- **languages** - Supported languages
- **countries** - Geographic data

## 🔐 Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention with Prisma
- CORS configuration
- Rate limiting ready
- Environment variable validation

## 🎯 MVP Completion Status

✅ **Completed Features:**
- User authentication and authorization
- Digital wallet with TechCoin
- XP system with automatic role upgrades
- Stripe payment integration
- Articles system with AI enhancement
- Cafés discussion system
- Challenges and competitions
- Mini projects and tasks
- Follow system
- Multi-language support
- Comprehensive API documentation

The TechVerse Café MVP backend is feature-complete and ready for integration with the frontend application. All core functionality has been implemented according to the requirements, with proper error handling, validation, and documentation.
