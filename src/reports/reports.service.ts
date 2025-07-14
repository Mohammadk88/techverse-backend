import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: Prisma.ReportCreateInput) {
    return this.prisma.report.create({
      data: createReportDto,
      include: {
        reportedBy: {
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

  async findAll(skip?: number, take?: number, status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : {},
      skip,
      take,
      include: {
        reportedBy: {
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
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        reportedBy: {
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

  async update(id: number, updateReportDto: Prisma.ReportUpdateInput) {
    return this.prisma.report.update({
      where: { id },
      data: updateReportDto,
    });
  }

  async updateStatus(id: number, status: ReportStatus) {
    return this.prisma.report.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number) {
    return this.prisma.report.delete({ where: { id } });
  }

  async findByContentType(contentType: string) {
    return this.prisma.report.findMany({
      where: { contentType },
      include: {
        reportedBy: {
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

  async findByReporter(reportedById: number) {
    return this.prisma.report.findMany({
      where: { reportedById },
      include: {
        reportedBy: {
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

  async getReportStats() {
    const totalReports = await this.prisma.report.count();
    const pendingReports = await this.prisma.report.count({
      where: { status: ReportStatus.PENDING },
    });
    const reviewedReports = await this.prisma.report.count({
      where: { status: ReportStatus.REVIEWED },
    });
    const rejectedReports = await this.prisma.report.count({
      where: { status: ReportStatus.REJECTED },
    });

    const reportsByContentType = await this.prisma.report.groupBy({
      by: ['contentType'],
      _count: true,
    });

    return {
      total: totalReports,
      pending: pendingReports,
      reviewed: reviewedReports,
      rejected: rejectedReports,
      byContentType: reportsByContentType,
    };
  }
}
