import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async publishScheduledContent(): Promise<void> {
    this.logger.log('Checking for scheduled content to publish...');

    const now = new Date();

    try {
      // Publish scheduled articles
      const scheduledArticles = await this.prisma.articles.findMany({
        where: {
          is_published: false,
          scheduled_for: {
            lte: now,
          },
        },
        select: {
          id: true,
          title: true,
          scheduled_for: true,
        },
      });

      if (scheduledArticles.length > 0) {
        // Mark articles as published
        await this.prisma.articles.updateMany({
          where: {
            id: { in: scheduledArticles.map((a) => a.id) },
          },
          data: {
            is_published: true,
          },
        });

        this.logger.log(
          `Published ${scheduledArticles.length} scheduled articles`,
        );

        // Log each published article
        scheduledArticles.forEach((article) => {
          this.logger.log(
            `📄 Published article: "${article.title}" (scheduled for ${article.scheduled_for?.toISOString()})`,
          );
        });
      }

      if (scheduledArticles.length === 0) {
        this.logger.log('No scheduled content found for publishing');
      }
    } catch (error) {
      this.logger.error('Error publishing scheduled content:', error);
    }
  }

  async getScheduledContent(): Promise<{
    articles: any[];
    totalCount: number;
  }> {
    const now = new Date();

    const articles = await this.prisma.articles.findMany({
      where: {
        is_published: false,
        scheduled_for: {
          gt: now,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        article_categories: true,
      },
      orderBy: {
        scheduled_for: 'asc',
      },
    });

    return {
      articles,
      totalCount: articles.length,
    };
  }

  async cancelScheduledContent(type: 'article', id: number): Promise<void> {
    await this.prisma.articles.update({
      where: { id },
      data: {
        scheduled_for: null,
      },
    });

    this.logger.log(`Cancelled scheduled ${type} with ID: ${id}`);
  }

  async rescheduleContent(
    type: 'article',
    id: number,
    newScheduleTime: Date,
  ): Promise<void> {
    await this.prisma.articles.update({
      where: { id },
      data: {
        scheduled_for: newScheduleTime,
        is_published: false, // Ensure it's not published yet
      },
    });

    this.logger.log(
      `Rescheduled ${type} with ID: ${id} to ${newScheduleTime.toISOString()}`,
    );
  }
}
