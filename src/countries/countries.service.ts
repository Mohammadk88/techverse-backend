import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.country.findMany({
      include: {
        language: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.country.findUnique({
      where: { id },
      include: {
        language: true,
        cities: true,
      },
    });
  }

  async findCitiesByCountry(countryId: number) {
    return this.prisma.city.findMany({
      where: { countryId },
      orderBy: { name: 'asc' },
    });
  }
}
