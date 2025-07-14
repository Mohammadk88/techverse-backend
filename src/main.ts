import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TechVerse Café API')
    .setDescription(
      `Backend API for TechVerse Café - A multilingual tech and media social platform

## Features
- 🔐 JWT Authentication & Role-based Access Control
- 🌍 Multi-language Support (Languages, Countries, Cities)
- 📝 Content Management (Articles, Posts, Forums)
- ☕ Community Management (Cafés - Discussion Groups)
- 🎧 Podcast System (TalkTech Episodes & Playlists)
- 🔖 Bookmarking System
- 👥 User Profiles & Social Features

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the \`X-HTTP-TOKEN\` header.

## Role-Based Access Control
The platform uses a two-tier role system:
- **Global Roles**: ADMIN, SUPERVISOR, EDITOR, MEMBER
- **Café Roles**: BARISTA, THINKER, JOURNALIST, MEMBER

## Getting Started
1. Register a new user account
2. Login to receive JWT token
3. Use the token in \`X-HTTP-TOKEN\` header for authenticated requests
4. Explore the community features and create content

## Download API Specification
- JSON Format: [/api/swagger.json](/api/swagger.json)
- YAML Format: [/api/swagger.yaml](/api/swagger.yaml)
      `,
    )
    .setVersion('1.0.0')
    .setContact(
      'TechVerse Team',
      'https://techverse.cafe',
      'support@techverse.cafe',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:4040', 'Development Server')
    .addServer('https://api.techverse.cafe', 'Production Server')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-HTTP-TOKEN',
        in: 'header',
        description: 'JWT token for authentication. Format: Bearer <token>',
      },
      'X-HTTP-TOKEN',
    )
    .addTag('Authentication', 'User authentication, registration, and profile management')
    .addTag('Users', 'User management, profiles, and social features')
    .addTag('Articles', 'Article creation, management, and publishing system')
    .addTag('Posts', 'Community posts, social interactions, and discussions')
    .addTag('Cafés', 'Discussion groups, communities, and café management')
    .addTag('forums', 'Q&A forum, discussions, and community engagement')
    .addTag('podcasts', 'TalkTech podcast episodes, playlists, and comments')
    .addTag('bookmarks', 'User saved items and bookmark management')
    .addTag('languages', 'Supported UI languages and internationalization')
    .addTag('countries', 'Countries and cities data for user locations')
    .addTag('roles', 'Role-based access control and permission management')
    .addTag('examples', 'Example endpoints demonstrating role-based access control')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Export Swagger JSON for frontend integration
  const outputPath = path.resolve(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`📄 Swagger JSON exported to: ${outputPath}`);
  
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'TechVerse Café API Documentation',
  });

  // Add endpoint to download the Swagger JSON
  app.getHttpAdapter().get('/api/swagger.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=techverse-api-spec.json');
    res.send(document);
  });

  const port = process.env.PORT ?? 4040;
  await app.listen(port);
  
  console.log(`🚀 TechVerse Café API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📄 Download API Spec: http://localhost:${port}/api/swagger.json`);
}

void bootstrap();
