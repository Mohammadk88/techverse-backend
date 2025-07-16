import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateChallengeDto, JoinChallengeDto, SubmitChallengeDto } from './dto';

@Injectable()
export class ChallengesService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  // Create a new challenge
  async createChallenge(userId: number, createDto: CreateChallengeDto) {
    // Check if user has enough TechCoin to create challenge
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      userId,
      createDto.reward,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin. Need ${createDto.reward} to create this challenge.`,
      );
    }

    // Deduct the reward amount from creator's wallet
    await this.walletService.spendTechCoin(userId, {
      amount: createDto.reward,
      description: `Created challenge: ${createDto.title}`,
    });

    // Create the challenge
    const challenge = await this.prisma.challenge.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        reward: createDto.reward,
        entryFee: createDto.entryFee,
        type: createDto.type,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return challenge;
  }

  // Get all challenges with pagination
  async getAllChallenges(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [challenges, total] = await Promise.all([
      this.prisma.challenge.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
      this.prisma.challenge.count(),
    ]);

    return {
      challenges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get single challenge by ID
  async getChallengeById(id: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { voteCount: 'desc' },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  // Join a challenge
  async joinChallenge(
    userId: number,
    challengeId: number,
    joinDto: JoinChallengeDto,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.createdById === userId) {
      throw new BadRequestException('You cannot join your own challenge');
    }

    // Check if challenge is still open
    const now = new Date();
    if (now < challenge.startDate) {
      throw new BadRequestException('Challenge has not started yet');
    }

    if (now > challenge.endDate) {
      throw new BadRequestException('Challenge has ended');
    }

    // Check if user already joined
    const existingParticipant = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('You have already joined this challenge');
    }

    // Check if user has enough TechCoin for entry fee
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      userId,
      challenge.entryFee,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin. Need ${challenge.entryFee} to join this challenge.`,
      );
    }

    // Deduct entry fee
    await this.walletService.spendTechCoin(userId, {
      amount: challenge.entryFee,
      description: `Joined challenge: ${challenge.title}`,
    });

    // Join the challenge
    const participant = await this.prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId,
        submissionUrl: joinDto.portfolioUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            reward: true,
            entryFee: true,
          },
        },
      },
    });

    return participant;
  }

  // Submit solution to challenge
  async submitSolution(
    userId: number,
    challengeId: number,
    submitDto: SubmitChallengeDto,
  ) {
    const participant = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      include: {
        challenge: true,
      },
    });

    if (!participant) {
      throw new NotFoundException(
        'You are not a participant in this challenge',
      );
    }

    // Check if challenge is still active
    const now = new Date();
    if (now > participant.challenge.endDate) {
      throw new BadRequestException('Challenge submission period has ended');
    }

    // Update submission
    const updatedParticipant = await this.prisma.challengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      data: {
        submissionUrl: submitDto.submissionUrl,
        submittedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updatedParticipant;
  }

  // Vote for a participant (for VOTE type challenges)
  async voteForParticipant(
    voterId: number,
    challengeId: number,
    participantUserId: number,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check if challenge is ended
    const now = new Date();
    if (now <= challenge.endDate) {
      throw new BadRequestException(
        'Cannot vote until challenge period has ended',
      );
    }

    // Check if challenge allows voting
    if (challenge.type !== 'VOTE') {
      throw new BadRequestException('This challenge does not allow voting');
    }

    // Check if voter is a participant (participants can vote for others)
    const voterParticipant = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: voterId,
        },
      },
    });

    if (!voterParticipant) {
      throw new ForbiddenException(
        'Only participants can vote in this challenge',
      );
    }

    // Cannot vote for yourself
    if (voterId === participantUserId) {
      throw new BadRequestException('You cannot vote for yourself');
    }

    // Check if participant exists
    const participant = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: participantUserId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Update vote count
    const updatedParticipant = await this.prisma.challengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId: participantUserId,
        },
      },
      data: {
        voteCount: {
          increment: 1,
        },
      },
    });

    return updatedParticipant;
  }

  // Close challenge and determine winner
  async closeChallenge(userId: number, challengeId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: {
          orderBy: { voteCount: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Only creator can close the challenge
    if (challenge.createdById !== userId) {
      throw new ForbiddenException('Only challenge creator can close it');
    }

    // Check if challenge has ended
    const now = new Date();
    if (now <= challenge.endDate) {
      throw new BadRequestException('Challenge period has not ended yet');
    }

    if (challenge.status === 'CLOSED') {
      throw new BadRequestException('Challenge is already closed');
    }

    // Determine winner (highest vote count)
    let winner: any = null;
    if (challenge.participants.length > 0) {
      const topParticipant = challenge.participants[0];
      winner = topParticipant;

      // Award the winner
      if (topParticipant) {
        await this.walletService.earnTechCoin(topParticipant.userId, {
          amount: challenge.reward,
          description: `Won challenge: ${challenge.title}`,
        });

        // Update winner status
        await this.prisma.challengeParticipant.update({
          where: {
            challengeId_userId: {
              challengeId,
              userId: topParticipant.userId,
            },
          },
          data: {
            result: 'WINNER',
          },
        });

        // Update losers
        for (const participant of challenge.participants.slice(1)) {
          await this.prisma.challengeParticipant.update({
            where: {
              challengeId_userId: {
                challengeId,
                userId: participant.userId,
              },
            },
            data: {
              result: 'LOST',
            },
          });
        }
      }
    }

    // Close the challenge
    const closedChallenge = await this.prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'CLOSED',
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { voteCount: 'desc' },
        },
      },
    });

    return {
      challenge: closedChallenge,
      winner,
    };
  }

  // Get user's challenges (created by user)
  async getUserCreatedChallenges(userId: number) {
    return this.prisma.challenge.findMany({
      where: { createdById: userId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get user's participated challenges
  async getUserParticipatedChallenges(userId: number) {
    const participants = await this.prisma.challengeParticipant.findMany({
      where: { userId },
      include: {
        challenge: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return participants.map((p) => ({
      ...p.challenge,
      myParticipation: {
        submissionUrl: p.submissionUrl,
        voteCount: p.voteCount,
        result: p.result,
        submittedAt: p.submittedAt,
      },
    }));
  }
}
