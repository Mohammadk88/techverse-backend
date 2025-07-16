import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { ReactionType } from '@prisma/client';
import {
  CreateReactionDto,
  ReactionStatsDto,
  ReactionResponseDto,
} from './dto/reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async addReaction(
    userId: number,
    createReactionDto: CreateReactionDto,
  ): Promise<ReactionResponseDto> {
    const { type, articleId, projectId, challengeId, cafePostId } =
      createReactionDto;

    // Validate that exactly one content ID is provided
    const contentIds = [articleId, projectId, challengeId, cafePostId].filter(
      Boolean,
    );
    if (contentIds.length !== 1) {
      throw new BadRequestException(
        'Exactly one content ID must be provided',
      );
    }

    // Validate content exists
    await this.validateContentExists(
      articleId,
      projectId,
      challengeId,
      cafePostId,
    );

    // Check if user already has a reaction on this content
    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        userId,
        ...(articleId && { articleId }),
        ...(projectId && { projectId }),
        ...(challengeId && { challengeId }),
        ...(cafePostId && { cafePostId }),
      },
    });

    if (existingReaction) {
      // Update existing reaction if different type
      if (existingReaction.type !== type) {
        const updatedReaction = await this.prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });
        return {
          id: updatedReaction.id,
          type: updatedReaction.type,
          userId: updatedReaction.userId,
          user: updatedReaction.user,
          createdAt: updatedReaction.createdAt,
        };
      }
      // If same type, return existing reaction
      return {
        id: existingReaction.id,
        type: existingReaction.type,
        userId: existingReaction.userId,
        createdAt: existingReaction.createdAt,
      };
    }

    // Create new reaction
    const newReaction = await this.prisma.reaction.create({
      data: {
        userId,
        type,
        articleId,
        projectId,
        challengeId,
        cafePostId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Award points for reaction
    try {
      await this.walletService.earnTechCoin(userId, {
        amount: 1,
        description: `Reaction on ${this.getContentType(
          articleId,
          projectId,
          challengeId,
          cafePostId,
        )}`,
        xpReward: 1,
        category: 'engagement',
      });
    } catch (error) {
      console.error('Failed to award points for reaction:', error);
    }

    return {
      id: newReaction.id,
      type: newReaction.type,
      userId: newReaction.userId,
      user: newReaction.user,
      createdAt: newReaction.createdAt,
    };
  }

  async removeReaction(
    userId: number,
    articleId?: number,
    projectId?: number,
    challengeId?: number,
    cafePostId?: number,
  ): Promise<{ message: string }> {
    const reaction = await this.prisma.reaction.findFirst({
      where: {
        userId,
        ...(articleId && { articleId }),
        ...(projectId && { projectId }),
        ...(challengeId && { challengeId }),
        ...(cafePostId && { cafePostId }),
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reaction.delete({
      where: { id: reaction.id },
    });

    return { message: 'Reaction removed successfully' };
  }

  async getReactionStats(
    articleId?: number,
    projectId?: number,
    challengeId?: number,
    cafePostId?: number,
    userId?: number,
  ): Promise<ReactionStatsDto> {
    const reactions = await this.prisma.reaction.findMany({
      where: {
        ...(articleId && { articleId }),
        ...(projectId && { projectId }),
        ...(challengeId && { challengeId }),
        ...(cafePostId && { cafePostId }),
      },
    });

    // Count reactions by type
    const breakdown = reactions.reduce(
      (acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      },
      {} as Record<ReactionType, number>,
    );

    // Ensure all reaction types are present
    Object.values(ReactionType).forEach((type) => {
      if (!breakdown[type]) {
        breakdown[type] = 0;
      }
    });

    // Get user's reaction if userId provided
    const userReaction = userId
      ? reactions.find((r) => r.userId === userId)?.type
      : undefined;

    return {
      total: reactions.length,
      breakdown,
      userReaction,
    };
  }

  async getContentReactions(
    articleId?: number,
    projectId?: number,
    challengeId?: number,
    cafePostId?: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    reactions: ReactionResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [reactions, total] = await Promise.all([
      this.prisma.reaction.findMany({
        where: {
          ...(articleId && { articleId }),
          ...(projectId && { projectId }),
          ...(challengeId && { challengeId }),
          ...(cafePostId && { cafePostId }),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reaction.count({
        where: {
          ...(articleId && { articleId }),
          ...(projectId && { projectId }),
          ...(challengeId && { challengeId }),
          ...(cafePostId && { cafePostId }),
        },
      }),
    ]);

    return {
      reactions: reactions.map((reaction) => ({
        id: reaction.id,
        type: reaction.type,
        userId: reaction.userId,
        user: reaction.user,
        createdAt: reaction.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async validateContentExists(
    articleId?: number,
    projectId?: number,
    challengeId?: number,
    cafePostId?: number,
  ): Promise<void> {
    if (articleId) {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
      });
      if (!article) {
        throw new NotFoundException('Article not found');
      }
    }

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    if (challengeId) {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
      });
      if (!challenge) {
        throw new NotFoundException('Challenge not found');
      }
    }

    if (cafePostId) {
      const cafePost = await this.prisma.cafePost.findUnique({
        where: { id: cafePostId },
      });
      if (!cafePost) {
        throw new NotFoundException('Cafe post not found');
      }
    }
  }

  private getContentType(
    articleId?: number,
    projectId?: number,
    challengeId?: number,
    cafePostId?: number,
  ): string {
    if (articleId) return 'article';
    if (projectId) return 'project';
    if (challengeId) return 'challenge';
    if (cafePostId) return 'cafe post';
    return 'content';
  }
}
