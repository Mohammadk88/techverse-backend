import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { PostsModule } from './posts/posts.module';
import { CafesModule } from './cafes/cafes.module';
import { ForumModule } from './forum/forum.module';
import { PodcastModule } from './podcast/podcast.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { LanguagesModule } from './languages/languages.module';
import { CountriesModule } from './countries/countries.module';
import { RolesModule } from './roles/roles.module';
import { ExamplesModule } from './examples/examples.module';
import { ApiDocsModule } from './api-docs/api-docs.module';
import { AIModule } from './ai/ai.module';
import { AIKeysModule } from './ai-keys/ai-keys.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { EventsModule } from './events/events.module';
import { IssuesModule } from './issues/issues.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
    PostsModule,
    CafesModule,
    ForumModule,
    PodcastModule,
    BookmarksModule,
    LanguagesModule,
    CountriesModule,
    RolesModule,
    ExamplesModule,
    ApiDocsModule,
    AIModule,
    AIKeysModule,
    SchedulerModule,
    EventsModule,
    IssuesModule,
    ReportsModule,
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
