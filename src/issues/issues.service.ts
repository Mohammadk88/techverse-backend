import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, IssueStatus, DeveloperRank } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async create(createIssueDto: Prisma.IssueCreateInput) {
    return this.prisma.issue.create({
      data: createIssueDto,
      include: {
        createdBy: {
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
  }

  async findAll(skip?: number, take?: number, status?: IssueStatus) {
    return this.prisma.issue.findMany({
      where: status ? { status } : {},
      skip,
      take,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        solvedBy: {
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
    });
  }

  async findOne(id: number) {
    return this.prisma.issue.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        solvedBy: {
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
  }

  async update(id: number, updateIssueDto: Prisma.IssueUpdateInput) {
    return this.prisma.issue.update({
      where: { id },
      data: updateIssueDto,
    });
  }

  async markAsSolved(id: number, solverId: number) {
    // Update issue to solved
    const issue = await this.prisma.issue.update({
      where: { id },
      data: {
        status: IssueStatus.SOLVED,
        solvedById: solverId,
        solvedAt: new Date(),
      },
    });

    // Award points to solver (default 10 points per issue)
    await this.updateDeveloperProfile(solverId, 10);

    return issue;
  }

  async remove(id: number) {
    return this.prisma.issue.delete({ where: { id } });
  }

  async findByCreator(creatorId: number) {
    return this.prisma.issue.findMany({
      where: { createdById: creatorId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        solvedBy: {
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
    });
  }

  async findBySolver(solverId: number) {
    return this.prisma.issue.findMany({
      where: { solvedById: solverId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        solvedBy: {
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
    });
  }

  private async updateDeveloperProfile(userId: number, pointsToAdd: number) {
    const profile = await this.prisma.developerProfile.upsert({
      where: { userId },
      update: {
        points: {
          increment: pointsToAdd,
        },
      },
      create: {
        userId,
        points: pointsToAdd,
        rank: DeveloperRank.BEGINNER,
      },
    });

    // Update rank based on points
    let newRank: DeveloperRank = DeveloperRank.BEGINNER;
    if (profile.points >= 500) newRank = DeveloperRank.CONSULTANT;
    else if (profile.points >= 200) newRank = DeveloperRank.EXPERT;
    else if (profile.points >= 50) newRank = DeveloperRank.PROBLEM_SOLVER;

    if (newRank !== profile.rank) {
      await this.prisma.developerProfile.update({
        where: { userId },
        data: { rank: newRank },
      });
    }

    return profile;
  }

  async getDeveloperRankings(take?: number) {
    return this.prisma.developerProfile.findMany({
      take,
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
      orderBy: { points: 'desc' },
    });
  }
}
