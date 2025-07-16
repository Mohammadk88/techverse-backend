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
      const scheduledArticles = await this.prisma.article.findMany({
        where: {
          isPublished: false,
          scheduledFor: {
            lte: now,
          },
        },
        select: {
          id: true,
          title: true,
          scheduledFor: true,
        },
      });

      if (scheduledArticles.length > 0) {
        const publishedArticles = await this.prisma.article.updateMany({
          where: {
            id: {
              in: scheduledArticles.map((article) => article.id),
            },
          },
          data: {
            isPublished: true,
            publishedAt: now,
            scheduledFor: null, // Clear the schedule
          },
        });

        this.logger.log(
          `Published ${publishedArticles.count} scheduled articles`,
        );

        // Log each published article
        scheduledArticles.forEach((article) => {
          this.logger.log(
            `📄 Published article: "${article.title}" (scheduled for ${article.scheduledFor?.toISOString()})`,
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

    const articles = await this.prisma.article.findMany({
      where: {
        isPublished: false,
        scheduledFor: {
          gt: now,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        category: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    return {
      articles,
      totalCount: articles.length,
    };
  }

  async cancelScheduledContent(type: 'article', id: number): Promise<void> {
    await this.prisma.article.update({
      where: { id },
      data: {
        scheduledFor: null,
      },
    });

    this.logger.log(`Cancelled scheduled ${type} with ID: ${id}`);
  }

  async rescheduleContent(
    type: 'article',
    id: number,
    newScheduleTime: Date,
  ): Promise<void> {
    await this.prisma.article.update({
      where: { id },
      data: {
        scheduledFor: newScheduleTime,
        isPublished: false, // Ensure it's not published yet
      },
    });

    this.logger.log(
      `Rescheduled ${type} with ID: ${id} to ${newScheduleTime.toISOString()}`,
    );
  }
}
