import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🗺️ Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({
    status: 200,
    description: 'List of countries with default language',
    example: [
      {
        id: 1,
        name: 'United States',
        code: 'US',
        language_id: 1,
        language: {
          id: 1,
          name: 'English',
          native_name: 'English',
          code: 'en',
          direction: 'ltr',
        },
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    ],
  })
  findAll() {
    return this.countriesService.findAll();
  }

  @Get(':id/cities')
  @Public()
  @ApiOperation({ summary: 'Get cities by country' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiResponse({
    status: 200,
    description: 'List of cities in the country',
    example: [
      {
        id: 1,
        name: 'New York',
        country_id: 1,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    ],
  })
  findCitiesByCountry(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findCitiesByCountry(id);
  }
}
