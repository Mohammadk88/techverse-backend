import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.language.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.language.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.language.findUnique({
      where: { code },
    });
  }
}
