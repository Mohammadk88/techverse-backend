# 🚀 TechVerse Café MVP - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A comprehensive backend implementation for TechVerse Café MVP using NestJS, Prisma, PostgreSQL, and Stripe.</p>

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Stripe keys

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run start:dev
```

**API Documentation**: http://localhost:4040/api/docs

## 🎯 MVP Features

### 🔐 **Authentication & Users**
- JWT authentication with role-based access control
- 5 user roles: Guest → Member → Journalist → Thinker → Barista
- Automatic role upgrades based on XP

### 💰 **Digital Wallet & TechCoin**
- Digital currency system with Stripe integration
- XP (Experience Points) tracking
- Automatic role promotions
- Transaction history

### 📚 **Articles System**
- Article CRUD with categories and tags
- AI content enhancement
- Article scheduling and boosting
- Multi-language support

### ☕ **Cafés (Discussion Spaces)**
- Create topic-based discussion groups
- Public/private cafés with membership
- Posts and comments system

### 🏆 **Challenges & Competitions**
- Create challenges with TechCoin entry fees
- Voting and judging systems
- Automatic reward distribution

### 💼 **Mini Projects & Tasks**
- Project creation with task management
- TechCoin-based task payments
- Application and assignment system

### 👥 **Social Features**
- Follow/unfollow users
- XP rewards for social interactions
- Follow suggestions

### 🌍 **Internationalization**
- 5 languages: Arabic, English, Turkish, French, Spanish
- RTL/LTR direction support
- User language preferences

## 💸 **XP & Economy System**

### XP Rewards:
- Article publish: **+100 XP**
- Café comment: **+50 XP**
- Challenge win: **+200 XP**
- Get followed: **+20 XP**
- Follow user: **+10 XP**

### Role Thresholds:
- **Member**: 0 XP
- **Journalist**: 1,000 XP
- **Thinker**: 3,000 XP
- **Barista**: 7,000 XP

### TechCoin Economy:
- **Rate**: $0.01 USD per TechCoin
- **Starting Balance**: 100 TechCoin
- **Payment**: Stripe Checkout

## 🛠️ **Technology Stack**

- **Framework**: NestJS v10+
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Payments**: Stripe
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## 📊 **API Endpoints Overview**

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get profile

### Digital Wallet
- `GET /wallet` - Get wallet info
- `POST /wallet/buy` - Create Stripe session
- `GET /wallet/transactions` - Transaction history

### Articles
- `GET /articles` - List articles
- `POST /articles` - Create article
- `POST /articles/:id/boost` - Boost article
- `POST /articles/:id/enhance` - AI enhance

### Cafés
- `GET /cafes` - List cafés
- `POST /cafes` - Create café
- `POST /cafes/:id/join` - Join café

### Challenges
- `GET /challenges` - List challenges
- `POST /challenges` - Create challenge
- `POST /challenges/:id/join` - Join challenge

### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `POST /projects/:id/tasks` - Create task

### Social
- `POST /users/:id/follow` - Follow user
- `GET /users/:id/followers` - Get followers

**Full API Documentation**: http://localhost:4040/api/docs

## 🧪 **Testing**

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Test API endpoints (requires server running)
./test-api.sh
```

## 🗄️ **Database**

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## 🔧 **Environment Variables**

Required environment variables (see `.env.example`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/techverse_db"
JWT_SECRET="your-jwt-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"
```

## 📚 **Documentation**

- **API Docs**: http://localhost:4040/api/docs
- **Implementation Guide**: [TECHVERSE_MVP_IMPLEMENTATION.md](./TECHVERSE_MVP_IMPLEMENTATION.md)
- **Database Schema**: Prisma schema in `prisma/schema.prisma`

## 🚀 **Deployment**

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```bash
# Build image
docker build -t techverse-backend .

# Run container
docker run -p 4040:4040 techverse-backend
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License

---

## 🎯 **MVP Status: ✅ COMPLETE**

All MVP features have been implemented and tested:

- ✅ Authentication & Authorization
- ✅ Digital Wallet & TechCoin
- ✅ XP System & Role Upgrades
- ✅ Stripe Payment Integration
- ✅ Articles System
- ✅ Cafés Discussion System
- ✅ Challenges & Competitions
- ✅ Mini Projects & Tasks
- ✅ Follow System
- ✅ Multi-language Support
- ✅ Comprehensive API Documentation

**Ready for frontend integration!** 🎉
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
