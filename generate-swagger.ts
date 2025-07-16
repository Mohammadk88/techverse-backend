import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Import modules individually
import { Module } from '@nestjs/common';
import { ProjectsController } from './src/projects/projects.controller';
import { ProjectsService } from './src/projects/projects.service';
import { DatabaseModule } from './src/database/database.module';
import { WalletModule } from './src/wallet/wallet.module';

// Create a minimal module for generating swagger docs
@Module({
  imports: [DatabaseModule, WalletModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
class SwaggerGeneratorModule {}

async function generateSwagger() {
  const app = await NestFactory.create(SwaggerGeneratorModule);

  const config = new DocumentBuilder()
    .setTitle('TechVerse Café API')
    .setDescription('Backend API for TechVerse Café')
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-HTTP-TOKEN',
        in: 'header',
        description: 'JWT token for authentication',
      },
      'X-HTTP-TOKEN',
    )
    .addTag('Mini Projects', 'Mini projects and task management system')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  const outputPath = resolve(process.cwd(), 'swagger-export.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  
  console.log(`✅ New API endpoints exported to: ${outputPath}`);
  console.log(`📊 Total endpoints: ${Object.keys(document.paths).length}`);
  
  await app.close();
}

generateSwagger().catch(console.error);
