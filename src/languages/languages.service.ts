import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.languages.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.languages.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.languages.findUnique({
      where: { code },
    });
  }
}
