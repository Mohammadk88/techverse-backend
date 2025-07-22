import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.countries.findMany({
      include: {
        languages: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.countries.findUnique({
      where: { id },
      include: {
        languages: true,
        cities: true,
      },
    });
  }

  async findCitiesByCountry(country_id: number) {
    return this.prisma.cities.findMany({
      where: { country_id },
      orderBy: { name: 'asc' },
    });
  }
}
