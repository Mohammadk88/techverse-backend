import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CafesModule } from './cafes/cafes.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { LanguagesModule } from './languages/languages.module';
import { CountriesModule } from './countries/countries.module';
import { RolesModule } from './roles/roles.module';
import { ExamplesModule } from './examples/examples.module';
import { ApiDocsModule } from './api-docs/api-docs.module';
import { AIModule } from './ai/ai.module';
import { AIKeysModule } from './ai-keys/ai-keys.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ProjectsModule } from './projects/projects.module';
import { WalletModule } from './wallet/wallet.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ReactionsModule } from './reactions/reactions.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
    CafesModule,
    BookmarksModule,
    LanguagesModule,
    CountriesModule,
    RolesModule,
    ExamplesModule,
    ApiDocsModule,
    AIModule,
    AIKeysModule,
    SchedulerModule,
    ProjectsModule,
    WalletModule,
    ChallengesModule,
    ReactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
