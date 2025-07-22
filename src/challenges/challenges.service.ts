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
  async createChallenge(user_id: number, createDto: CreateChallengeDto) {
    // Check if user has enough TechCoin to create challenge
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      user_id,
      createDto.reward,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin. Need ${createDto.reward} to create this challenge.`,
      );
    }

    // Deduct the reward amount from creator's wallet
    await this.walletService.spendTechCoin(user_id, {
      amount: createDto.reward,
      description: `Created challenges: ${createDto.title}`,
    });

    // Create the challenge
    const challenge = await this.prisma.challenges.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        reward: createDto.reward,
        entryFee: createDto.entryFee,
        type: createDto.type,
        start_date: new Date(createDto.start_date),
        end_date: new Date(createDto.end_date),
        created_by_id: user_id,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        challenge_participants: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
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
      this.prisma.challenges.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
            },
          },
          challenge_participants: {
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
          _count: {
            select: {
              challenge_participants: true,
            },
          },
        },
      }),
      this.prisma.challenges.count(),
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
    const challenge = await this.prisma.challenges.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        challenge_participants: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: { vote_count: 'desc' },
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
    user_id: number,
    challenge_id: number,
    joinDto: JoinChallengeDto,
  ) {
    const challenge = await this.prisma.challenges.findUnique({
      where: { id: challenge_id },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.created_by_id === user_id) {
      throw new BadRequestException('You cannot join your own challenge');
    }

    // Check if challenge is still open
    const now = new Date();
    if (now < challenge.start_date) {
      throw new BadRequestException('Challenge has not started yet');
    }

    if (now > challenge.end_date) {
      throw new BadRequestException('Challenge has ended');
    }

    // Check if user already joined
    const existingParticipant = await this.prisma.challenge_participants.findUnique({
      where: {
        challenge_id_user_id: {
          challenge_id: challenge_id,
          user_id,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('You have already joined this challenge');
    }

    // Check if user has enough TechCoin for entry fee
    const hasEnough = await this.walletService.hasEnoughTechCoin(
      user_id,
      challenge.entryFee,
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Insufficient TechCoin. Need ${challenge.entryFee} to join this challenge.`,
      );
    }

    // Deduct entry fee
    await this.walletService.spendTechCoin(user_id, {
      amount: challenge.entryFee,
      description: `Joined challenges: ${challenge.title}`,
    });

    // Join the challenge
    const participant = await this.prisma.challenge_participants.create({
      data: {
        challenge_id: challenge_id,
        user_id,
        submission_url: joinDto.portfolioUrl,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        challenges: {
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
    user_id: number,
    challenge_id: number,
    submitDto: SubmitChallengeDto,
  ) {
    const participant = await this.prisma.challenge_participants.findUnique({
      where: {
        challenge_id_user_id: {
          challenge_id: challenge_id,
          user_id,
        },
      },
      include: {
        challenges: true,
      },
    });

    if (!participant) {
      throw new NotFoundException(
        'You are not a participant in this challenge',
      );
    }

    // Check if challenge is still active
    const now = new Date();
    if (now > participant.challenges.end_date) {
      throw new BadRequestException('Challenge submission period has ended');
    }

    // Update submission
    const updatedParticipant = await this.prisma.challenge_participants.update({
      where: {
        challenge_id_user_id: {
          challenge_id: challenge_id,
          user_id,
        },
      },
      data: {
        submission_url: submitDto.submission_url,
        submitted_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        challenges: {
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
    challenge_id: number,
    participantUserId: number,
  ) {
    const challenge = await this.prisma.challenges.findUnique({
      where: { id: challenge_id },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check if challenge is ended
    const now = new Date();
    if (now <= challenge.end_date) {
      throw new BadRequestException(
        'Cannot vote until challenge period has ended',
      );
    }

    // Check if challenge allows voting
    if (challenge.type !== 'VOTE') {
      throw new BadRequestException('This challenge does not allow voting');
    }

    // Check if voter is a participant (participants can vote for others)
    const voterParticipant = await this.prisma.challenge_participants.findUnique({
      where: {
        challenge_id_user_id: {
          challenge_id: challenge_id,
          user_id: voterId,
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
    const participant = await this.prisma.challenge_participants.findUnique({
      where: {
        challenge_id_user_id: {
          challenge_id: challenge_id,
          user_id: participantUserId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Update vote count
    const updatedParticipant = await this.prisma.challenge_participants.update({
      where: {
        challenge_id_user_id: {
          challenge_id: challenge_id,
          user_id: participantUserId,
        },
      },
      data: {
        vote_count: {
          increment: 1,
        },
      },
    });

    return updatedParticipant;
  }

  // Close challenge and determine winner
  async closeChallenge(user_id: number, challenge_id: number) {
    const challenge = await this.prisma.challenges.findUnique({
      where: { id: challenge_id },
      include: {
        challenge_participants: {
          orderBy: { vote_count: 'desc' },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
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
    if (challenge.created_by_id !== user_id) {
      throw new ForbiddenException('Only challenge creator can close it');
    }

    // Check if challenge has ended
    const now = new Date();
    if (now <= challenge.end_date) {
      throw new BadRequestException('Challenge period has not ended yet');
    }

    if (challenge.status === 'CLOSED') {
      throw new BadRequestException('Challenge is already closed');
    }

    // Determine winner (highest vote count)
    let winner: any = null;
    if (challenge.challenge_participants.length > 0) {
      const topParticipant = challenge.challenge_participants[0];
      winner = topParticipant;

      // Award the winner
      if (topParticipant) {
        await this.walletService.earnTechCoin(topParticipant.user_id, {
          amount: challenge.reward,
          description: `Won challenges: ${challenge.title}`,
        });

        // Update winner status
        await this.prisma.challenge_participants.update({
          where: {
            challenge_id_user_id: {
              challenge_id: challenge_id,
              user_id: topParticipant.user_id,
            },
          },
          data: {
            result: 'WINNER',
          },
        });

        // Update losers
        for (const participant of challenge.challenge_participants.slice(1)) {
          await this.prisma.challenge_participants.update({
            where: {
              challenge_id_user_id: {
                challenge_id: challenge_id,
                user_id: participant.user_id,
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
    const closedChallenge = await this.prisma.challenges.update({
      where: { id: challenge_id },
      data: {
        status: 'CLOSED',
      },
      include: {
        challenge_participants: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: { vote_count: 'desc' },
        },
      },
    });

    return {
      challenges: closedChallenge,
      winner,
    };
  }

  // Get user's challenges (created by user)
  async getUserCreatedChallenges(user_id: number) {
    return this.prisma.challenges.findMany({
      where: { created_by_id: user_id },
      include: {
        challenge_participants: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        _count: {
          select: {
            challenge_participants: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Get user's participated challenges
  async getUserParticipatedChallenges(user_id: number) {
    const participants = await this.prisma.challenge_participants.findMany({
      where: { user_id },
      include: {
        challenges: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
              },
            },
            _count: {
              select: {
                challenge_participants: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return participants.map((p) => ({
      ...p.challenges,
      myParticipation: {
        submission_url: p.submission_url,
        vote_count: p.vote_count,
        result: p.result,
        submitted_at: p.submitted_at,
      },
    }));
  }
}
