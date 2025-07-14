import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: Prisma.EventCreateInput) {
    return this.prisma.event.create({ data: createEventDto });
  }

  async findAll(skip?: number, take?: number) {
    return this.prisma.event.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateEventDto: Prisma.EventUpdateInput) {
    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: number) {
    return this.prisma.event.delete({ where: { id } });
  }

  async findUpcoming() {
    return this.prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.event.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
