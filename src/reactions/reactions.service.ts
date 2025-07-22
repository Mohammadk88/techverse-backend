import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { reaction_types } from '@prisma/client';
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
    user_id: number,
    createReactionDto: CreateReactionDto,
  ): Promise<ReactionResponseDto> {
    const { type, article_id, project_id, challengeId, cafePostId } =
      createReactionDto;

    // Validate that exactly one content ID is provided
    const contentIds = [article_id, project_id, challengeId, cafePostId].filter(
      Boolean,
    );
    if (contentIds.length !== 1) {
      throw new BadRequestException(
        'Exactly one content ID must be provided',
      );
    }

    // Validate content exists
    await this.validateContentExists(
      article_id,
      project_id,
      challengeId,
      cafePostId,
    );

    // Check if user already has a reaction on this content
    const existingReaction = await this.prisma.reactions.findFirst({
      where: {
        user_id,
        ...(article_id && { article_id }),
        ...(project_id && { project_id }),
        ...(challengeId && { challengeId }),
        ...(cafePostId && { cafePostId }),
      },
    });

    if (existingReaction) {
      // Update existing reaction if different type
      if (existingReaction.type !== type) {
        const updatedReaction = await this.prisma.reactions.update({
          where: { id: existingReaction.id },
          data: { type },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                avatar: true,
              },
            },
          },
        });
        return {
          id: updatedReaction.id,
          type: updatedReaction.type,
          user_id: updatedReaction.user_id,
          user: updatedReaction.users,
          created_at: updatedReaction.created_at,
        };
      }
      // If same type, return existing reaction
      return {
        id: existingReaction.id,
        type: existingReaction.type,
        user_id: existingReaction.user_id,
        created_at: existingReaction.created_at,
      };
    }

    // Create new reaction
    const newReaction = await this.prisma.reactions.create({
      data: {
        user_id,
        type,
        article_id,
        project_id,
        challenge_id: challengeId,
        cafe_post_id: cafePostId,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar: true,
          },
        },
      },
    });

    // Award points for reaction
    try {
      await this.walletService.earnTechCoin(user_id, {
        amount: 1,
        description: `Reaction on ${this.getContentType(
          article_id,
          project_id,
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
      user_id: newReaction.user_id,
      user: newReaction.users,
      created_at: newReaction.created_at,
    };
  }

  async removeReaction(
    user_id: number,
    article_id?: number,
    project_id?: number,
    challengeId?: number,
    cafePostId?: number,
  ): Promise<{ message: string }> {
    const reaction = await this.prisma.reactions.findFirst({
      where: {
        user_id,
        ...(article_id && { article_id }),
        ...(project_id && { project_id }),
        ...(challengeId && { challengeId }),
        ...(cafePostId && { cafePostId }),
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reactions.delete({
      where: { id: reaction.id },
    });

    return { message: 'Reaction removed successfully' };
  }

  async getReactionStats(
    article_id?: number,
    project_id?: number,
    challengeId?: number,
    cafePostId?: number,
    user_id?: number,
  ): Promise<ReactionStatsDto> {
    const reactions = await this.prisma.reactions.findMany({
      where: {
        ...(article_id && { article_id }),
        ...(project_id && { project_id }),
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
      {} as Record<reaction_types, number>,
    );

    // Ensure all reaction types are present
    Object.values(reaction_types).forEach((type) => {
      if (!breakdown[type]) {
        breakdown[type] = 0;
      }
    });

    // Get user's reaction if user_id provided
    const userReaction = user_id
      ? reactions.find((r) => r.user_id === user_id)?.type
      : undefined;

    return {
      total: reactions.length,
      breakdown,
      userReaction,
    };
  }

  async getContentReactions(
    article_id?: number,
    project_id?: number,
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
      this.prisma.reactions.findMany({
        where: {
          ...(article_id && { article_id }),
          ...(project_id && { project_id }),
          ...(challengeId && { challengeId }),
          ...(cafePostId && { cafePostId }),
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reactions.count({
        where: {
          ...(article_id && { article_id }),
          ...(project_id && { project_id }),
          ...(challengeId && { challengeId }),
          ...(cafePostId && { cafePostId }),
        },
      }),
    ]);

    return {
      reactions: reactions.map((reaction) => ({
        id: reaction.id,
        type: reaction.type,
        user_id: reaction.user_id,
        user: reaction.users,
        created_at: reaction.created_at,
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
    article_id?: number,
    project_id?: number,
    challengeId?: number,
    cafePostId?: number,
  ): Promise<void> {
    if (article_id) {
      const article = await this.prisma.article_tags.findUnique({
        where: { id: article_id },
      });
      if (!article) {
        throw new NotFoundException('Article not found');
      }
    }

    if (project_id) {
      const project = await this.prisma.projects.findUnique({
        where: { id: project_id },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    if (challengeId) {
      const challenge = await this.prisma.challenges.findUnique({
        where: { id: challengeId },
      });
      if (!challenge) {
        throw new NotFoundException('Challenge not found');
      }
    }

    if (cafePostId) {
      const cafePost = await this.prisma.cafe_posts.findUnique({
        where: { id: cafePostId },
      });
      if (!cafePost) {
        throw new NotFoundException('Cafe post not found');
      }
    }
  }

  private getContentType(
    article_id?: number,
    project_id?: number,
    challengeId?: number,
    cafePostId?: number,
  ): string {
    if (article_id) return 'article';
    if (project_id) return 'project';
    if (challengeId) return 'challenge';
    if (cafePostId) return 'cafe post';
    return 'content';
  }
}
